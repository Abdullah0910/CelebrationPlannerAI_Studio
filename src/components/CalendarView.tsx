import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  PartyPopper,
  Eye,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { EventItem, TaskItem } from '../types';
import { formatDatePretty, formatEventCountdown } from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface CalendarViewProps {
  onOpenCreateEvent: () => void;
  onOpenAddTask: () => void;
  onInspectEvent?: (event: EventItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenCreateEvent,
  onOpenAddTask,
  onInspectEvent,
}) => {
  const {
    events,
    tasks,
    selectedEventId,
    setSelectedEventId,
    toggleTask,
    theme,
  } = useEventPlanner();

  const themeCfg = THEME_CONFIGS[theme];

  // Base current date for initial month view
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    return new Date();
  });

  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const currentEvents = selectedEventId === 'all' ? events : events.filter((e) => e.id === selectedEventId);
  const currentTasks = selectedEventId === 'all' ? tasks : tasks.filter((t) => t.eventId === selectedEventId);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    setSelectedDayStr(today.toISOString().split('T')[0]);
  };

  // Generate calendar grid days using native Date arithmetic (immune to month/year boundary bugs)
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    currentMonthDate
  );

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

  // Standard 35 or 42 grid cells
  const totalCells = startDayOfWeek + new Date(year, month + 1, 0).getDate() > 35 ? 42 : 35;
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(year, month, 1 - startDayOfWeek + i);
    const cellYear = cellDate.getFullYear();
    const cellMonth = cellDate.getMonth();
    const cellDay = cellDate.getDate();

    const dateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(cellDay).padStart(2, '0')}`;
    const isCurrentMonth = cellMonth === month && cellYear === year;

    calendarCells.push({
      dateStr,
      dayNum: cellDay,
      isCurrentMonth,
    });
  }

  // Items on selected day
  const selectedDayEvents = currentEvents.filter((e) => e.date === selectedDayStr);
  const selectedDayTasks = currentTasks.filter((t) => t.dueDate === selectedDayStr);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Celebration & Deadline Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological itinerary of celebration dates, vendor milestones, and task deliverables
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Filter calendar by event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Celebrations</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <button
            onClick={jumpToToday}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar + Day Inspection Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              {monthName}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const dayEvents = currentEvents.filter((e) => e.date === cell.dateStr);
              const dayTasks = currentTasks.filter((t) => t.dueDate === cell.dateStr);
              const isSelected = selectedDayStr === cell.dateStr;
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDayStr(cell.dateStr)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl text-left flex flex-col justify-between border transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                      : isToday
                      ? 'border-slate-400 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/40'
                      : cell.isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px]'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="w-full space-y-1 mt-1">
                    {dayEvents.slice(0, 1).map((evt) => (
                      <div
                        key={evt.id}
                        className="truncate text-[10px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-900/60 px-1 py-0.5 rounded-sm"
                      >
                        {evt.title}
                      </div>
                    ))}

                    {dayTasks.length > 0 && (
                      <div className="truncate text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="tabular-nums">{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Celebration Event Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Task Checklist Due</span>
            </div>
          </div>
        </div>

        {/* Day Schedule Inspection Drawer (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Schedule for
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                {formatDatePretty(selectedDayStr)}
              </h3>
            </div>

            {/* Events on this date */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Celebrations ({selectedDayEvents.length})
              </h4>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No events scheduled on this date.</p>
              ) : (
                selectedDayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
                      <span className="truncate">{evt.title}</span>
                      <span className="tabular-nums">{evt.time || '18:00'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>

                    {onInspectEvent && (
                      <div className="pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40">
                        <button
                          onClick={() => onInspectEvent(evt)}
                          className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Event Hub</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Tasks on this date */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Checklist Deadlines ({selectedDayTasks.length})
              </h4>
              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No task deadlines due on this date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {task.priority} Priority · {task.category}
                          {task.assignedTo && ` · ${task.assignedTo}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={onOpenCreateEvent}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Event</span>
            </button>
            <button
              onClick={onOpenAddTask}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

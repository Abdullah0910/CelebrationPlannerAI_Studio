import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Calendar,
  AlertCircle,
  Flag,
  UserCheck,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { TaskCategory, TaskItem, TaskPriority } from '../types';
import {
  calculateTaskSummary,
  formatDatePretty,
  getDaysUntil,
} from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface TasksViewProps {
  onOpenAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

const CATEGORIES: ('All' | TaskCategory)[] = [
  'All',
  'Planning',
  'Vendor',
  'Invitations',
  'Decor',
  'Logistics',
  'Day-of',
];

const PRIORITIES: ('All' | TaskPriority)[] = ['All', 'High', 'Medium', 'Low'];

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
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

  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const currentTasks = selectedEventId === 'all' ? tasks : tasks.filter((t) => t.eventId === selectedEventId);
  const summary = calculateTaskSummary(currentTasks);

  const filteredTasks = currentTasks.filter((task) => {
    if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchAssignee = (task.assignedTo || '').toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Planning Checklists & Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeEvent
              ? `Checklist milestones for "${activeEvent.title}"`
              : `Tracking ${tasks.length} tasks across all celebrations`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Celebrations Combined</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenAddTask}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 whitespace-nowrap ${themeCfg.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Progress */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Milestone Progress</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.progressPercentage}%
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${summary.progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.completed} of {summary.total} tasks completed
          </p>
        </div>

        {/* Overdue Warnings */}
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            summary.overdue > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-xs font-medium text-slate-500">Overdue Tasks</span>
          <div
            className={`mt-2 text-2xl font-bold tabular-nums ${
              summary.overdue > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {summary.overdue}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.overdue > 0 ? 'Urgent attention required' : 'No overdue checklist items'}
          </p>
        </div>

        {/* Due This Week */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Due in Next 7 Days</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.dueThisWeek + summary.dueToday}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.dueToday} due today
          </p>
        </div>

        {/* High Priority Pending */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">High-Priority Remaining</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.highPriorityPending}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Critical path celebration milestones
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, assignees, or instructions..."
              className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden capitalize"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Checklist Items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No tasks found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Checklist Item" to schedule your celebration deliverables.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const evt = events.find((e) => e.id === task.eventId);
            const daysUntil = getDaysUntil(task.dueDate);
            const isOverdue = !task.completed && daysUntil < 0;
            const isDueToday = !task.completed && daysUntil === 0;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 transition-colors ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-75'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                      {/* Priority unboxed label */}
                      <span
                        className={`font-semibold ${
                          task.priority === 'High'
                            ? 'text-rose-600 dark:text-rose-400'
                            : task.priority === 'Medium'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500">{task.category}</span>

                      {selectedEventId === 'all' && evt && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium truncate">
                            {evt.title}
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-semibold leading-snug ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1 italic">
                        {task.notes}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-600 font-semibold'
                              : isDueToday
                              ? 'text-amber-600 font-semibold'
                              : ''
                          }
                        >
                          {isOverdue
                            ? `Overdue (${Math.abs(daysUntil)}d ago)`
                            : isDueToday
                            ? 'Due Today'
                            : `Due ${formatDatePretty(task.dueDate)}`}
                        </span>
                      </span>

                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assigned to {task.assignedTo}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    aria-label={`Edit ${task.title}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

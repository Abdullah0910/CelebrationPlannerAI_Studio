import React from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  MapPin,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Utensils,
  PartyPopper,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import {
  calculateBudgetSummary,
  calculateGuestSummary,
  calculateTaskSummary,
  formatCurrency,
  formatDatePretty,
  formatEventCountdown,
  getDaysUntil,
} from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface DashboardViewProps {
  onOpenCreateEvent: () => void;
  onOpenAddExpense: () => void;
  onOpenAddGuest: () => void;
  onOpenAddTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateEvent,
  onOpenAddExpense,
  onOpenAddGuest,
  onOpenAddTask,
}) => {
  const {
    events,
    expenses,
    guests,
    tasks,
    selectedEventId,
    setSelectedEventId,
    setActiveTab,
    toggleTask,
    theme,
  } = useEventPlanner();

  const themeCfg = THEME_CONFIGS[theme];

  // Filtered dataset based on selectedEventId
  const currentEvents =
    selectedEventId === 'all'
      ? events
      : events.filter((e) => e.id === selectedEventId);

  const currentExpenses =
    selectedEventId === 'all'
      ? expenses
      : expenses.filter((exp) => exp.eventId === selectedEventId);

  const currentGuests =
    selectedEventId === 'all'
      ? guests
      : guests.filter((g) => g.eventId === selectedEventId);

  const currentTasks =
    selectedEventId === 'all'
      ? tasks
      : tasks.filter((t) => t.eventId === selectedEventId);

  // Aggregated totals
  const totalBudgetCombined = currentEvents.reduce((acc, evt) => acc + evt.budgetTotal, 0);
  const budgetSummary = calculateBudgetSummary(totalBudgetCombined, currentExpenses);
  const guestSummary = calculateGuestSummary(currentGuests);
  const taskSummary = calculateTaskSummary(currentTasks);

  // Find nearest upcoming event
  const sortedUpcomingEvents = [...currentEvents].sort((a, b) => {
    return new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime();
  });

  const nextEvent = sortedUpcomingEvents.find((evt) => getDaysUntil(evt.date) >= 0) || sortedUpcomingEvents[0];

  // Urgent tasks (overdue or due within 7 days, uncompleted)
  const urgentTasks = currentTasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(`${a.dueDate}T00:00:00`).getTime() - new Date(`${b.dueDate}T00:00:00`).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-medium text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebration Orchestration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            {selectedEventId === 'all'
              ? 'Organize Extraordinary Celebrations'
              : currentEvents[0]?.title || 'Celebration Overview'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedEventId === 'all'
              ? `You are coordinating ${events.length} celebrations with ${guestSummary.totalHeadcount} confirmed attendees and ${formatCurrency(budgetSummary.totalBudget)} in total planned budgets.`
              : currentEvents[0]?.description || 'Manage every detail from invitations to day-of execution.'}
          </p>

          {/* Quick Action Buttons Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateEvent}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 ${themeCfg.accentBg}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Celebration</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={onOpenAddGuest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite Guest</span>
            </button>
            <button
              onClick={onOpenAddTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 bg-gradient-to-l from-amber-500/30 to-transparent pointer-events-none" />
      </section>

      {/* KPI Overview Metrics (4 columns on desktop) */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Celebrations */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Celebrations</span>
            <PartyPopper className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {currentEvents.length}
            </span>
            <span className="text-xs text-slate-500">events planned</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Next date</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {nextEvent ? formatDatePretty(nextEvent.date) : 'None'}
            </span>
          </div>
        </div>

        {/* Metric 2: Financial Health */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Budget Committed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(budgetSummary.totalActual)}
            </span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Total planned</span>
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {formatCurrency(budgetSummary.totalBudget)}
            </span>
          </div>
        </div>

        {/* Metric 3: Headcount & RSVPs */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Confirmed Attendees</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {guestSummary.totalHeadcount}
            </span>
            <span className="text-xs text-slate-500">guests</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Response rate</span>
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {Math.round(guestSummary.rsvpRate)}%
            </span>
          </div>
        </div>

        {/* Metric 4: Tasks Progress */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Planning Checklists</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {taskSummary.progressPercentage}%
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Pending tasks</span>
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {taskSummary.pending} remaining
            </span>
          </div>
        </div>
      </section>

      {/* Overbudget Warning Alert if applicable */}
      {budgetSummary.isOverBudget && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Budget Limit Exceeded by {formatCurrency(budgetSummary.overspendingAmount)}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Actual expenses ({formatCurrency(budgetSummary.totalActual)}) have surpassed your planned celebration budget limit ({formatCurrency(budgetSummary.totalBudget)}).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 rounded-lg whitespace-nowrap"
          >
            Review Budget
          </button>
        </div>
      )}

      {/* Main Grid: Nearest Spotlight + Urgent Tasks & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Card (2 cols on desktop) */}
        {nextEvent && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Event Cover Image */}
              <div className="relative aspect-21/9 sm:aspect-16/7 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {nextEvent.coverImage ? (
                  <img
                    src={nextEvent.coverImage}
                    alt={nextEvent.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <PartyPopper className="w-8 h-8" />
                  </div>
                )}
                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                      <span>{nextEvent.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatEventCountdown(nextEvent.date)}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight">
                      {nextEvent.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Event Meta Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-semibold">{formatDatePretty(nextEvent.date)}</p>
                      <p className="text-[11px] text-slate-400">{nextEvent.time || '18:00'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold truncate">{nextEvent.venue}</p>
                      <p className="text-[11px] text-slate-400 truncate">{nextEvent.venueAddress || 'Address on file'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-semibold">{nextEvent.targetGuestCount} Target Guests</p>
                      <p className="text-[11px] text-slate-400">Target capacity</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {nextEvent.description}
                </p>
              </div>
            </div>

            {/* Card Footer action strip */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Budget: <span className="text-slate-900 dark:text-slate-200 font-semibold tabular-nums">{formatCurrency(nextEvent.budgetTotal)}</span>
              </span>
              <button
                onClick={() => {
                  setSelectedEventId(nextEvent.id);
                  setActiveTab('events');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>View Event Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Priority Checklists / Urgent Tasks (1 col on desktop) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Immediate Action Items
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
              >
                All ({taskSummary.pending})
              </button>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  All urgent items are completed!
                </p>
                <p className="text-[11px] text-slate-400">No overdue or pending critical tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((task) => {
                  const daysUntil = getDaysUntil(task.dueDate);
                  const isOverdue = daysUntil < 0;

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                          {task.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                            {formatDatePretty(task.dueDate)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {taskSummary.completed} of {taskSummary.total} complete
            </span>
            <button
              onClick={onOpenAddTask}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Checklist Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Celebrations Showcase Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Upcoming Celebrations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any event to view and manage its specific budget, guests, and checklists
            </p>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const evtExpenses = expenses.filter((e) => e.eventId === evt.id);
            const evtSpent = evtExpenses.reduce((s, e) => s + e.actualCost, 0);
            const evtGuests = guests.filter((g) => g.eventId === evt.id);
            const confirmedAttendees = evtGuests.filter((g) => g.rsvpStatus === 'Attending').length;

            return (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedEventId(evt.id);
                  setActiveTab('events');
                }}
                className={`group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border p-4 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                  {evt.coverImage ? (
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                    {formatEventCountdown(evt.date)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{evt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDatePretty(evt.date)}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {evt.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {evt.venue}
                  </p>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="tabular-nums">
                      {confirmedAttendees} confirmed guests
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatCurrency(evtSpent)} spent
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

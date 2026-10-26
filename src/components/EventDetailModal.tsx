import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  Edit3,
  Plus,
  Utensils,
  Sparkles,
  AlertTriangle,
  Tag,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { EventItem, ExpenseItem, GuestItem, TaskItem } from '../types';
import {
  calculateBudgetSummary,
  calculateGuestSummary,
  calculateTaskSummary,
  formatCurrency,
  formatDatePretty,
  formatEventCountdown,
  sanitizeImageUrl,
} from '../utils/eventCalculations';
import { useEventPlanner } from '../context/EventPlannerContext';
import { THEME_CONFIGS } from '../types/theme';

interface EventDetailModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onEdit: (event: EventItem) => void;
  onOpenAddExpense: () => void;
  onOpenAddGuest: () => void;
  onOpenAddTask: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  onClose,
  onEdit,
  onOpenAddExpense,
  onOpenAddGuest,
  onOpenAddTask,
}) => {
  const { expenses, guests, tasks, toggleTask, updateGuestRsvp, theme } = useEventPlanner();
  const themeCfg = THEME_CONFIGS[theme];

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'budget' | 'guests' | 'tasks'>('overview');

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const eventGuests = guests.filter((g) => g.eventId === event.id);
  const eventTasks = tasks.filter((t) => t.eventId === event.id);

  const budgetSummary = calculateBudgetSummary(event.budgetTotal, eventExpenses);
  const guestSummary = calculateGuestSummary(eventGuests);
  const taskSummary = calculateTaskSummary(eventTasks);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cover Hero Banner */}
        <div className="relative aspect-21/9 sm:aspect-16/6 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
          {event.coverImage ? (
            <img
              src={sanitizeImageUrl(event.coverImage)}
              alt={event.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/celebration_wedding_1792744715346.jpg';
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Sparkles className="w-10 h-10" />
            </div>
          )}

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-6">
            <div className="w-full text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <span>{event.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDatePretty(event.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatEventCountdown(event.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{event.status}</span>
                </div>
                <h2 id="event-detail-title" className="text-xl sm:text-2xl font-bold font-display leading-tight">
                  {event.title}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{event.venue} {event.venueAddress ? `· ${event.venueAddress}` : ''}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEdit(event)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Event</span>
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('budget')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'budget'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Budget & Costs ({eventExpenses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('guests')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'guests'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Guests & RSVPs ({eventGuests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'tasks'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Checklist Tasks ({eventTasks.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Description & Planning Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Celebration Vision
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {event.description || 'No description provided.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Private Planning Notes
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {event.notes || 'No private notes saved.'}
                  </p>
                </div>
              </div>

              {/* 3 Overview Stat Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Budget Column */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Budget Health</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(budgetSummary.totalActual)} / {formatCurrency(budgetSummary.totalBudget)}
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        budgetSummary.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, budgetSummary.spentPercentage)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {budgetSummary.isOverBudget
                      ? `Over budget by ${formatCurrency(budgetSummary.overspendingAmount)}`
                      : `${formatCurrency(budgetSummary.remainingBudget)} remaining`}
                  </p>
                </div>

                {/* Headcount Column */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Attendee Roster</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {guestSummary.totalHeadcount} Attendees
                  </div>
                  <p className="text-xs text-slate-500">
                    Target: {event.targetGuestCount} guests · {guestSummary.attending} confirmed
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {guestSummary.pending} pending · {guestSummary.tentative} tentative
                  </p>
                </div>

                {/* Task Column */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Checklists</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  </div>
                  <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {taskSummary.progressPercentage}% Done
                  </div>
                  <p className="text-xs text-slate-500">
                    {taskSummary.completed} of {taskSummary.total} completed
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {taskSummary.overdue > 0 ? `${taskSummary.overdue} overdue items` : 'No overdue tasks'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'budget' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Expenses & Vendor Contracts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total: {formatCurrency(budgetSummary.totalActual)} spent of {formatCurrency(budgetSummary.totalBudget)} budget
                  </p>
                </div>
                <button
                  onClick={onOpenAddExpense}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${themeCfg.accentBg}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>

              {eventExpenses.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">No expenses logged for this celebration yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {eventExpenses.map((exp) => (
                    <div key={exp.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{exp.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {exp.category} {exp.vendor ? `· ${exp.vendor}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(exp.actualCost)}
                        </p>
                        <span className={`text-[10px] font-medium ${exp.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {exp.isPaid ? 'Paid in Full' : `Paid: ${formatCurrency(exp.paidAmount)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'guests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Guest Attendee Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    {guestSummary.totalHeadcount} confirmed headcount · {guestSummary.totalInvited} invited
                  </p>
                </div>
                <button
                  onClick={onOpenAddGuest}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${themeCfg.accentBg}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invite Guest</span>
                </button>
              </div>

              {eventGuests.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">No guests invited to this celebration yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {eventGuests.map((guest) => (
                    <div key={guest.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{guest.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {guest.group} {guest.tableNumber ? `· ${guest.tableNumber}` : ''} {guest.dietary !== 'None' ? `· ${guest.dietary}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 tabular-nums">
                          {guest.plusOnes > 0 ? `+${guest.plusOnes} guest` : 'Single'}
                        </span>
                        <select
                          value={guest.rsvpStatus}
                          onChange={(e) => updateGuestRsvp(guest.id, e.target.value as any)}
                          className="px-2 py-1 text-xs rounded-md border text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                          <option value="Attending">Attending</option>
                          <option value="Pending">Pending</option>
                          <option value="Tentative">Tentative</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Checklists & Milestones
                  </h3>
                  <p className="text-xs text-slate-500">
                    {taskSummary.completed} of {taskSummary.total} deliverables completed
                  </p>
                </div>
                <button
                  onClick={onOpenAddTask}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${themeCfg.accentBg}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {eventTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">No tasks scheduled for this celebration yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {eventTasks.map((task) => (
                    <div key={task.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {task.priority} Priority · Due {formatDatePretty(task.dueDate)}
                            {task.assignedTo ? ` · ${task.assignedTo}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

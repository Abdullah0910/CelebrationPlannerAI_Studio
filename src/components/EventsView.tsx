import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Edit3,
  Trash2,
  Grid,
  List,
  Sparkles,
  ArrowRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import {
  DateFilterOption,
  EventCategoryFilter,
  EventItem,
  EventStatusFilter,
  EventType,
} from '../types';
import {
  calculateBudgetSummary,
  calculateGuestSummary,
  calculateTaskSummary,
  filterEventsByDate,
  formatCurrency,
  formatDatePretty,
  formatEventCountdown,
} from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface EventsViewProps {
  onOpenCreateEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string) => void;
  onInspectEvent: (event: EventItem) => void;
}

const CATEGORIES: EventCategoryFilter[] = [
  'All',
  'Birthday',
  'Wedding',
  'Anniversary',
  'Graduation',
  'Family Gathering',
  'Festival',
  'Corporate',
];

const STATUSES: { value: EventStatusFilter; label: string }[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DATE_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'All', label: 'All Dates' },
  { value: 'upcoming-30', label: 'Upcoming (30 Days)' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-90', label: 'Next 90 Days' },
  { value: 'past', label: 'Past Celebrations' },
];

export const EventsView: React.FC<EventsViewProps> = ({
  onOpenCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onInspectEvent,
}) => {
  const {
    events,
    expenses,
    guests,
    tasks,
    selectedEventId,
    setSelectedEventId,
    theme,
  } = useEventPlanner();

  const themeCfg = THEME_CONFIGS[theme];

  const [categoryFilter, setCategoryFilter] = useState<EventCategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter pipeline: Date -> Category -> Status -> Search
  const dateFiltered = filterEventsByDate(events, dateFilter);

  const filteredEvents = dateFiltered.filter((evt) => {
    if (categoryFilter !== 'All' && evt.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && evt.status !== statusFilter) return false;
    if (localSearch.trim().length > 0) {
      const q = localSearch.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchVenue = evt.venue.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      if (!matchTitle && !matchVenue && !matchDesc) return false;
    }
    return true;
  });

  const hasActiveFilters =
    categoryFilter !== 'All' || statusFilter !== 'All' || dateFilter !== 'All' || localSearch.trim().length > 0;

  const handleResetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setDateFilter('All');
    setLocalSearch('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Celebration Events
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize weddings, birthdays, anniversaries, corporate galas, and gatherings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenCreateEvent}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 whitespace-nowrap ${themeCfg.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Celebration</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by event title, venue name, or description..."
              className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Date:</span>
            <select
              aria-label="Filter events by date timeframe"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
            <select
              aria-label="Filter events by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatusFilter)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Category Filter Buttons */}
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

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              No celebrations match your filters
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your date timeframe, category, or search keywords.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Clear All Filters
              </button>
            )}
            <button
              onClick={onOpenCreateEvent}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${themeCfg.accentBg}`}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Celebration</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const evtExpenses = expenses.filter((e) => e.eventId === evt.id);
            const budgetData = calculateBudgetSummary(evt.budgetTotal, evtExpenses);

            const evtGuests = guests.filter((g) => g.eventId === evt.id);
            const guestData = calculateGuestSummary(evtGuests);

            const evtTasks = tasks.filter((t) => t.eventId === evt.id);
            const taskData = calculateTaskSummary(evtTasks);

            return (
              <div
                key={evt.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onInspectEvent(evt);
                  }
                }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Image cover */}
                  <div
                    onClick={() => onInspectEvent(evt)}
                    className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 cursor-pointer group"
                  >
                    {evt.coverImage ? (
                      <img
                        src={evt.coverImage}
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
                      {formatEventCountdown(evt.date)}
                    </div>
                  </div>

                  {/* Category and date unboxed */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-medium text-amber-600 dark:text-amber-400">{evt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDatePretty(evt.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{evt.status}</span>
                  </div>

                  <h3
                    onClick={() => onInspectEvent(evt)}
                    className="text-lg font-bold font-display text-slate-900 dark:text-white leading-snug line-clamp-1 cursor-pointer hover:text-amber-600 transition-colors"
                  >
                    {evt.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </p>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {evt.description}
                  </p>

                  {/* Summary Metric Strips */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    {/* Budget progress */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Budget Progress</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {formatCurrency(budgetData.totalActual)} / {formatCurrency(budgetData.totalBudget)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            budgetData.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, budgetData.spentPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Guests & Tasks quick info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{guestData.totalHeadcount} confirmed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{taskData.completed}/{taskData.total} tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onInspectEvent(evt)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Hub</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEvent(evt)}
                      aria-label={`Edit ${evt.title}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      aria-label={`Delete ${evt.title}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
          {filteredEvents.map((evt) => {
            const evtExpenses = expenses.filter((e) => e.eventId === evt.id);
            const budgetData = calculateBudgetSummary(evt.budgetTotal, evtExpenses);
            const evtGuests = guests.filter((g) => g.eventId === evt.id);
            const guestData = calculateGuestSummary(evtGuests);

            return (
              <div
                key={evt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div
                  onClick={() => onInspectEvent(evt)}
                  className="flex items-start sm:items-center gap-4 cursor-pointer flex-1 min-w-0"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {evt.coverImage ? (
                      <img
                        src={evt.coverImage}
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{evt.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDatePretty(evt.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{evt.status}</span>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white truncate">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {evt.venue} · {guestData.totalHeadcount} confirmed guests · Budget: {formatCurrency(budgetData.totalBudget)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onInspectEvent(evt)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Hub</span>
                  </button>
                  <button
                    onClick={() => onEditEvent(evt)}
                    aria-label={`Edit ${evt.title}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    aria-label={`Delete ${evt.title}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

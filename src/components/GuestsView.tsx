import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Utensils,
  Search,
  Filter,
  Edit3,
  Trash2,
  Send,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { GuestGroupFilter, GuestItem, GuestRsvpFilter, RsvpStatus } from '../types';
import { calculateGuestSummary } from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface GuestsViewProps {
  onOpenAddGuest: () => void;
  onEditGuest: (guest: GuestItem) => void;
  onDeleteGuest: (id: string) => void;
}

const GROUPS: GuestGroupFilter[] = ['All', 'Family', 'Friends', 'VIP', 'Colleagues', 'Vendors'];
const RSVP_FILTERS: GuestRsvpFilter[] = ['All', 'Attending', 'Pending', 'Tentative', 'Declined'];

export const GuestsView: React.FC<GuestsViewProps> = ({
  onOpenAddGuest,
  onEditGuest,
  onDeleteGuest,
}) => {
  const {
    events,
    guests,
    selectedEventId,
    setSelectedEventId,
    updateGuestRsvp,
    theme,
  } = useEventPlanner();

  const themeCfg = THEME_CONFIGS[theme];

  const [groupFilter, setGroupFilter] = useState<GuestGroupFilter>('All');
  const [rsvpFilter, setRsvpFilter] = useState<GuestRsvpFilter>('All');
  const [search, setSearch] = useState('');

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const currentGuests = selectedEventId === 'all' ? guests : guests.filter((g) => g.eventId === selectedEventId);
  const summary = calculateGuestSummary(currentGuests);

  const filteredGuests = currentGuests.filter((guest) => {
    if (groupFilter !== 'All' && guest.group !== groupFilter) return false;
    if (rsvpFilter !== 'All' && guest.rsvpStatus !== rsvpFilter) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const matchName = guest.name.toLowerCase().includes(q);
      const matchEmail = (guest.email || '').toLowerCase().includes(q);
      const matchTable = (guest.tableNumber || '').toLowerCase().includes(q);
      const matchDiet = (guest.dietary || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTable && !matchDiet) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Guest Management & RSVPs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeEvent
              ? `Attendee list and dietary requirements for "${activeEvent.title}"`
              : `Managing ${guests.length} invited guests across all celebrations`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Filter guests by event"
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
            onClick={onOpenAddGuest}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 whitespace-nowrap ${themeCfg.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Attendance Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed Attending */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Attending Headcount</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.totalHeadcount}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.attending} primary guests + plus-ones
          </p>
        </div>

        {/* Pending RSVPs */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Awaiting Response</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.pending}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Invitations sent or pending follow-up
          </p>
        </div>

        {/* Tentative */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tentative</span>
            <HelpCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {summary.tentative}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            May attend (+{summary.potentialHeadcount - summary.totalHeadcount} potential seats)
          </p>
        </div>

        {/* Total Invited & Response Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Response Rate</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {Math.round(summary.rsvpRate)}%
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.totalInvited} invited · {summary.declined} declined
          </p>
        </div>
      </div>

      {/* Dietary Summary Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Utensils className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Dietary Requirements Summary for Catering:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
          {Object.entries(summary.dietaryBreakdown)
            .filter(([diet, count]) => diet !== 'None' && count > 0)
            .map(([diet, count]) => (
              <span key={diet} className="inline-flex items-center gap-1 font-medium">
                <span className="text-slate-900 dark:text-white font-bold tabular-nums">{count}</span>
                <span>{diet}</span>
              </span>
            ))}
          {Object.entries(summary.dietaryBreakdown).every(([diet, count]) => diet === 'None' || count === 0) && (
            <span className="text-slate-400 italic">Standard meal preferences for all guests</span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests by name, email, dietary preference, or table..."
              className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">RSVP:</span>
            <select
              aria-label="Filter guests by RSVP response"
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value as GuestRsvpFilter)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {RSVP_FILTERS.map((rf) => (
                <option key={rf} value={rf}>
                  {rf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Group tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GROUPS.map((grp) => (
            <button
              key={grp}
              onClick={() => setGroupFilter(grp)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                groupFilter === grp
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Group</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4 text-center">+1s</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Dietary Preference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No guests found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Guest" to add attendees and invitations.</p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const evt = events.find((e) => e.id === guest.eventId);

                  return (
                    <tr
                      key={guest.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">{guest.name}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                          {guest.email && <span>{guest.email}</span>}
                          {guest.phone && <span>· {guest.phone}</span>}
                        </div>
                        {selectedEventId === 'all' && evt && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                            For: {evt.title}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {guest.group}
                      </td>

                      {/* Interactive RSVP Status Selector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          aria-label={`Update RSVP for ${guest.name}`}
                          value={guest.rsvpStatus}
                          onChange={(e) => updateGuestRsvp(guest.id, e.target.value as RsvpStatus)}
                          className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-hidden ${
                            guest.rsvpStatus === 'Attending'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : guest.rsvpStatus === 'Declined'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                              : guest.rsvpStatus === 'Tentative'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                          }`}
                        >
                          <option value="Attending">Attending</option>
                          <option value="Pending">Pending</option>
                          <option value="Tentative">Tentative</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums font-medium text-slate-700 dark:text-slate-300">
                        {guest.plusOnes > 0 ? `+${guest.plusOnes}` : '0'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {guest.tableNumber || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className={guest.dietary !== 'None' ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>
                          {guest.dietary}
                        </span>
                        {guest.dietaryNotes && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {guest.dietaryNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditGuest(guest)}
                            aria-label={`Edit ${guest.name}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteGuest(guest.id)}
                            aria-label={`Remove ${guest.name}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Users2, Utensils, Hash } from 'lucide-react';
import {
  DietaryRequirement,
  GuestGroup,
  GuestItem,
  InvitationStatus,
  RsvpStatus,
} from '../types';
import { validateGuestInput } from '../utils/eventCalculations';
import { useEventPlanner } from '../context/EventPlannerContext';
import { THEME_CONFIGS } from '../types/theme';

interface GuestModalProps {
  isOpen: boolean;
  guestToEdit?: GuestItem | null;
  defaultEventId?: string;
  onClose: () => void;
  onSave: (data: Omit<GuestItem, 'id'>) => void;
}

const GROUPS: GuestGroup[] = ['Family', 'Friends', 'VIP', 'Colleagues', 'Vendors'];
const RSVP_STATUSES: RsvpStatus[] = ['Attending', 'Declined', 'Tentative', 'Pending'];
const INVITATION_STATUSES: InvitationStatus[] = ['Not Sent', 'Sent', 'Delivered'];
const DIETARY_OPTIONS: DietaryRequirement[] = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Nut Allergy',
  'Other',
];

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  guestToEdit,
  defaultEventId,
  onClose,
  onSave,
}) => {
  const { events, selectedEventId, theme } = useEventPlanner();
  const themeCfg = THEME_CONFIGS[theme];

  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState<GuestGroup>('Friends');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('Pending');
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>('Sent');
  const [dietary, setDietary] = useState<DietaryRequirement>('None');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (guestToEdit) {
      setEventId(guestToEdit.eventId);
      setName(guestToEdit.name);
      setEmail(guestToEdit.email || '');
      setPhone(guestToEdit.phone || '');
      setGroup(guestToEdit.group);
      setRsvpStatus(guestToEdit.rsvpStatus);
      setInvitationStatus(guestToEdit.invitationStatus);
      setDietary(guestToEdit.dietary);
      setDietaryNotes(guestToEdit.dietaryNotes || '');
      setPlusOnes(guestToEdit.plusOnes || 0);
      setTableNumber(guestToEdit.tableNumber || '');
      setNotes(guestToEdit.notes || '');
    } else {
      const initialEventId =
        defaultEventId || (selectedEventId !== 'all' ? selectedEventId : events[0]?.id || '');
      setEventId(initialEventId);
      setName('');
      setEmail('');
      setPhone('');
      setGroup('Friends');
      setRsvpStatus('Pending');
      setInvitationStatus('Sent');
      setDietary('None');
      setDietaryNotes('');
      setPlusOnes(0);
      setTableNumber('');
      setNotes('');
    }
    setErrors({});
  }, [guestToEdit, isOpen, defaultEventId, selectedEventId, events]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      eventId: eventId || events[0]?.id || '',
      name,
      email,
      phone: phone || undefined,
      group,
      rsvpStatus,
      invitationStatus,
      dietary,
      dietaryNotes: dietaryNotes || undefined,
      plusOnes: Number(plusOnes) || 0,
      tableNumber: tableNumber || undefined,
      notes: notes || undefined,
    };

    const validation = validateGuestInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 id="guest-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {guestToEdit ? 'Edit Guest' : 'Add Guest to Celebration'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage invitation delivery, RSVP responses, and dining needs
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Event Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Celebration Event <span className="text-rose-500">*</span>
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Guest Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Lucas Graham & Guest"
                className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="lucas@example.com"
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Group & RSVP Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Guest Group
              </label>
              <div className="relative">
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as GuestGroup)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                >
                  {GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
                <Users2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                RSVP Response
              </label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
              >
                {RSVP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Plus Ones & Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Plus Ones (+Guests)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={plusOnes}
                onChange={(e) => setPlusOnes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Invitation Status
              </label>
              <select
                value={invitationStatus}
                onChange={(e) => setInvitationStatus(e.target.value as InvitationStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
              >
                {INVITATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Table Assignment
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 2"
                  className="w-full px-3.5 py-2.5 pl-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Dietary Preference
              </label>
              <div className="relative">
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value as DietaryRequirement)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                >
                  {DIETARY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Utensils className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Dietary / Allergy Details
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="e.g. Severe peanut allergy"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Guest Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High school friend, needs wheelchair-accessible ramp."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${themeCfg.accentBg}`}
            >
              {guestToEdit ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

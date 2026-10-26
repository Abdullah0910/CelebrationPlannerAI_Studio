import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, DollarSign, Image } from 'lucide-react';
import { EventItem, EventType, EventStatus } from '../types';
import { validateEventInput } from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';
import { useEventPlanner } from '../context/EventPlannerContext';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit?: EventItem | null;
  onClose: () => void;
  onSave: (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CATEGORIES: EventType[] = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Graduation',
  'Family Gathering',
  'Festival',
  'Corporate',
];

const STATUSES: EventStatus[] = ['planning', 'confirmed', 'completed', 'cancelled'];

const DEFAULT_COVER_PRESETS = [
  { label: 'Wedding & Gala', url: '/src/assets/images/celebration_wedding_1792744715346.jpg' },
  { label: 'Birthday & Feast', url: '/src/assets/images/celebration_birthday_1792744715712.jpg' },
  { label: 'Corporate & Awards', url: '/src/assets/images/celebration_corporate_1792744716935.jpg' },
  { label: 'Festival & Garden', url: '/src/assets/images/celebration_festival_1792744716662.jpg' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  onClose,
  onSave,
}) => {
  const { theme } = useEventPlanner();
  const themeCfg = THEME_CONFIGS[theme];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventType>('Anniversary');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [description, setDescription] = useState('');
  const [targetGuestCount, setTargetGuestCount] = useState<number>(50);
  const [budgetTotal, setBudgetTotal] = useState<number>(5000);
  const [status, setStatus] = useState<EventStatus>('planning');
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_PRESETS[0].url);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setCategory(eventToEdit.category);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time || '18:00');
      setVenue(eventToEdit.venue);
      setVenueAddress(eventToEdit.venueAddress || '');
      setDescription(eventToEdit.description);
      setTargetGuestCount(eventToEdit.targetGuestCount);
      setBudgetTotal(eventToEdit.budgetTotal);
      setStatus(eventToEdit.status);
      setCoverImage(eventToEdit.coverImage || DEFAULT_COVER_PRESETS[0].url);
      setNotes(eventToEdit.notes || '');
    } else {
      // Defaults for new event
      setTitle('');
      setCategory('Birthday');
      // Default to 14 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setDate(defaultDate.toISOString().split('T')[0]);
      setTime('18:30');
      setVenue('');
      setVenueAddress('');
      setDescription('');
      setTargetGuestCount(60);
      setBudgetTotal(4500);
      setStatus('planning');
      setCoverImage(DEFAULT_COVER_PRESETS[1].url);
      setNotes('');
    }
    setErrors({});
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      category,
      date,
      time,
      venue,
      venueAddress,
      description,
      targetGuestCount: Number(targetGuestCount) || 0,
      budgetTotal: Number(budgetTotal) || 0,
      status,
      coverImage,
      notes,
    };

    const validation = validateEventInput(payload);
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
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 id="event-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {eventToEdit ? 'Edit Celebration' : 'Plan New Celebration'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fill in the key details to organize your upcoming event
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Celebration Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Liam's 18th Milestone Birthday Bash"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Planning Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden capitalize"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st} className="capitalize">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Venue & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Venue Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value);
                    if (errors.venue) setErrors((prev) => ({ ...prev, venue: '' }));
                  }}
                  placeholder="e.g. The Glasshouse Garden"
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              {errors.venue && <p className="mt-1 text-xs text-rose-500">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Venue Address
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g. 742 Evergreen Terrace, Suite 4B"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Budget & Target Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Total Budget ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Guest Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={targetGuestCount}
                  onChange={(e) => setTargetGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Cover Image Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Celebration Theme Visual
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {DEFAULT_COVER_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                    coverImage === preset.url
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">{preset.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or enter custom image URL"
                className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:border-slate-500 focus:outline-hidden"
              />
              <Image className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Description & Vision
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Atmosphere, special milestones, or vision for the celebration..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Planning Notes (Private)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vendor contacts, run of show details, or secret surprises..."
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
              {eventToEdit ? 'Save Changes' : 'Create Celebration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, Flag, CheckSquare } from 'lucide-react';
import { TaskCategory, TaskItem, TaskPriority } from '../types';
import { validateTaskInput } from '../utils/eventCalculations';
import { useEventPlanner } from '../context/EventPlannerContext';
import { THEME_CONFIGS } from '../types/theme';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: TaskItem | null;
  defaultEventId?: string;
  onClose: () => void;
  onSave: (data: Omit<TaskItem, 'id'>) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Planning',
  'Vendor',
  'Invitations',
  'Decor',
  'Logistics',
  'Day-of',
];

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  defaultEventId,
  onClose,
  onSave,
}) => {
  const { events, selectedEventId, theme } = useEventPlanner();
  const themeCfg = THEME_CONFIGS[theme];

  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Planning');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (taskToEdit) {
      setEventId(taskToEdit.eventId);
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setAssignedTo(taskToEdit.assignedTo || '');
      setNotes(taskToEdit.notes || '');
      setCompleted(taskToEdit.completed);
    } else {
      const initialEventId =
        defaultEventId || (selectedEventId !== 'all' ? selectedEventId : events[0]?.id || '');
      setEventId(initialEventId);
      setTitle('');
      setCategory('Planning');
      setPriority('Medium');
      // Default due in 7 days
      const due = new Date();
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);
      setAssignedTo('');
      setNotes('');
      setCompleted(false);
    }
    setErrors({});
  }, [taskToEdit, isOpen, defaultEventId, selectedEventId, events]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      eventId: eventId || events[0]?.id || '',
      title,
      category,
      priority,
      dueDate,
      assignedTo: assignedTo || undefined,
      notes: notes || undefined,
      completed,
    };

    const validation = validateTaskInput(payload);
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
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 id="task-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {taskToEdit ? 'Edit Checklist Item' : 'New Celebration Task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign responsibilities, set deadlines, and track milestones
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
            <label htmlFor="task-event-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Celebration Event <span className="text-rose-500">*</span>
            </label>
            <select
              id="task-event-select"
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

          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task Checklist Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              maxLength={150}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Schedule cake tasting and flavor selection"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
            />
            {errors.title && <p id="task-title-error" className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-category-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
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
              <label htmlFor="task-priority-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
                <Flag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Due Date & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due-date-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Deadline <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="task-due-date-input"
                  type="date"
                  aria-invalid={!!errors.dueDate}
                  aria-describedby={errors.dueDate ? 'task-due-date-error' : undefined}
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                  }}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              {errors.dueDate && <p id="task-due-date-error" className="mt-1 text-xs text-rose-500">{errors.dueDate}</p>}
            </div>

            <div>
              <label htmlFor="task-assignee-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Assigned Person
              </label>
              <div className="relative">
                <input
                  id="task-assignee-input"
                  type="text"
                  maxLength={100}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Wedding Coordinator"
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="taskCompletedCheckbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="taskCompletedCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Mark as completed
            </label>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="task-notes-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task Notes / Instructions
            </label>
            <textarea
              id="task-notes-input"
              rows={2}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring fabric swatches to match tablecloth colors."
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
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

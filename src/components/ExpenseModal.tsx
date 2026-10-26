import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, Briefcase } from 'lucide-react';
import { ExpenseCategory, ExpenseItem } from '../types';
import { parseSafeNumber, validateExpenseInput } from '../utils/eventCalculations';
import { useEventPlanner } from '../context/EventPlannerContext';
import { THEME_CONFIGS } from '../types/theme';

interface ExpenseModalProps {
  isOpen: boolean;
  expenseToEdit?: ExpenseItem | null;
  defaultEventId?: string;
  onClose: () => void;
  onSave: (data: Omit<ExpenseItem, 'id'>) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Venue',
  'Catering',
  'Decor & Florals',
  'Photography & Video',
  'Entertainment & Music',
  'Attire & Beauty',
  'Invitations & Favors',
  'Transportation & Logistics',
  'Miscellaneous',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  expenseToEdit,
  defaultEventId,
  onClose,
  onSave,
}) => {
  const { events, selectedEventId, theme } = useEventPlanner();
  const themeCfg = THEME_CONFIGS[theme];

  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Catering');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
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
    if (expenseToEdit) {
      setEventId(expenseToEdit.eventId);
      setName(expenseToEdit.name);
      setCategory(expenseToEdit.category);
      setEstimatedCost(expenseToEdit.estimatedCost);
      setActualCost(expenseToEdit.actualCost);
      setPaidAmount(expenseToEdit.paidAmount);
      setIsPaid(expenseToEdit.isPaid);
      setDueDate(expenseToEdit.dueDate || '');
      setVendor(expenseToEdit.vendor || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      const initialEventId =
        defaultEventId || (selectedEventId !== 'all' ? selectedEventId : events[0]?.id || '');
      setEventId(initialEventId);
      setName('');
      setCategory('Catering');
      setEstimatedCost(500);
      setActualCost(500);
      setPaidAmount(0);
      setIsPaid(false);
      setDueDate('');
      setVendor('');
      setNotes('');
    }
    setErrors({});
  }, [expenseToEdit, isOpen, defaultEventId, selectedEventId, events]);

  if (!isOpen) return null;

  const handlePaidToggle = (checked: boolean) => {
    setIsPaid(checked);
    if (checked && paidAmount === 0 && actualCost > 0) {
      setPaidAmount(actualCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actual = parseSafeNumber(actualCost, 0, 0);
    const paid = parseSafeNumber(paidAmount, 0, 0);

    const payload = {
      eventId: eventId || events[0]?.id || '',
      name,
      category,
      estimatedCost: parseSafeNumber(estimatedCost, 0, 0),
      actualCost: actual,
      paidAmount: paid,
      isPaid: Boolean(isPaid || (paid >= actual && actual > 0)),
      dueDate: dueDate || undefined,
      vendor: vendor || undefined,
      notes: notes || undefined,
    };

    const validation = validateExpenseInput(payload);
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
      aria-labelledby="expense-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 id="expense-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {expenseToEdit ? 'Edit Expense Item' : 'Add Celebration Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track vendor costs, deposits, and payment status
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
            <label htmlFor="expense-event-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Celebration Event <span className="text-rose-500">*</span>
            </label>
            <select
              id="expense-event-select"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.category})
                </option>
              ))}
            </select>
          </div>

          {/* Expense Name */}
          <div>
            <label htmlFor="expense-name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Expense Item <span className="text-rose-500">*</span>
            </label>
            <input
              id="expense-name-input"
              type="text"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'expense-name-error' : undefined}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Wedding Cake Tiered Tasting & Delivery"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
            />
            {errors.name && <p id="expense-name-error" className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-category-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  id="expense-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="expense-vendor-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Vendor / Supplier
              </label>
              <div className="relative">
                <input
                  id="expense-vendor-input"
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Flora Boutique"
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Financials: Estimated vs Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-estimated-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Estimated Cost ($)
              </label>
              <div className="relative">
                <input
                  id="expense-estimated-input"
                  type="number"
                  min="0"
                  step="10"
                  value={estimatedCost || ''}
                  onChange={(e) => setEstimatedCost(parseSafeNumber(e.target.value, 0, 0))}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="expense-actual-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Actual Cost ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="expense-actual-input"
                  type="number"
                  min="0"
                  step="10"
                  aria-invalid={!!errors.actualCost}
                  aria-describedby={errors.actualCost ? 'expense-actual-error' : undefined}
                  value={actualCost || ''}
                  onChange={(e) => {
                    setActualCost(parseSafeNumber(e.target.value, 0, 0));
                    if (errors.actualCost) setErrors((prev) => ({ ...prev, actualCost: '' }));
                  }}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              {errors.actualCost && <p id="expense-actual-error" className="mt-1 text-xs text-rose-500">{errors.actualCost}</p>}
            </div>
          </div>

          {/* Payment Status & Amount Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-paid-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Amount Paid So Far ($)
              </label>
              <div className="relative">
                <input
                  id="expense-paid-input"
                  type="number"
                  min="0"
                  step="10"
                  value={paidAmount || ''}
                  onChange={(e) => {
                    const val = parseSafeNumber(e.target.value, 0, 0);
                    setPaidAmount(val);
                    if (val >= actualCost && actualCost > 0) {
                      setIsPaid(true);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm tabular-nums focus:border-slate-500 focus:outline-hidden"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="expense-due-date-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Due Date (if unpaid)
              </label>
              <div className="relative">
                <input
                  id="expense-due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-slate-500 focus:outline-hidden"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Paid in Full Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="isPaidCheckbox"
              checked={isPaid}
              onChange={(e) => handlePaidToggle(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
            />
            <label htmlFor="isPaidCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark as Paid in Full (sets paid amount to actual cost)
            </label>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="expense-notes-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Notes & Contract Terms
            </label>
            <textarea
              id="expense-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% deposit paid on booking, final check on delivery day."
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
              {expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

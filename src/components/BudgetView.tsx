import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  Search,
  Filter,
  Edit3,
  Trash2,
  PieChart,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { ExpenseCategory, ExpenseItem } from '../types';
import {
  calculateBudgetSummary,
  formatCurrency,
  formatDatePretty,
} from '../utils/eventCalculations';
import { THEME_CONFIGS } from '../types/theme';

interface BudgetViewProps {
  onOpenAddExpense: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
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

export const BudgetView: React.FC<BudgetViewProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const {
    events,
    expenses,
    selectedEventId,
    setSelectedEventId,
    theme,
  } = useEventPlanner();

  const themeCfg = THEME_CONFIGS[theme];

  const [categoryFilter, setCategoryFilter] = useState<'All' | ExpenseCategory>('All');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [search, setSearch] = useState('');

  // Selected event or all
  const activeEvent = events.find((e) => e.id === selectedEventId);
  const currentEvents = selectedEventId === 'all' ? events : events.filter((e) => e.id === selectedEventId);
  const currentExpenses = selectedEventId === 'all' ? expenses : expenses.filter((e) => e.eventId === selectedEventId);

  const totalBudgetCombined = currentEvents.reduce((acc, evt) => acc + evt.budgetTotal, 0);
  const summary = calculateBudgetSummary(totalBudgetCombined, currentExpenses);

  // Filtered expenses
  const filteredExpenses = currentExpenses.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (paymentFilter === 'paid' && !item.isPaid) return false;
    if (paymentFilter === 'unpaid' && item.isPaid) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchVendor = (item.vendor || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchVendor && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Event Context Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Budget & Expense Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeEvent
              ? `Financial allocations for "${activeEvent.title}"`
              : `Consolidated financial tracking across all ${events.length} celebrations`}
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
            onClick={onOpenAddExpense}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95 whitespace-nowrap ${themeCfg.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Budget */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Planned Budget</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(summary.totalBudget)}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Across {currentEvents.length} celebration {currentEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Actual Expenses */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Actual Committed Costs</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(summary.totalActual)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Estimated: {formatCurrency(summary.totalEstimated)}</span>
            <span className="tabular-nums font-medium text-slate-600 dark:text-slate-300">
              {Math.round(summary.spentPercentage)}%
            </span>
          </div>
        </div>

        {/* Remaining Balance or Overspend */}
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            summary.isOverBudget
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-xs font-medium text-slate-500">
            {summary.isOverBudget ? 'Over Budget By' : 'Remaining Balance'}
          </span>
          <div
            className={`mt-2 text-2xl font-bold tabular-nums ${
              summary.isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {summary.isOverBudget
              ? `+${formatCurrency(summary.overspendingAmount)}`
              : formatCurrency(summary.remainingBudget)}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {summary.isOverBudget ? 'Warning: Expenses exceed budget' : 'Under planned budget allocation'}
          </p>
        </div>

        {/* Unpaid Vendor Balance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Outstanding Vendor Balance</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(summary.unpaidBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Paid: {formatCurrency(summary.totalPaid)}</span>
            <span className="tabular-nums font-medium text-slate-600 dark:text-slate-300">
              {Math.round(summary.paidPercentage)}% paid
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Meters */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Spending by Category
            </h2>
            <p className="text-xs text-slate-500">
              Visual share of celebration budget across venue, catering, decor, and entertainment
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {summary.categoryBreakdown.length} active categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {summary.categoryBreakdown.map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cat.category}
                </span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(cat.actual)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, cat.percentageOfSpent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{cat.itemCount} items · Paid: {formatCurrency(cat.paid)}</span>
                <span className="tabular-nums">{Math.round(cat.percentageOfSpent)}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar for Ledger */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by title, vendor, or notes..."
              className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden capitalize"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid in Full</option>
              <option value="unpaid">Balance Due</option>
            </select>
          </div>
        </div>

        {/* Categories */}
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

      {/* Expense Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Expense Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 text-right">Actual Cost</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No expenses found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Expense" to log your first vendor or rental cost.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const evt = events.find((e) => e.id === exp.eventId);

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                        <div className="truncate font-semibold">{exp.name}</div>
                        {selectedEventId === 'all' && evt && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {evt.title}
                          </div>
                        )}
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                            {exp.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {exp.category}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {exp.vendor || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(exp.actualCost)}
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatCurrency(exp.paidAmount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {exp.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {exp.dueDate ? formatDatePretty(exp.dueDate) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            aria-label={`Edit ${exp.name}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            aria-label={`Delete ${exp.name}`}
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

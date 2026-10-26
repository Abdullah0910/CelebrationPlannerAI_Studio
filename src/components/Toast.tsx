import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';

export const Toast: React.FC = () => {
  const { notification, clearNotification } = useEventPlanner();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="shrink-0">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-1">
        {notification.message}
      </p>

      <button
        onClick={clearNotification}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

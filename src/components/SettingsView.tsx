import React, { useRef, useState } from 'react';
import {
  Palette,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { THEME_CONFIGS } from '../types/theme';
import { ThemePreset } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    events,
    expenses,
    guests,
    tasks,
    exportData,
    importData,
    resetToSampleData,
    notify,
  } = useEventPlanner();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeList = Object.values(THEME_CONFIGS);

  const handleExportJSON = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celebration-events-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('success', 'Backup JSON exported successfully.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importData(content);
        if (res.success) {
          notify('success', 'Backup restored successfully!');
        } else {
          notify('error', res.message);
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Personalization & Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize celebration themes, appearance, and manage data backups
        </p>
      </div>

      {/* Theme Presets */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
            Celebration Color Aesthetic
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Select an intentional palette tailored to weddings, formal galas, birthdays, or natural garden feasts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {themeList.map((preset) => {
            const isSelected = theme === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${preset.gradient}`} />
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {preset.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dark / Light Mode */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Display Mode
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toggle between bright natural light and soothing dark slate mode
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
        >
          {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </section>

      {/* Backup, Export & Restore */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
            Data Persistence & Backup
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Your celebrations are saved automatically in your browser's local storage. You can also create downloadable JSON backup archives or restore previous events.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
          </button>

          {/* Reset to Sample Data */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Sample Celebrations</span>
          </button>
        </div>

        {/* Storage stats */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500">
          <div>
            <span className="block font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {events.length}
            </span>
            <span>Saved Events</span>
          </div>
          <div>
            <span className="block font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {expenses.length}
            </span>
            <span>Expense Records</span>
          </div>
          <div>
            <span className="block font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {guests.length}
            </span>
            <span>Guest Profiles</span>
          </div>
          <div>
            <span className="block font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {tasks.length}
            </span>
            <span>Checklist Tasks</span>
          </div>
        </div>
      </section>

      {/* Confirmation Modal for Reset */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Celebration Data?"
        message="This will restore the workspace to the initial curated celebration samples (Anniversary Gala, Elena's Birthday, Corporate Leadership Dinner, and Solstice Festival). Any custom events and expenses you created will be replaced."
        confirmLabel="Reset Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

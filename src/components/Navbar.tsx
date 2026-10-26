import React, { useState } from 'react';
import {
  Sparkles,
  CalendarDays,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Palette,
  Search,
} from 'lucide-react';
import { useEventPlanner } from '../context/EventPlannerContext';
import { ActiveTab } from '../types';
import { THEME_CONFIGS } from '../types/theme';

interface NavbarProps {
  onOpenCreateEvent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent }) => {
  const {
    activeTab,
    setActiveTab,
    events,
    selectedEventId,
    setSelectedEventId,
    searchQuery,
    setSearchQuery,
    isDarkMode,
    toggleDarkMode,
    theme,
  } = useEventPlanner();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeCfg = THEME_CONFIGS[theme];

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'events', label: 'Events' },
    { id: 'budget', label: 'Budget' },
    { id: 'guests', label: 'Guests' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'settings', label: 'Theme' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${themeCfg.accentBg}`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap">
                Fête Planner
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Global Context Controls & 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Event Context Selector */}
          <div className="hidden sm:flex items-center">
            <select
              aria-label="Filter celebration context"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 max-w-[150px] md:max-w-[190px] truncate focus:outline-hidden"
            >
              <option value="all">All Celebrations ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 1 Primary Action */}
          <button
            onClick={onOpenCreateEvent}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 ${themeCfg.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Plan Celebration</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Celebration Filter
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Celebrations ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-left text-xs font-medium rounded-lg ${
                  activeTab === link.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

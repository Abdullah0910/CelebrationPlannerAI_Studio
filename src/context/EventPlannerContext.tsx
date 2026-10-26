import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_EXPENSES,
  INITIAL_GUESTS,
  INITIAL_TASKS,
} from '../data/initialData';
import {
  ActiveTab,
  EventItem,
  ExpenseItem,
  GuestItem,
  RsvpStatus,
  TaskItem,
  ThemePreset,
} from '../types';
import { validateBackupSchema } from '../utils/eventCalculations';

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface EventPlannerContextType {
  events: EventItem[];
  expenses: ExpenseItem[];
  guests: GuestItem[];
  tasks: TaskItem[];
  selectedEventId: string | 'all';
  activeTab: ActiveTab;
  searchQuery: string;
  theme: ThemePreset;
  isDarkMode: boolean;
  notification: NotificationState | null;

  // Actions
  setSelectedEventId: (id: string | 'all') => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemePreset) => void;
  setIsDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;

  // Event CRUD
  addEvent: (eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  // Expense CRUD
  addExpense: (expenseData: Omit<ExpenseItem, 'id'>) => ExpenseItem;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // Guest CRUD
  addGuest: (guestData: Omit<GuestItem, 'id'>) => GuestItem;
  updateGuest: (id: string, updates: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;
  updateGuestRsvp: (id: string, rsvpStatus: RsvpStatus) => void;

  // Task CRUD
  addTask: (taskData: Omit<TaskItem, 'id'>) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Backup & Restore
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; message: string };
  resetToSampleData: () => void;
}

const STORAGE_KEY_PREFIX = 'celebration_planner_v1_';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const EventPlannerContext = createContext<EventPlannerContextType | undefined>(undefined);

export const EventPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or fall back to Initial Realistic Data
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}events`);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [guests, setGuests] = useState<GuestItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}guests`);
      return saved ? JSON.parse(saved) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [selectedEventId, setSelectedEventId] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [theme, setTheme] = useState<ThemePreset>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`);
      return (saved as ThemePreset) || 'gold';
    } catch {
      return 'gold';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dark_mode`);
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}events`, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save events to local storage:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Failed to save expenses to local storage:', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}guests`, JSON.stringify(guests));
    } catch (e) {
      console.warn('Failed to save guests to local storage:', e);
    }
  }, [guests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks to local storage:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, theme);
    } catch (e) {
      console.warn('Failed to save theme to local storage:', e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}dark_mode`, String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Failed to save dark mode to local storage:', e);
    }
  }, [isDarkMode]);

  // Notifications
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Event operations
  const addEvent = (eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): EventItem => {
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...eventData,
      id: generateId('evt'),
      createdAt: now,
      updatedAt: now,
    };
    setEvents((prev) => [newEvent, ...prev]);
    notify('success', `"${newEvent.title}" was created successfully.`);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
    notify('success', 'Event details updated.');
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
    // Cascade delete related records
    setExpenses((prev) => prev.filter((exp) => exp.eventId !== id));
    setGuests((prev) => prev.filter((gst) => gst.eventId !== id));
    setTasks((prev) => prev.filter((tsk) => tsk.eventId !== id));

    if (selectedEventId === id) {
      setSelectedEventId('all');
    }
    notify('info', `"${eventToDelete?.title || 'Event'}" and all related items were deleted.`);
  };

  // Expense operations
  const addExpense = (expenseData: Omit<ExpenseItem, 'id'>): ExpenseItem => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: generateId('exp'),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    notify('success', `Added expense: "${newExpense.name}"`);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    );
    notify('success', 'Expense updated.');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    notify('info', 'Expense deleted.');
  };

  // Guest operations
  const addGuest = (guestData: Omit<GuestItem, 'id'>): GuestItem => {
    const newGuest: GuestItem = {
      ...guestData,
      id: generateId('gst'),
    };
    setGuests((prev) => [newGuest, ...prev]);
    notify('success', `Added guest: ${newGuest.name}`);
    return newGuest;
  };

  const updateGuest = (id: string, updates: Partial<GuestItem>) => {
    setGuests((prev) =>
      prev.map((gst) => (gst.id === id ? { ...gst, ...updates } : gst))
    );
    notify('success', 'Guest details updated.');
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((gst) => gst.id !== id));
    notify('info', 'Guest removed.');
  };

  const updateGuestRsvp = (id: string, rsvpStatus: RsvpStatus) => {
    setGuests((prev) =>
      prev.map((gst) => (gst.id === id ? { ...gst, rsvpStatus } : gst))
    );
    notify('success', `RSVP updated to "${rsvpStatus}"`);
  };

  // Task operations
  const addTask = (taskData: Omit<TaskItem, 'id'>): TaskItem => {
    const newTask: TaskItem = {
      ...taskData,
      id: generateId('tsk'),
    };
    setTasks((prev) => [newTask, ...prev]);
    notify('success', `Added task: "${newTask.title}"`);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((tsk) => (tsk.id === id ? { ...tsk, ...updates } : tsk))
    );
    notify('success', 'Task updated.');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((tsk) =>
        tsk.id === id ? { ...tsk, completed: !tsk.completed } : tsk
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((tsk) => tsk.id !== id));
    notify('info', 'Task deleted.');
  };

  // Backup & Restore
  const exportData = (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events,
      expenses,
      guests,
      tasks,
      theme,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importData = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      const schemaCheck = validateBackupSchema(parsed);
      if (!schemaCheck.isValid) {
        return { success: false, message: schemaCheck.error || 'Invalid backup schema structure.' };
      }

      setEvents(parsed.events);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.guests)) setGuests(parsed.guests);
      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.theme && ['gold', 'rose', 'indigo', 'emerald', 'noir'].includes(parsed.theme)) {
        setTheme(parsed.theme as ThemePreset);
      }

      notify('success', 'Data successfully restored from backup.');
      return { success: true, message: 'Data successfully restored.' };
    } catch {
      return { success: false, message: 'Failed to parse JSON file. Please ensure it is valid JSON.' };
    }
  };

  const resetToSampleData = () => {
    setEvents(INITIAL_EVENTS);
    setExpenses(INITIAL_EXPENSES);
    setGuests(INITIAL_GUESTS);
    setTasks(INITIAL_TASKS);
    setSelectedEventId('all');
    notify('info', 'Reset all events, budget, guests, and tasks to sample celebration data.');
  };

  return (
    <EventPlannerContext.Provider
      value={{
        events,
        expenses,
        guests,
        tasks,
        selectedEventId,
        activeTab,
        searchQuery,
        theme,
        isDarkMode,
        notification,
        setSelectedEventId,
        setActiveTab,
        setSearchQuery,
        setTheme,
        setIsDarkMode,
        toggleDarkMode,
        notify,
        clearNotification,
        addEvent,
        updateEvent,
        deleteEvent,
        addExpense,
        updateExpense,
        deleteExpense,
        addGuest,
        updateGuest,
        deleteGuest,
        updateGuestRsvp,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        exportData,
        importData,
        resetToSampleData,
      }}
    >
      {children}
    </EventPlannerContext.Provider>
  );
};

export const useEventPlanner = (): EventPlannerContextType => {
  const context = useContext(EventPlannerContext);
  if (!context) {
    throw new Error('useEventPlanner must be used within an EventPlannerProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { EventPlannerProvider, useEventPlanner } from './context/EventPlannerContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { BudgetView } from './components/BudgetView';
import { GuestsView } from './components/GuestsView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { EventModal } from './components/EventModal';
import { ExpenseModal } from './components/ExpenseModal';
import { GuestModal } from './components/GuestModal';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { EventDetailModal } from './components/EventDetailModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import { EventItem, ExpenseItem, GuestItem, TaskItem } from './types';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    addExpense,
    updateExpense,
    deleteExpense,
    addGuest,
    updateGuest,
    deleteGuest,
    addTask,
    updateTask,
    deleteTask,
  } = useEventPlanner();

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItem | null>(null);

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<GuestItem | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);

  const [inspectingEvent, setInspectingEvent] = useState<EventItem | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'event' | 'expense' | 'guest' | 'task';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'event',
    id: '',
    title: '',
  });

  // Handlers for Event
  const handleOpenCreateEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: EventItem) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  const handleInspectEvent = (event: EventItem) => {
    setInspectingEvent(event);
    setIsEventDetailModalOpen(true);
  };

  const handlePromptDeleteEvent = (id: string) => {
    const evt = events.find((e) => e.id === id);
    setDeleteConfirmation({
      isOpen: true,
      type: 'event',
      id,
      title: `Delete "${evt?.title || 'Event'}"?`,
    });
  };

  // Handlers for Expense
  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handlePromptDeleteExpense = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'expense',
      id,
      title: 'Delete this expense item?',
    });
  };

  // Handlers for Guest
  const handleOpenAddGuest = () => {
    setGuestToEdit(null);
    setIsGuestModalOpen(true);
  };

  const handleEditGuest = (guest: GuestItem) => {
    setGuestToEdit(guest);
    setIsGuestModalOpen(true);
  };

  const handlePromptDeleteGuest = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'guest',
      id,
      title: 'Remove this guest?',
    });
  };

  // Handlers for Task
  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handlePromptDeleteTask = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'task',
      id,
      title: 'Delete this checklist task?',
    });
  };

  // Confirm delete execution
  const handleExecuteDelete = () => {
    const { type, id } = deleteConfirmation;
    if (type === 'event') deleteEvent(id);
    if (type === 'expense') deleteExpense(id);
    if (type === 'guest') deleteGuest(id);
    if (type === 'task') deleteTask(id);

    setDeleteConfirmation({ isOpen: false, type: 'event', id: '', title: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar onOpenCreateEvent={handleOpenCreateEvent} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenCreateEvent={handleOpenCreateEvent}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenAddGuest={handleOpenAddGuest}
            onOpenAddTask={handleOpenAddTask}
            onInspectEvent={handleInspectEvent}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            onOpenCreateEvent={handleOpenCreateEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handlePromptDeleteEvent}
            onInspectEvent={handleInspectEvent}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            onOpenAddExpense={handleOpenAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handlePromptDeleteExpense}
          />
        )}

        {activeTab === 'guests' && (
          <GuestsView
            onOpenAddGuest={handleOpenAddGuest}
            onEditGuest={handleEditGuest}
            onDeleteGuest={handlePromptDeleteGuest}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handlePromptDeleteTask}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            onOpenCreateEvent={handleOpenCreateEvent}
            onOpenAddTask={handleOpenAddTask}
            onInspectEvent={handleInspectEvent}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Celebration & Event Planner · Crafting unforgettable gatherings</span>
          <span>Automatic browser persistence enabled</span>
        </div>
      </footer>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => setIsEventModalOpen(false)}
        onSave={(data) => {
          if (eventToEdit) {
            updateEvent(eventToEdit.id, data);
          } else {
            addEvent(data);
          }
        }}
      />

      <EventDetailModal
        isOpen={isEventDetailModalOpen}
        event={inspectingEvent ? (events.find((e) => e.id === inspectingEvent.id) || inspectingEvent) : null}
        onClose={() => setIsEventDetailModalOpen(false)}
        onEdit={(evt) => {
          setIsEventDetailModalOpen(false);
          handleEditEvent(evt);
        }}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenAddGuest={handleOpenAddGuest}
        onOpenAddTask={handleOpenAddTask}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        expenseToEdit={expenseToEdit}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={(data) => {
          if (expenseToEdit) {
            updateExpense(expenseToEdit.id, data);
          } else {
            addExpense(data);
          }
        }}
      />

      <GuestModal
        isOpen={isGuestModalOpen}
        guestToEdit={guestToEdit}
        onClose={() => setIsGuestModalOpen(false)}
        onSave={(data) => {
          if (guestToEdit) {
            updateGuest(guestToEdit.id, data);
          } else {
            addGuest(data);
          }
        }}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(data) => {
          if (taskToEdit) {
            updateTask(taskToEdit.id, data);
          } else {
            addTask(data);
          }
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.title}
        message="This operation cannot be undone. Are you sure you wish to proceed?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, type: 'event', id: '', title: '' })}
      />

      {/* Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <EventPlannerProvider>
        <MainLayout />
      </EventPlannerProvider>
    </ErrorBoundary>
  );
}

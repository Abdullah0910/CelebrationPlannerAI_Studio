import { describe, it, expect } from 'vitest';
import {
  calculateBudgetSummary,
  calculateGuestSummary,
  calculateTaskSummary,
  formatCurrency,
  formatEventCountdown,
  getDaysUntil,
} from '../utils/eventCalculations';
import { ExpenseItem, GuestItem, TaskItem } from '../types';

describe('Budget Calculations', () => {
  const sampleExpenses: ExpenseItem[] = [
    {
      id: '1',
      eventId: 'evt-1',
      name: 'Venue Rental',
      category: 'Venue',
      estimatedCost: 3000,
      actualCost: 3200,
      paidAmount: 3200,
      isPaid: true,
    },
    {
      id: '2',
      eventId: 'evt-1',
      name: 'Gourmet Catering',
      category: 'Catering',
      estimatedCost: 2000,
      actualCost: 2500,
      paidAmount: 1000,
      isPaid: false,
    },
    {
      id: '3',
      eventId: 'evt-1',
      name: 'Live Band',
      category: 'Entertainment & Music',
      estimatedCost: 1000,
      actualCost: 900,
      paidAmount: 900,
      isPaid: true,
    },
  ];

  it('calculates total estimated, actual, and paid amounts accurately', () => {
    const summary = calculateBudgetSummary(6000, sampleExpenses);

    expect(summary.totalBudget).toBe(6000);
    expect(summary.totalEstimated).toBe(6000); // 3000 + 2000 + 1000
    expect(summary.totalActual).toBe(6600); // 3200 + 2500 + 900
    expect(summary.totalPaid).toBe(5100); // 3200 + 1000 + 900
    expect(summary.unpaidBalance).toBe(1500); // 6600 - 5100
  });

  it('correctly detects and calculates overspending', () => {
    // Budget is 6000, actual spent is 6600 -> overspend by 600
    const summary = calculateBudgetSummary(6000, sampleExpenses);

    expect(summary.isOverBudget).toBe(true);
    expect(summary.overspendingAmount).toBe(600);
    expect(summary.remainingBudget).toBe(-600);
  });

  it('correctly handles under-budget condition', () => {
    // Budget is 8000, actual spent is 6600 -> remaining 1400
    const summary = calculateBudgetSummary(8000, sampleExpenses);

    expect(summary.isOverBudget).toBe(false);
    expect(summary.overspendingAmount).toBe(0);
    expect(summary.remainingBudget).toBe(1400);
  });

  it('generates category breakdown sorted by actual spending', () => {
    const summary = calculateBudgetSummary(8000, sampleExpenses);

    expect(summary.categoryBreakdown.length).toBe(3);
    expect(summary.categoryBreakdown[0].category).toBe('Venue');
    expect(summary.categoryBreakdown[0].actual).toBe(3200);
    expect(summary.categoryBreakdown[1].category).toBe('Catering');
    expect(summary.categoryBreakdown[1].actual).toBe(2500);
  });
});

describe('Guest RSVP & Headcount Calculations', () => {
  const sampleGuests: GuestItem[] = [
    {
      id: 'g-1',
      eventId: 'evt-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      group: 'Family',
      rsvpStatus: 'Attending',
      invitationStatus: 'Delivered',
      dietary: 'Vegetarian',
      plusOnes: 1, // 1 + 1 = 2 headcount
    },
    {
      id: 'g-2',
      eventId: 'evt-1',
      name: 'Bob Smith',
      email: 'bob@example.com',
      group: 'Friends',
      rsvpStatus: 'Attending',
      invitationStatus: 'Delivered',
      dietary: 'Gluten-Free',
      plusOnes: 0, // 1 headcount
    },
    {
      id: 'g-3',
      eventId: 'evt-1',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      group: 'Colleagues',
      rsvpStatus: 'Tentative',
      invitationStatus: 'Sent',
      dietary: 'None',
      plusOnes: 1,
    },
    {
      id: 'g-4',
      eventId: 'evt-1',
      name: 'Diana Prince',
      email: 'diana@example.com',
      group: 'VIP',
      rsvpStatus: 'Declined',
      invitationStatus: 'Delivered',
      dietary: 'Vegan',
      plusOnes: 0,
    },
    {
      id: 'g-5',
      eventId: 'evt-1',
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
      group: 'Friends',
      rsvpStatus: 'Pending',
      invitationStatus: 'Not Sent',
      dietary: 'None',
      plusOnes: 0,
    },
  ];

  it('calculates RSVP breakdown and headcounts including plus-ones', () => {
    const summary = calculateGuestSummary(sampleGuests);

    expect(summary.totalInvited).toBe(5);
    expect(summary.attending).toBe(2);
    expect(summary.tentative).toBe(1);
    expect(summary.declined).toBe(1);
    expect(summary.pending).toBe(1);

    // Attending headcount: Alice (1 + 1) + Bob (1 + 0) = 3
    expect(summary.totalHeadcount).toBe(3);

    // Potential headcount includes tentative: 3 + Charlie (1 + 1) = 5
    expect(summary.potentialHeadcount).toBe(5);
  });

  it('aggregates dietary requirements correctly', () => {
    const summary = calculateGuestSummary(sampleGuests);

    expect(summary.dietaryBreakdown['Vegetarian']).toBe(1);
    expect(summary.dietaryBreakdown['Gluten-Free']).toBe(1);
    expect(summary.dietaryBreakdown['Vegan']).toBe(1);
    expect(summary.dietaryBreakdown['None']).toBe(2);
  });
});

describe('Task Progress Calculations', () => {
  const refDate = new Date('2026-11-01T00:00:00');

  const sampleTasks: TaskItem[] = [
    {
      id: 't-1',
      eventId: 'evt-1',
      title: 'Book Photographer',
      category: 'Vendor',
      priority: 'High',
      dueDate: '2026-10-25', // Overdue relative to 2026-11-01
      completed: false,
    },
    {
      id: 't-2',
      eventId: 'evt-1',
      title: 'Finalize Menu Tasting',
      category: 'Planning',
      priority: 'High',
      dueDate: '2026-11-01', // Due today
      completed: false,
    },
    {
      id: 't-3',
      eventId: 'evt-1',
      title: 'Send Digital Save the Dates',
      category: 'Invitations',
      priority: 'Medium',
      dueDate: '2026-11-05', // Due this week
      completed: true,
    },
    {
      id: 't-4',
      eventId: 'evt-1',
      title: 'Collect Favors',
      category: 'Logistics',
      priority: 'Low',
      dueDate: '2026-11-20',
      completed: false,
    },
  ];

  it('calculates total tasks and progress percentage', () => {
    const summary = calculateTaskSummary(sampleTasks, refDate);

    expect(summary.total).toBe(4);
    expect(summary.completed).toBe(1);
    expect(summary.pending).toBe(3);
    expect(summary.progressPercentage).toBe(25); // 1 out of 4 = 25%
  });

  it('flags overdue, due today, and high priority tasks', () => {
    const summary = calculateTaskSummary(sampleTasks, refDate);

    expect(summary.overdue).toBe(1);
    expect(summary.dueToday).toBe(1);
    expect(summary.highPriorityPending).toBe(2); // t-1 and t-2
  });
});

describe('Formatting & Countdown Helpers', () => {
  const refDate = new Date('2026-10-23T00:00:00');

  it('formats currency with commas and currency symbol', () => {
    expect(formatCurrency(18500)).toBe('$18,500');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('calculates countdown in days correctly', () => {
    expect(getDaysUntil('2026-10-23', refDate)).toBe(0);
    expect(getDaysUntil('2026-10-24', refDate)).toBe(1);
    expect(getDaysUntil('2026-11-06', refDate)).toBe(14);
  });

  it('formats human countdown labels', () => {
    expect(formatEventCountdown('2026-10-23', refDate)).toBe('Today');
    expect(formatEventCountdown('2026-10-24', refDate)).toBe('Tomorrow');
    expect(formatEventCountdown('2026-11-06', refDate)).toBe('in 14 days');
  });
});

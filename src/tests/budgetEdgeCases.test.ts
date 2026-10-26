import { describe, it, expect } from 'vitest';
import {
  calculateBudgetSummary,
  parseSafeNumber,
  formatCurrency,
} from '../utils/eventCalculations';
import { ExpenseItem } from '../types';

describe('Budget Edge Cases & Numerical Precision', () => {
  it('correctly handles $0 total budget with incurred expenses', () => {
    const expenses: ExpenseItem[] = [
      {
        id: 'exp-1',
        eventId: 'evt-zero',
        name: 'Invitations',
        category: 'Invitations & Favors',
        estimatedCost: 150,
        actualCost: 150,
        paidAmount: 150,
        isPaid: true,
      },
    ];

    const summary = calculateBudgetSummary(0, expenses);
    expect(summary.totalBudget).toBe(0);
    expect(summary.totalActual).toBe(150);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overspendingAmount).toBe(150);
    expect(summary.remainingBudget).toBe(-150);
    // Percentage spent should be capped or represent accurate ratio
    expect(summary.spentPercentage).toBe(100);
  });

  it('correctly calculates remaining budget when under budget', () => {
    const expenses: ExpenseItem[] = [
      {
        id: 'exp-1',
        eventId: 'evt-1',
        name: 'Flowers',
        category: 'Decor & Florals',
        estimatedCost: 500,
        actualCost: 400,
        paidAmount: 400,
        isPaid: true,
      },
    ];

    const summary = calculateBudgetSummary(1000, expenses);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.remainingBudget).toBe(600);
    expect(summary.overspendingAmount).toBe(0);
    expect(summary.spentPercentage).toBe(40);
  });

  it('handles floating point additions with accurate rounding', () => {
    // Classic JavaScript 0.1 + 0.2 precision test case
    const expenses: ExpenseItem[] = [
      {
        id: '1',
        eventId: 'evt-fp',
        name: 'Item A',
        category: 'Miscellaneous',
        estimatedCost: 19.99,
        actualCost: 19.99,
        paidAmount: 19.99,
        isPaid: true,
      },
      {
        id: '2',
        eventId: 'evt-fp',
        name: 'Item B',
        category: 'Miscellaneous',
        estimatedCost: 29.95,
        actualCost: 29.95,
        paidAmount: 20.0,
        isPaid: false,
      },
      {
        id: '3',
        eventId: 'evt-fp',
        name: 'Item C',
        category: 'Miscellaneous',
        estimatedCost: 10.05,
        actualCost: 10.05,
        paidAmount: 10.05,
        isPaid: true,
      },
    ];

    const summary = calculateBudgetSummary(100, expenses);
    // 19.99 + 29.95 + 10.05 = 59.99
    expect(summary.totalActual).toBeCloseTo(59.99, 2);
    // Paid = 19.99 + 20.0 + 10.05 = 50.04
    expect(summary.totalPaid).toBeCloseTo(50.04, 2);
    // Unpaid = 59.99 - 50.04 = 9.95
    expect(summary.unpaidBalance).toBeCloseTo(9.95, 2);
    // Remaining = 100 - 59.99 = 40.01
    expect(summary.remainingBudget).toBeCloseTo(40.01, 2);
  });

  it('sorts category breakdowns by highest spending descending', () => {
    const expenses: ExpenseItem[] = [
      {
        id: '1',
        eventId: 'evt-cat',
        name: 'Favors',
        category: 'Invitations & Favors',
        estimatedCost: 100,
        actualCost: 100,
        paidAmount: 100,
        isPaid: true,
      },
      {
        id: '2',
        eventId: 'evt-cat',
        name: 'Ballroom',
        category: 'Venue',
        estimatedCost: 3500,
        actualCost: 3500,
        paidAmount: 3500,
        isPaid: true,
      },
      {
        id: '3',
        eventId: 'evt-cat',
        name: 'Buffet',
        category: 'Catering',
        estimatedCost: 1800,
        actualCost: 1800,
        paidAmount: 1800,
        isPaid: true,
      },
    ];

    const summary = calculateBudgetSummary(6000, expenses);
    expect(summary.categoryBreakdown.length).toBe(3);
    // First should be Venue (3500), second Catering (1800), third Invitations & Favors (100)
    expect(summary.categoryBreakdown[0].category).toBe('Venue');
    expect(summary.categoryBreakdown[0].actual).toBe(3500);
    expect(summary.categoryBreakdown[1].category).toBe('Catering');
    expect(summary.categoryBreakdown[1].actual).toBe(1800);
    expect(summary.categoryBreakdown[2].category).toBe('Invitations & Favors');
    expect(summary.categoryBreakdown[2].actual).toBe(100);
  });

  it('handles empty expense list gracefully', () => {
    const summary = calculateBudgetSummary(5000, []);
    expect(summary.totalBudget).toBe(5000);
    expect(summary.totalActual).toBe(0);
    expect(summary.totalEstimated).toBe(0);
    expect(summary.totalPaid).toBe(0);
    expect(summary.remainingBudget).toBe(5000);
    expect(summary.spentPercentage).toBe(0);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.categoryBreakdown).toEqual([]);
  });

  describe('parseSafeNumber Utility', () => {
    it('parses valid numeric strings and numbers', () => {
      expect(parseSafeNumber('150.50')).toBe(150.5);
      expect(parseSafeNumber(250)).toBe(250);
      expect(parseSafeNumber('0')).toBe(0);
    });

    it('falls back to default fallback on NaN, null, or undefined', () => {
      expect(parseSafeNumber('abc', 10)).toBe(10);
      expect(parseSafeNumber(null, 25)).toBe(25);
      expect(parseSafeNumber(undefined, 0)).toBe(0);
      expect(parseSafeNumber(NaN, 5)).toBe(5);
    });

    it('clamps values below minimum to minimum', () => {
      expect(parseSafeNumber(-50, 0, 0)).toBe(0);
      expect(parseSafeNumber('-10', 0, 0)).toBe(0);
      expect(parseSafeNumber(5, 0, 10)).toBe(10);
    });
  });

  describe('formatCurrency Utility', () => {
    it('formats standard currencies without NaN artifacts', () => {
      const formatted = formatCurrency(1250);
      expect(formatted).toContain('1,250');
      expect(formatCurrency(0)).toContain('0');
      expect(formatCurrency(NaN)).toContain('0');
    });
  });
});

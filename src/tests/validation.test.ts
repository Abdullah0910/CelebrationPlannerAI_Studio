import { describe, it, expect } from 'vitest';
import {
  validateEventInput,
  validateExpenseInput,
  validateGuestInput,
  validateTaskInput,
} from '../utils/eventCalculations';

describe('Event Input Validation', () => {
  it('validates a complete and correct event', () => {
    const valid = validateEventInput({
      title: 'Summer Solstice Gala',
      date: '2026-07-21',
      venue: 'The Grand Meadow',
      targetGuestCount: 100,
      budgetTotal: 10000,
    });

    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('rejects empty title, missing date, or missing venue', () => {
    const invalid = validateEventInput({
      title: '',
      date: '',
      venue: '',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBeDefined();
    expect(invalid.errors.date).toBeDefined();
    expect(invalid.errors.venue).toBeDefined();
  });

  it('rejects negative budgets or negative guest counts', () => {
    const invalid = validateEventInput({
      title: 'Birthday Dinner',
      date: '2026-11-20',
      venue: 'Conservatory',
      budgetTotal: -500,
      targetGuestCount: -10,
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.budgetTotal).toBeDefined();
    expect(invalid.errors.targetGuestCount).toBeDefined();
  });
});

describe('Expense Input Validation', () => {
  it('validates a correct expense', () => {
    const valid = validateExpenseInput({
      name: 'Stage Lighting Rental',
      category: 'Entertainment & Music',
      actualCost: 1200,
      estimatedCost: 1000,
      paidAmount: 600,
    });

    expect(valid.isValid).toBe(true);
  });

  it('requires expense description name', () => {
    const invalid = validateExpenseInput({
      name: '',
      category: 'Venue',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.name).toBeDefined();
  });
});

describe('Guest Input Validation', () => {
  it('validates a correct guest with email', () => {
    const valid = validateGuestInput({
      name: 'Julian Vance',
      email: 'julian@example.com',
      plusOnes: 1,
    });

    expect(valid.isValid).toBe(true);
  });

  it('rejects invalid email formats', () => {
    const invalid = validateGuestInput({
      name: 'Marcus Vance',
      email: 'not-an-email',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.email).toBeDefined();
  });

  it('rejects negative plus-ones', () => {
    const invalid = validateGuestInput({
      name: 'Claire Vance',
      plusOnes: -2,
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.plusOnes).toBeDefined();
  });
});

describe('Task Input Validation', () => {
  it('validates a task with title and due date', () => {
    const valid = validateTaskInput({
      title: 'Sign catering deposit agreement',
      dueDate: '2026-11-05',
    });

    expect(valid.isValid).toBe(true);
  });

  it('rejects empty title or missing due date', () => {
    const invalid = validateTaskInput({
      title: '',
      dueDate: '',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBeDefined();
    expect(invalid.errors.dueDate).toBeDefined();
  });
});

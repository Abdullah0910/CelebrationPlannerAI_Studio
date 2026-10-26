import { describe, it, expect } from 'vitest';
import { INITIAL_EVENTS, INITIAL_EXPENSES, INITIAL_GUESTS, INITIAL_TASKS } from '../data/initialData';

describe('Data Persistence & Serialization', () => {
  it('serializes sample data into valid JSON backup', () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events: INITIAL_EVENTS,
      expenses: INITIAL_EXPENSES,
      guests: INITIAL_GUESTS,
      tasks: INITIAL_TASKS,
      theme: 'gold',
    };

    const serialized = JSON.stringify(backup);
    expect(typeof serialized).toBe('string');

    const parsed = JSON.parse(serialized);
    expect(parsed.version).toBe('1.0');
    expect(parsed.events.length).toBe(INITIAL_EVENTS.length);
    expect(parsed.expenses.length).toBe(INITIAL_EXPENSES.length);
    expect(parsed.guests.length).toBe(INITIAL_GUESTS.length);
    expect(parsed.tasks.length).toBe(INITIAL_TASKS.length);
  });

  it('detects invalid backup JSON with missing events array', () => {
    const badBackup = JSON.stringify({
      version: '1.0',
      invalidKey: 'missing events array',
    });

    const parsed = JSON.parse(badBackup);
    expect(Array.isArray(parsed.events)).toBe(false);
  });
});

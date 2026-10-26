import { describe, it, expect } from 'vitest';
import { validateBackupSchema } from '../utils/eventCalculations';

describe('Backup JSON Schema Validation', () => {
  const validPayload = {
    version: '1.0.0',
    exportedAt: '2026-06-15T12:00:00Z',
    events: [
      {
        id: 'evt-1',
        title: 'Silver Anniversary',
        category: 'Anniversary',
        date: '2026-09-15',
        time: '18:00',
        venue: 'The Manor',
        budgetTotal: 10000,
        targetGuestCount: 80,
        description: 'Celebrating 25 years',
        status: 'planning',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ],
    expenses: [
      {
        id: 'exp-1',
        eventId: 'evt-1',
        name: 'Flowers',
        category: 'Decor & Florals',
        estimatedCost: 800,
        actualCost: 750,
        paidAmount: 750,
        isPaid: true,
      },
    ],
    guests: [
      {
        id: 'gst-1',
        eventId: 'evt-1',
        name: 'Eleanor Vance',
        email: 'eleanor@example.com',
        group: 'Family',
        rsvpStatus: 'Attending',
        invitationStatus: 'Sent',
        dietary: 'Vegetarian',
        plusOnes: 1,
      },
    ],
    tasks: [
      {
        id: 'tsk-1',
        eventId: 'evt-1',
        title: 'Book Photographer',
        category: 'Vendor',
        priority: 'High',
        dueDate: '2026-07-01',
        completed: true,
      },
    ],
  };

  it('validates a complete, correctly-formatted backup payload', () => {
    const result = validateBackupSchema(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects non-object or null payloads', () => {
    expect(validateBackupSchema(null).isValid).toBe(false);
    expect(validateBackupSchema(undefined).isValid).toBe(false);
    expect(validateBackupSchema('string data').isValid).toBe(false);
    expect(validateBackupSchema(12345).isValid).toBe(false);
    expect(validateBackupSchema([]).isValid).toBe(false);
  });

  it('rejects payloads where events array is missing or not an array', () => {
    const missingEvents = {
      expenses: [],
      guests: [],
      tasks: [],
    };
    const result = validateBackupSchema(missingEvents);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('"events" array');
  });

  it('rejects payload when an event item is missing required id', () => {
    const invalidEvent = {
      events: [
        {
          title: 'No ID Event',
          date: '2026-08-01',
        },
      ],
    };
    const result = validateBackupSchema(invalidEvent);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('missing a valid id');
  });

  it('rejects payload when an event item is missing required title', () => {
    const invalidEvent = {
      events: [
        {
          id: 'evt-no-title',
          date: '2026-08-01',
        },
      ],
    };
    const result = validateBackupSchema(invalidEvent);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('missing a valid title');
  });

  it('rejects payload when an event item is missing required date', () => {
    const invalidEvent = {
      events: [
        {
          id: 'evt-no-date',
          title: 'Birthday Bash',
        },
      ],
    };
    const result = validateBackupSchema(invalidEvent);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('missing a valid date');
  });

  it('rejects payload when expenses is not an array', () => {
    const invalidExpenses = {
      events: [{ id: '1', title: 'A', date: '2026-01-01' }],
      expenses: 'not-an-array',
    };
    const result = validateBackupSchema(invalidExpenses);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('"expenses" must be an array');
  });

  it('rejects payload when guests is not an array', () => {
    const invalidGuests = {
      events: [{ id: '1', title: 'A', date: '2026-01-01' }],
      guests: 1234,
    };
    const result = validateBackupSchema(invalidGuests);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('"guests" must be an array');
  });

  it('rejects payload when tasks is not an array', () => {
    const invalidTasks = {
      events: [{ id: '1', title: 'A', date: '2026-01-01' }],
      tasks: {},
    };
    const result = validateBackupSchema(invalidTasks);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('"tasks" must be an array');
  });
});

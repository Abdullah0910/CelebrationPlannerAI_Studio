import { describe, it, expect } from 'vitest';
import { filterEventsByDate } from '../utils/eventCalculations';
import { EventItem } from '../types';

describe('Event Date Filtering', () => {
  // Reference date: 2026-06-15
  const refDate = new Date('2026-06-15T12:00:00Z');

  const mockEvents: EventItem[] = [
    {
      id: 'past-1',
      title: 'Past Event',
      category: 'Birthday',
      date: '2026-05-10',
      time: '18:00',
      venue: 'Town Hall',
      budgetTotal: 1000,
      targetGuestCount: 20,
      description: 'Already happened',
      status: 'completed',
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
    },
    {
      id: 'today-1',
      title: 'Happening Today',
      category: 'Anniversary',
      date: '2026-06-15',
      time: '19:00',
      venue: 'Grand Ballroom',
      budgetTotal: 5000,
      targetGuestCount: 50,
      description: 'Today celebration',
      status: 'confirmed',
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'upcoming-20d',
      title: 'Summer Gala in 20 Days',
      category: 'Festival',
      date: '2026-07-05',
      time: '14:00',
      venue: 'City Park',
      budgetTotal: 8000,
      targetGuestCount: 150,
      description: 'Summer fun',
      status: 'planning',
      createdAt: '2026-05-10T00:00:00Z',
      updatedAt: '2026-05-10T00:00:00Z',
    },
    {
      id: 'upcoming-45d',
      title: 'August Wedding in 50 Days',
      category: 'Wedding',
      date: '2026-08-04',
      time: '16:00',
      venue: 'Vineyard',
      budgetTotal: 20000,
      targetGuestCount: 100,
      description: 'Romantic evening',
      status: 'confirmed',
      createdAt: '2026-05-15T00:00:00Z',
      updatedAt: '2026-05-15T00:00:00Z',
    },
    {
      id: 'far-future',
      title: 'New Year Eve 2027',
      category: 'Festival',
      date: '2026-12-31',
      time: '21:00',
      venue: 'Sky Lounge',
      budgetTotal: 12000,
      targetGuestCount: 200,
      description: 'NYE party',
      status: 'planning',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    },
  ];

  it('returns all events unchanged when option is "all"', () => {
    const result = filterEventsByDate(mockEvents, 'all', refDate);
    expect(result.length).toBe(5);
  });

  it('filters past events correctly', () => {
    const result = filterEventsByDate(mockEvents, 'past', refDate);
    expect(result.map((e) => e.id)).toEqual(['past-1']);
  });

  it('filters events within next 30 days including today', () => {
    const result = filterEventsByDate(mockEvents, 'upcoming-30', refDate);
    // Today (2026-06-15) and Summer Gala in 20 days (2026-07-05) are within 30 days
    expect(result.map((e) => e.id)).toEqual(['today-1', 'upcoming-20d']);
  });

  it('filters events within current calendar month', () => {
    const result = filterEventsByDate(mockEvents, 'this-month', refDate);
    // Month is June 2026 -> today-1 (2026-06-15)
    expect(result.map((e) => e.id)).toEqual(['today-1']);
  });

  it('filters events within next 90 days', () => {
    const result = filterEventsByDate(mockEvents, 'next-90', refDate);
    // Within 90 days from June 15: June 15, July 5, Aug 4 (50 days away). NYE is ~200 days away.
    expect(result.map((e) => e.id)).toEqual(['today-1', 'upcoming-20d', 'upcoming-45d']);
  });

  it('handles empty event list gracefully', () => {
    const result = filterEventsByDate([], 'upcoming-30', refDate);
    expect(result).toEqual([]);
  });

  it('handles invalid date strings gracefully without throwing', () => {
    const malformedEvents: EventItem[] = [
      {
        ...mockEvents[0],
        id: 'invalid-date-evt',
        date: 'not-a-valid-date',
      },
    ];
    expect(() => filterEventsByDate(malformedEvents, 'upcoming-30', refDate)).not.toThrow();
  });
});

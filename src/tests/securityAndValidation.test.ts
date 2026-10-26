import { describe, it, expect } from 'vitest';
import {
  isSafeImageUrl,
  sanitizeImageUrl,
  sanitizeString,
  parseSafeNumber,
  validateGuestInput,
  validateBackupSchema,
  sanitizeBackupData,
  validateEventInput,
  validateExpenseInput,
} from '../utils/eventCalculations';

describe('Security: Image URL Sanitization & Injection Defense', () => {
  it('allows safe HTTPS, HTTP, relative asset URLs, and image data URIs', () => {
    expect(isSafeImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552')).toBe(true);
    expect(isSafeImageUrl('http://example.com/banner.jpg')).toBe(true);
    expect(isSafeImageUrl('/src/assets/images/celebration_wedding_1792744715346.jpg')).toBe(true);
    expect(isSafeImageUrl('./assets/party.png')).toBe(true);
    expect(isSafeImageUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')).toBe(true);
  });

  it('strictly blocks javascript: URI schemes and case-insensitive variations', () => {
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('JAVASCRIPT:alert(document.cookie)')).toBe(false);
    expect(isSafeImageUrl('  javascript:void(0)')).toBe(false);
    expect(isSafeImageUrl('java\nscript:alert(1)')).toBe(false);
  });

  it('blocks data:text/html, vbscript:, and file: URI schemes', () => {
    expect(isSafeImageUrl('data:text/html,<script>alert("xss")</script>')).toBe(false);
    expect(isSafeImageUrl('data:text/javascript;alert(1)')).toBe(false);
    expect(isSafeImageUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeImageUrl('file:///etc/passwd')).toBe(false);
  });

  it('sanitizeImageUrl falls back safely when malicious input is supplied', () => {
    const fallback = '/src/assets/images/celebration_wedding_1792744715346.jpg';
    expect(sanitizeImageUrl('javascript:alert(1)')).toBe(fallback);
    expect(sanitizeImageUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(fallback);
    expect(sanitizeImageUrl('')).toBe(fallback);
    expect(sanitizeImageUrl('https://example.com/hero.jpg')).toBe('https://example.com/hero.jpg');
  });
});

describe('Security: String Sanitization & Control Character Stripping', () => {
  it('strips null bytes and non-printable ASCII control characters', () => {
    const malicious = 'Celebration\x00Party\x07With\x1BBand\x7F!';
    const cleaned = sanitizeString(malicious);
    expect(cleaned).toBe('CelebrationPartyWithBand!');
  });

  it('enforces maxLength truncation to prevent payload bloating', () => {
    const longString = 'A'.repeat(500);
    const sanitized = sanitizeString(longString, 50);
    expect(sanitized.length).toBe(50);
  });

  it('trims outer whitespace', () => {
    expect(sanitizeString('   Gala Dinner   ')).toBe('Gala Dinner');
  });
});

describe('Security: Safe Number Parsing & Range Bounds', () => {
  it('parses valid numeric values and strings correctly', () => {
    expect(parseSafeNumber(42)).toBe(42);
    expect(parseSafeNumber('150.75')).toBe(150.75);
  });

  it('recovers with fallback on NaN, null, undefined, or Infinity', () => {
    expect(parseSafeNumber(NaN, 10)).toBe(10);
    expect(parseSafeNumber(Infinity, 0)).toBe(0);
    expect(parseSafeNumber(-Infinity, 0)).toBe(0);
    expect(parseSafeNumber(undefined, 5)).toBe(5);
    expect(parseSafeNumber('invalid-number', 12)).toBe(12);
  });

  it('clamps numbers within min and max constraints', () => {
    expect(parseSafeNumber(-50, 0, 0, 1000)).toBe(0);
    expect(parseSafeNumber(999999999, 0, 0, 100000)).toBe(100000);
  });
});

describe('Security: Backup Validation & Prototype Pollution Defense', () => {
  it('detects and rejects payloads with __proto__ keys', () => {
    const maliciousJson = '{"version":1,"exportedAt":"2026-03-30T00:00:00Z","events":[],"guests":[],"expenses":[],"tasks":[],"__proto__":{"isAdmin":true}}';
    const result = validateBackupSchema(maliciousJson);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/prototype pollution/i);
  });

  it('detects and rejects payloads with constructor or prototype property tampering', () => {
    const rawData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      events: [],
      guests: [],
      expenses: [],
      tasks: [],
      constructor: { isTampered: true },
    };
    const result = validateBackupSchema(rawData);
    expect(result.isValid).toBe(false);
  });

  it('rejects oversized backup arrays that could cause DoS memory exhaustion', () => {
    const oversizedEvents = Array.from({ length: 5001 }, (_, i) => ({ id: `evt-${i}` }));
    const rawData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      events: oversizedEvents,
      guests: [],
      expenses: [],
      tasks: [],
    };
    const result = validateBackupSchema(rawData);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('maximum capacity');
  });

  it('sanitizeBackupData sanitizes every event, guest, expense, and task item', () => {
    const rawPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      events: [
        {
          id: 'evt-1',
          title: 'Evil\x00Title',
          coverImage: 'javascript:alert(1)',
          budgetTotal: 1000000000,
          targetGuestCount: 50,
          date: '2026-10-10',
          venue: 'Venue',
          category: 'Birthday',
          status: 'planning',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      guests: [],
      expenses: [],
      tasks: [],
    };

    const sanitized = sanitizeBackupData(rawPayload);
    expect(sanitized.events[0].title).toBe('EvilTitle');
    expect(sanitized.events[0].coverImage).not.toContain('javascript:');
    expect(sanitized.events[0].budgetTotal).toBeLessThanOrEqual(100000000);
  });
});

describe('Security & Validation: Guest Input Hardening', () => {
  it('validates proper international and domestic phone formats', () => {
    const validUS = validateGuestInput({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 (555) 234-5678',
      plusOnes: 2,
    });
    expect(validUS.isValid).toBe(true);

    const validIntl = validateGuestInput({
      name: 'Pierre Martin',
      email: 'pierre@example.fr',
      phone: '+33 1 42 68 55 00',
      plusOnes: 0,
    });
    expect(validIntl.isValid).toBe(true);
  });

  it('rejects script tags or malicious text in phone numbers', () => {
    const xssPhone = validateGuestInput({
      name: 'Bob Smith',
      phone: '<script>alert(1)</script>',
    });
    expect(xssPhone.isValid).toBe(false);
    expect(xssPhone.errors.phone).toBeDefined();

    const alphaPhone = validateGuestInput({
      name: 'Bob Smith',
      phone: '1-800-CALL-NOW-PLEASE-EXTRA',
    });
    expect(alphaPhone.isValid).toBe(false);
    expect(alphaPhone.errors.phone).toBeDefined();
  });

  it('enforces bounds on plusOnes', () => {
    const excessivePlusOnes = validateGuestInput({
      name: 'Overcrowder',
      plusOnes: 99,
    });
    expect(excessivePlusOnes.isValid).toBe(false);
    expect(excessivePlusOnes.errors.plusOnes).toBeDefined();

    const negativePlusOnes = validateGuestInput({
      name: 'Subtractor',
      plusOnes: -1,
    });
    expect(negativePlusOnes.isValid).toBe(false);
    expect(negativePlusOnes.errors.plusOnes).toBeDefined();
  });
});

describe('Security & Validation: Expense & Event Input Boundaries', () => {
  it('rejects astronomical budgets and expenses beyond normal celebration scales', () => {
    const hugeBudget = validateEventInput({
      title: 'Mega Galaxy Party',
      date: '2026-12-31',
      venue: 'Moon Base Alpha',
      budgetTotal: 999999999999,
    });
    expect(hugeBudget.isValid).toBe(false);
    expect(hugeBudget.errors.budgetTotal).toBeDefined();

    const hugeExpense = validateExpenseInput({
      name: 'Catering',
      category: 'Catering',
      estimatedCost: 500000000,
    });
    expect(hugeExpense.isValid).toBe(false);
    expect(hugeExpense.errors.estimatedCost).toBeDefined();
  });
});

import {
  DateFilterOption,
  DietaryRequirement,
  EventItem,
  ExpenseCategory,
  ExpenseItem,
  GuestGroup,
  GuestItem,
  RsvpStatus,
  TaskItem,
} from '../types';

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remainingBudget: number;
  unpaidBalance: number;
  isOverBudget: boolean;
  overspendingAmount: number;
  spentPercentage: number;
  paidPercentage: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    estimated: number;
    actual: number;
    paid: number;
    itemCount: number;
    percentageOfSpent: number;
  }[];
}

export interface GuestSummary {
  totalInvited: number;
  attending: number;
  declined: number;
  tentative: number;
  pending: number;
  totalHeadcount: number;
  potentialHeadcount: number;
  rsvpRate: number;
  attendingRate: number;
  dietaryBreakdown: Record<DietaryRequirement, number>;
  groupBreakdown: Record<GuestGroup, number>;
}

export interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
  progressPercentage: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriorityPending: number;
}

/**
 * Safe numeric parser with minimum and maximum bounds protection.
 */
export function parseSafeNumber(val: unknown, fallback = 0, min?: number, max?: number): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    let result = fallback;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  }
  let result = num;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

/**
 * Strips non-printable ASCII control characters and limits string length.
 * Neutralizes control-character injection while preserving readable unicode text.
 */
export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  // Remove ASCII control characters (0-8, 11-12, 14-31, 127) except tab and newline
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Verifies if an image URL is safe to render in the DOM.
 * Permits secure HTTPS/HTTP protocols, local static asset paths, or safe raster/vector data URIs.
 * Strictly blocks 'javascript:', 'data:text/html', 'vbscript:', 'file:', and control characters.
 */
export function isSafeImageUrl(url: unknown): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Safe local asset paths (e.g. /src/assets/images/..., ./assets/party.png, /assets/...)
  if (/^(?:\.\/|\/)(?:src\/)?assets\/(?:images\/)?[a-zA-Z0-9_\-./]+\.(?:jpg|jpeg|png|webp|svg|gif)$/i.test(trimmed)) {
    return true;
  }

  // Safe HTTP and HTTPS URLs with valid hostname
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return Boolean(parsed.hostname && parsed.hostname.includes('.'));
    }
    if (parsed.protocol === 'data:') {
      return /^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);
    }
  } catch {
    // Relative path or data URL regex
    return /^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);
  }

  return false;
}

/**
 * Sanitizes an image URL, falling back to a safe default preset if invalid or potentially malicious.
 */
export function sanitizeImageUrl(
  url: unknown,
  fallback = '/src/assets/images/celebration_wedding_1792744715346.jpg'
): string {
  if (typeof url === 'string' && isSafeImageUrl(url)) {
    return url.trim();
  }
  return fallback;
}

/**
 * Converts a YYYY-MM-DD string into a normalized UTC timestamp representing the start of that calendar day.
 * Eliminates daylight saving time transitions and timezone drift.
 */
export function parseDateToUtc(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return NaN;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return NaN;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return NaN;
  return Date.UTC(year, month, day);
}

/**
 * Calculate difference in whole calendar days between target date string and reference date.
 * Fully DST-resilient and timezone-proof.
 */
export function getDaysUntil(dateStr: string, referenceDate = new Date()): number {
  const targetUtc = parseDateToUtc(dateStr);
  if (isNaN(targetUtc)) return 0;

  const refUtc = Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const diffMs = targetUtc - refUtc;
  const MS_PER_DAY = 86400000;
  return Math.round(diffMs / MS_PER_DAY);
}

export function formatEventCountdown(dateStr: string, referenceDate = new Date()): string {
  const days = getDaysUntil(dateStr, referenceDate);
  if (days < 0) {
    return `${Math.abs(days)}d ago`;
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `in ${days} days`;
}

export function formatCurrency(amount: number): string {
  const safe = parseSafeNumber(amount, 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const utc = parseDateToUtc(dateStr);
  if (isNaN(utc)) return dateStr;

  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function calculateBudgetSummary(
  eventBudget: number,
  expenses: ExpenseItem[]
): BudgetSummary {
  const totalBudget = parseSafeNumber(eventBudget, 0, 0);
  const totalEstimated = expenses.reduce((sum, item) => sum + parseSafeNumber(item.estimatedCost, 0, 0), 0);
  const totalActual = expenses.reduce((sum, item) => sum + parseSafeNumber(item.actualCost, 0, 0), 0);
  const totalPaid = expenses.reduce((sum, item) => sum + parseSafeNumber(item.paidAmount, 0, 0), 0);

  const remainingBudget = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget;
  const overspendingAmount = isOverBudget ? totalActual - totalBudget : 0;
  const unpaidBalance = Math.max(0, totalActual - totalPaid);

  const spentPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : (totalActual > 0 ? 100 : 0);
  const paidPercentage = totalActual > 0 ? Math.min(100, (totalPaid / totalActual) * 100) : 0;

  // Category breakdown
  const categoryMap: Partial<Record<ExpenseCategory, { estimated: number; actual: number; paid: number; count: number }>> = {};

  expenses.forEach((item) => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { estimated: 0, actual: 0, paid: 0, count: 0 };
    }
    const cat = categoryMap[item.category]!;
    cat.estimated += parseSafeNumber(item.estimatedCost, 0, 0);
    cat.actual += parseSafeNumber(item.actualCost, 0, 0);
    cat.paid += parseSafeNumber(item.paidAmount, 0, 0);
    cat.count += 1;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat as ExpenseCategory,
    estimated: data.estimated,
    actual: data.actual,
    paid: data.paid,
    itemCount: data.count,
    percentageOfSpent: totalActual > 0 ? (data.actual / totalActual) * 100 : 0,
  })).sort((a, b) => b.actual - a.actual);

  return {
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingBudget,
    unpaidBalance,
    isOverBudget,
    overspendingAmount,
    spentPercentage,
    paidPercentage,
    categoryBreakdown,
  };
}

export function calculateGuestSummary(guests: GuestItem[]): GuestSummary {
  const totalInvited = guests.length;
  let attending = 0;
  let declined = 0;
  let tentative = 0;
  let pending = 0;
  let totalHeadcount = 0;
  let potentialHeadcount = 0;

  const dietaryBreakdown: Record<DietaryRequirement, number> = {
    None: 0,
    Vegetarian: 0,
    Vegan: 0,
    'Gluten-Free': 0,
    Halal: 0,
    Kosher: 0,
    'Nut Allergy': 0,
    Other: 0,
  };

  const groupBreakdown: Record<GuestGroup, number> = {
    Family: 0,
    Friends: 0,
    VIP: 0,
    Colleagues: 0,
    Vendors: 0,
  };

  guests.forEach((guest) => {
    if (guest.dietary && dietaryBreakdown[guest.dietary] !== undefined) {
      dietaryBreakdown[guest.dietary] += 1;
    } else {
      dietaryBreakdown.None += 1;
    }

    if (guest.group && groupBreakdown[guest.group] !== undefined) {
      groupBreakdown[guest.group] += 1;
    }

    const guestCount = 1 + parseSafeNumber(guest.plusOnes, 0, 0);

    switch (guest.rsvpStatus) {
      case 'Attending':
        attending += 1;
        totalHeadcount += guestCount;
        potentialHeadcount += guestCount;
        break;
      case 'Declined':
        declined += 1;
        break;
      case 'Tentative':
        tentative += 1;
        potentialHeadcount += guestCount;
        break;
      case 'Pending':
      default:
        pending += 1;
        break;
    }
  });

  const responded = attending + declined + tentative;
  const rsvpRate = totalInvited > 0 ? (responded / totalInvited) * 100 : 0;
  const attendingRate = responded > 0 ? (attending / responded) * 100 : 0;

  return {
    totalInvited,
    attending,
    declined,
    tentative,
    pending,
    totalHeadcount,
    potentialHeadcount,
    rsvpRate,
    attendingRate,
    dietaryBreakdown,
    groupBreakdown,
  };
}

export function calculateTaskSummary(tasks: TaskItem[], referenceDate = new Date()): TaskSummary {
  const total = tasks.length;
  let completed = 0;
  let overdue = 0;
  let dueToday = 0;
  let dueThisWeek = 0;
  let highPriorityPending = 0;

  tasks.forEach((task) => {
    if (task.completed) {
      completed += 1;
      return;
    }

    if (task.priority === 'High') {
      highPriorityPending += 1;
    }

    if (!task.dueDate) return;

    const daysUntil = getDaysUntil(task.dueDate, referenceDate);

    if (daysUntil < 0) {
      overdue += 1;
    } else if (daysUntil === 0) {
      dueToday += 1;
    } else if (daysUntil <= 7) {
      dueThisWeek += 1;
    }
  });

  const pending = total - completed;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    progressPercentage,
    overdue,
    dueToday,
    dueThisWeek,
    highPriorityPending,
  };
}

/**
 * Filter events by Date Filter option.
 */
export function filterEventsByDate(
  events: EventItem[],
  dateOption: DateFilterOption,
  referenceDate = new Date()
): EventItem[] {
  if (dateOption === 'All' || dateOption === 'all') return events;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed

  return events.filter((evt) => {
    const daysUntil = getDaysUntil(evt.date, referenceDate);

    switch (dateOption) {
      case 'upcoming-30':
        return daysUntil >= 0 && daysUntil <= 30;
      case 'this-month': {
        const parts = evt.date.split('-');
        if (parts.length !== 3) return false;
        const evtYear = parseInt(parts[0], 10);
        const evtMonth = parseInt(parts[1], 10) - 1;
        return evtYear === currentYear && evtMonth === currentMonth;
      }
      case 'next-90':
        return daysUntil >= 0 && daysUntil <= 90;
      case 'past':
        return daysUntil < 0;
      default:
        return true;
    }
  });
}

// Validation helpers
export function validateEventInput(data: Partial<EventItem>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Event title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Event title must be at least 3 characters';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Event title must be 120 characters or fewer';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  } else {
    const utc = parseDateToUtc(data.date);
    if (isNaN(utc)) {
      errors.date = 'Please provide a valid date format (YYYY-MM-DD)';
    }
  }

  if (!data.venue || data.venue.trim().length === 0) {
    errors.venue = 'Venue name is required';
  } else if (data.venue.trim().length > 150) {
    errors.venue = 'Venue name must be 150 characters or fewer';
  }

  if (data.venueAddress && data.venueAddress.trim().length > 200) {
    errors.venueAddress = 'Venue address must be 200 characters or fewer';
  }

  if (data.targetGuestCount !== undefined) {
    if (data.targetGuestCount < 0) {
      errors.targetGuestCount = 'Target guest count cannot be negative';
    } else if (data.targetGuestCount > 1000000) {
      errors.targetGuestCount = 'Target guest count cannot exceed 1,000,000';
    }
  }

  if (data.budgetTotal !== undefined) {
    if (data.budgetTotal < 0) {
      errors.budgetTotal = 'Total budget cannot be negative';
    } else if (data.budgetTotal > 100000000) {
      errors.budgetTotal = 'Total budget cannot exceed $100,000,000';
    }
  }

  if (data.coverImage && data.coverImage.trim().length > 0) {
    if (!isSafeImageUrl(data.coverImage)) {
      errors.coverImage = 'Cover image must be a safe http(s) URL, valid asset path, or data image';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateExpenseInput(data: Partial<ExpenseItem>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Expense description is required';
  } else if (data.name.trim().length > 120) {
    errors.name = 'Expense description must be 120 characters or fewer';
  }

  if (!data.category) {
    errors.category = 'Expense category is required';
  }

  if (data.vendor && data.vendor.trim().length > 150) {
    errors.vendor = 'Vendor name must be 150 characters or fewer';
  }

  if (data.actualCost !== undefined) {
    const num = Number(data.actualCost);
    if (isNaN(num) || num < 0) {
      errors.actualCost = 'Actual cost must be a positive number';
    } else if (num > 100000000) {
      errors.actualCost = 'Actual cost cannot exceed $100,000,000';
    }
  }

  if (data.estimatedCost !== undefined) {
    const num = Number(data.estimatedCost);
    if (isNaN(num) || num < 0) {
      errors.estimatedCost = 'Estimated cost must be a positive number';
    } else if (num > 100000000) {
      errors.estimatedCost = 'Estimated cost cannot exceed $100,000,000';
    }
  }

  if (data.paidAmount !== undefined) {
    const num = Number(data.paidAmount);
    if (isNaN(num) || num < 0) {
      errors.paidAmount = 'Paid amount must be a positive number';
    } else if (num > 100000000) {
      errors.paidAmount = 'Paid amount cannot exceed $100,000,000';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateGuestInput(data: Partial<GuestItem>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Guest name is required';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Guest name must be 100 characters or fewer';
  }

  if (data.email && data.email.trim().length > 0) {
    const trimmed = data.email.trim();
    if (trimmed.length > 120) {
      errors.email = 'Email must be 120 characters or fewer';
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(trimmed)) {
        errors.email = 'Please provide a valid email address';
      }
    }
  }

  if (data.phone && data.phone.trim().length > 0) {
    const trimmedPhone = data.phone.trim();
    if (trimmedPhone.length > 25) {
      errors.phone = 'Phone number must be 25 characters or fewer';
    } else if (!/^[+()0-9\s.-]{7,25}$/.test(trimmedPhone)) {
      errors.phone = 'Please provide a valid phone number';
    }
  }

  if (data.plusOnes !== undefined) {
    if (data.plusOnes < 0) {
      errors.plusOnes = 'Plus-ones cannot be negative';
    } else if (data.plusOnes > 20) {
      errors.plusOnes = 'Plus-ones cannot exceed 20 guests';
    }
  }

  if (data.tableNumber && data.tableNumber.trim().length > 20) {
    errors.tableNumber = 'Table number must be 20 characters or fewer';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTaskInput(data: Partial<TaskItem>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Task title must be 150 characters or fewer';
  }

  if (data.assignedTo && data.assignedTo.trim().length > 100) {
    errors.assignedTo = 'Assignee must be 100 characters or fewer';
  }

  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const utc = parseDateToUtc(data.dueDate);
    if (isNaN(utc)) {
      errors.dueDate = 'Please provide a valid due date (YYYY-MM-DD)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Strict schema validation for backup JSON archives with prototype pollution protection.
 */
export function validateBackupSchema(data: unknown): { isValid: boolean; error?: string } {
  if (typeof data === 'string') {
    if (data.includes('__proto__') || data.includes('"constructor"') || data.includes('"prototype"')) {
      return { isValid: false, error: 'Backup contains prohibited prototype pollution keys' };
    }
    try {
      data = JSON.parse(data);
    } catch {
      return { isValid: false, error: 'Invalid JSON format in backup file' };
    }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, error: 'Backup data must be an object' };
  }

  const obj = data as Record<string, unknown>;

  // Block prototype pollution
  if (
    Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
    Object.prototype.hasOwnProperty.call(obj, 'constructor') ||
    Object.prototype.hasOwnProperty.call(obj, 'prototype')
  ) {
    return { isValid: false, error: 'Backup contains prohibited prototype pollution keys' };
  }

  if (!Array.isArray(obj.events)) {
    return { isValid: false, error: 'Backup is missing required "events" array' };
  }

  if (obj.events.length > 5000) {
    return { isValid: false, error: 'Events list exceeds maximum capacity (5,000 events)' };
  }

  for (let i = 0; i < obj.events.length; i++) {
    const item = obj.events[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { isValid: false, error: `Event at index ${i} is not a valid object` };
    }
    const e = item as Record<string, unknown>;
    if (!e.id || typeof e.id !== 'string') {
      return { isValid: false, error: `Event at index ${i} is missing a valid id` };
    }
    if (!e.title || typeof e.title !== 'string') {
      return { isValid: false, error: `Event at index ${i} is missing a valid title` };
    }
    if (!e.date || typeof e.date !== 'string') {
      return { isValid: false, error: `Event at index ${i} is missing a valid date` };
    }
  }

  if (obj.expenses !== undefined) {
    if (!Array.isArray(obj.expenses)) {
      return { isValid: false, error: '"expenses" must be an array' };
    }
    if (obj.expenses.length > 20000) {
      return { isValid: false, error: 'Expenses list exceeds maximum allowable limit (20,000 items)' };
    }
  }

  if (obj.guests !== undefined) {
    if (!Array.isArray(obj.guests)) {
      return { isValid: false, error: '"guests" must be an array' };
    }
    if (obj.guests.length > 20000) {
      return { isValid: false, error: 'Guests list exceeds maximum allowable limit (20,000 items)' };
    }
  }

  if (obj.tasks !== undefined) {
    if (!Array.isArray(obj.tasks)) {
      return { isValid: false, error: '"tasks" must be an array' };
    }
    if (obj.tasks.length > 20000) {
      return { isValid: false, error: 'Tasks list exceeds maximum allowable limit (20,000 items)' };
    }
  }

  return { isValid: true };
}

/**
 * Deeply sanitizes parsed backup data, ensuring types and safe protocols.
 */
export function sanitizeBackupData(data: Record<string, unknown>): {
  events: EventItem[];
  expenses: ExpenseItem[];
  guests: GuestItem[];
  tasks: TaskItem[];
} {
  const rawEvents = Array.isArray(data.events) ? data.events : [];
  const rawExpenses = Array.isArray(data.expenses) ? data.expenses : [];
  const rawGuests = Array.isArray(data.guests) ? data.guests : [];
  const rawTasks = Array.isArray(data.tasks) ? data.tasks : [];

  const events: EventItem[] = rawEvents
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((e) => ({
      id: sanitizeString(e.id, 64) || 'evt-' + Math.random().toString(36).slice(2, 9),
      title: sanitizeString(e.title, 120) || 'Untitled Celebration',
      category: (e.category as any) || 'Birthday',
      date: sanitizeString(e.date, 10),
      time: sanitizeString(e.time, 5) || '18:00',
      venue: sanitizeString(e.venue, 150) || 'TBD',
      venueAddress: e.venueAddress ? sanitizeString(e.venueAddress, 200) : undefined,
      description: sanitizeString(e.description, 1000),
      targetGuestCount: parseSafeNumber(e.targetGuestCount, 0, 0, 1000000),
      budgetTotal: parseSafeNumber(e.budgetTotal, 0, 0, 100000000),
      status: (['planning', 'confirmed', 'completed', 'cancelled'].includes(String(e.status))
        ? e.status
        : 'planning') as any,
      coverImage: isSafeImageUrl(e.coverImage)
        ? String(e.coverImage).trim()
        : '/src/assets/images/celebration_wedding_1792744715346.jpg',
      notes: e.notes ? sanitizeString(e.notes, 2000) : undefined,
      createdAt: sanitizeString(e.createdAt, 30) || new Date().toISOString(),
      updatedAt: sanitizeString(e.updatedAt, 30) || new Date().toISOString(),
    }));

  const expenses: ExpenseItem[] = rawExpenses
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((exp) => ({
      id: sanitizeString(exp.id, 64) || 'exp-' + Math.random().toString(36).slice(2, 9),
      eventId: sanitizeString(exp.eventId, 64),
      name: sanitizeString(exp.name, 120) || 'Expense',
      category: (exp.category as any) || 'Miscellaneous',
      estimatedCost: parseSafeNumber(exp.estimatedCost, 0, 0, 100000000),
      actualCost: parseSafeNumber(exp.actualCost, 0, 0, 100000000),
      paidAmount: parseSafeNumber(exp.paidAmount, 0, 0, 100000000),
      isPaid: Boolean(exp.isPaid),
      dueDate: exp.dueDate ? sanitizeString(exp.dueDate, 10) : undefined,
      vendor: exp.vendor ? sanitizeString(exp.vendor, 150) : undefined,
      notes: exp.notes ? sanitizeString(exp.notes, 1000) : undefined,
      receiptNote: exp.receiptNote ? sanitizeString(exp.receiptNote, 500) : undefined,
    }));

  const guests: GuestItem[] = rawGuests
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((g) => ({
      id: sanitizeString(g.id, 64) || 'gst-' + Math.random().toString(36).slice(2, 9),
      eventId: sanitizeString(g.eventId, 64),
      name: sanitizeString(g.name, 100) || 'Guest',
      email: sanitizeString(g.email, 120),
      phone: g.phone ? sanitizeString(g.phone, 25) : undefined,
      group: (g.group as any) || 'Friends',
      rsvpStatus: (['Attending', 'Declined', 'Tentative', 'Pending'].includes(String(g.rsvpStatus))
        ? g.rsvpStatus
        : 'Pending') as any,
      invitationStatus: (['Not Sent', 'Sent', 'Delivered'].includes(String(g.invitationStatus))
        ? g.invitationStatus
        : 'Sent') as any,
      dietary: (g.dietary as any) || 'None',
      dietaryNotes: g.dietaryNotes ? sanitizeString(g.dietaryNotes, 255) : undefined,
      plusOnes: parseSafeNumber(g.plusOnes, 0, 0, 20),
      tableNumber: g.tableNumber ? sanitizeString(g.tableNumber, 20) : undefined,
      notes: g.notes ? sanitizeString(g.notes, 1000) : undefined,
    }));

  const tasks: TaskItem[] = rawTasks
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((t) => ({
      id: sanitizeString(t.id, 64) || 'tsk-' + Math.random().toString(36).slice(2, 9),
      eventId: sanitizeString(t.eventId, 64),
      title: sanitizeString(t.title, 150) || 'Task',
      category: (t.category as any) || 'Planning',
      priority: (['High', 'Medium', 'Low'].includes(String(t.priority)) ? t.priority : 'Medium') as any,
      dueDate: sanitizeString(t.dueDate, 10),
      completed: Boolean(t.completed),
      assignedTo: t.assignedTo ? sanitizeString(t.assignedTo, 100) : undefined,
      notes: t.notes ? sanitizeString(t.notes, 1000) : undefined,
    }));

  return { events, expenses, guests, tasks };
}

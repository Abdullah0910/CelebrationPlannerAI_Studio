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
 * Safe numeric parser with minimum bounds protection.
 */
export function parseSafeNumber(val: unknown, fallback = 0, min?: number): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    return min !== undefined ? Math.max(min, fallback) : fallback;
  }
  return min !== undefined ? Math.max(min, num) : num;
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
  }

  if (data.targetGuestCount !== undefined && data.targetGuestCount < 0) {
    errors.targetGuestCount = 'Target guest count cannot be negative';
  }

  if (data.budgetTotal !== undefined && data.budgetTotal < 0) {
    errors.budgetTotal = 'Total budget cannot be negative';
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
  }

  if (!data.category) {
    errors.category = 'Expense category is required';
  }

  if (data.actualCost !== undefined && (isNaN(Number(data.actualCost)) || Number(data.actualCost) < 0)) {
    errors.actualCost = 'Actual cost must be a positive number';
  }

  if (data.estimatedCost !== undefined && (isNaN(Number(data.estimatedCost)) || Number(data.estimatedCost) < 0)) {
    errors.estimatedCost = 'Estimated cost must be a positive number';
  }

  if (data.paidAmount !== undefined && (isNaN(Number(data.paidAmount)) || Number(data.paidAmount) < 0)) {
    errors.paidAmount = 'Paid amount must be a positive number';
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
  }

  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
  }

  if (data.plusOnes !== undefined && data.plusOnes < 0) {
    errors.plusOnes = 'Plus-ones cannot be negative';
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
 * Strict schema validation for backup JSON archives.
 */
export function validateBackupSchema(data: unknown): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Backup data must be an object' };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.events)) {
    return { isValid: false, error: 'Backup is missing required "events" array' };
  }

  for (let i = 0; i < obj.events.length; i++) {
    const item = obj.events[i];
    if (!item || typeof item !== 'object') {
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

  if (obj.expenses !== undefined && !Array.isArray(obj.expenses)) {
    return { isValid: false, error: '"expenses" must be an array' };
  }

  if (obj.guests !== undefined && !Array.isArray(obj.guests)) {
    return { isValid: false, error: '"guests" must be an array' };
  }

  if (obj.tasks !== undefined && !Array.isArray(obj.tasks)) {
    return { isValid: false, error: '"tasks" must be an array' };
  }

  return { isValid: true };
}

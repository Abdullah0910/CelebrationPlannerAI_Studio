import {
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
  totalHeadcount: number; // Includes guest + their plus-ones for attending
  potentialHeadcount: number; // Includes attending + tentative + plus-ones
  rsvpRate: number; // Percentage of guests who gave any response
  attendingRate: number; // Percentage of responded who are attending
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

export function calculateBudgetSummary(
  eventBudget: number,
  expenses: ExpenseItem[]
): BudgetSummary {
  const totalBudget = Math.max(0, eventBudget || 0);
  const totalEstimated = expenses.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  const totalActual = expenses.reduce((sum, item) => sum + (Number(item.actualCost) || 0), 0);
  const totalPaid = expenses.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0);

  const remainingBudget = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget && totalBudget > 0;
  const overspendingAmount = isOverBudget ? totalActual - totalBudget : 0;
  const unpaidBalance = Math.max(0, totalActual - totalPaid);

  const spentPercentage = totalBudget > 0 ? Math.min(100, (totalActual / totalBudget) * 100) : 0;
  const paidPercentage = totalActual > 0 ? Math.min(100, (totalPaid / totalActual) * 100) : 0;

  // Category breakdown
  const categoryMap: Partial<Record<ExpenseCategory, { estimated: number; actual: number; paid: number; count: number }>> = {};

  expenses.forEach((item) => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { estimated: 0, actual: 0, paid: 0, count: 0 };
    }
    const cat = categoryMap[item.category]!;
    cat.estimated += Number(item.estimatedCost) || 0;
    cat.actual += Number(item.actualCost) || 0;
    cat.paid += Number(item.paidAmount) || 0;
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
    // Dietary
    dietaryBreakdown[guest.dietary] = (dietaryBreakdown[guest.dietary] || 0) + 1;

    // Group
    groupBreakdown[guest.group] = (groupBreakdown[guest.group] || 0) + 1;

    const guestCount = 1 + (Number(guest.plusOnes) || 0);

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

  const refDay = new Date(referenceDate);
  refDay.setHours(0, 0, 0, 0);

  const oneWeekAhead = new Date(refDay);
  oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);

  tasks.forEach((task) => {
    if (task.completed) {
      completed += 1;
      return;
    }

    if (task.priority === 'High') {
      highPriorityPending += 1;
    }

    if (!task.dueDate) return;

    const taskDate = new Date(`${task.dueDate}T00:00:00`);
    if (isNaN(taskDate.getTime())) return;

    if (taskDate < refDay) {
      overdue += 1;
    } else if (taskDate.getTime() === refDay.getTime()) {
      dueToday += 1;
    } else if (taskDate <= oneWeekAhead) {
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

export function getDaysUntil(dateStr: string, referenceDate = new Date()): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - ref.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

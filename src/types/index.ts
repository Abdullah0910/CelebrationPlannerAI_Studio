export type EventType =
  | 'Birthday'
  | 'Wedding'
  | 'Anniversary'
  | 'Graduation'
  | 'Family Gathering'
  | 'Festival'
  | 'Corporate';

export type EventStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface EventItem {
  id: string;
  title: string;
  category: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  venueAddress?: string;
  description: string;
  targetGuestCount: number;
  budgetTotal: number;
  status: EventStatus;
  coverImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Venue'
  | 'Catering'
  | 'Decor & Florals'
  | 'Photography & Video'
  | 'Entertainment & Music'
  | 'Attire & Beauty'
  | 'Invitations & Favors'
  | 'Transportation & Logistics'
  | 'Miscellaneous';

export interface ExpenseItem {
  id: string;
  eventId: string;
  name: string;
  category: ExpenseCategory;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  isPaid: boolean;
  dueDate?: string;
  vendor?: string;
  notes?: string;
  receiptNote?: string;
}

export type GuestGroup = 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Vendors';

export type RsvpStatus = 'Attending' | 'Declined' | 'Tentative' | 'Pending';

export type InvitationStatus = 'Not Sent' | 'Sent' | 'Delivered';

export type DietaryRequirement =
  | 'None'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Halal'
  | 'Kosher'
  | 'Nut Allergy'
  | 'Other';

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  group: GuestGroup;
  rsvpStatus: RsvpStatus;
  invitationStatus: InvitationStatus;
  dietary: DietaryRequirement;
  dietaryNotes?: string;
  plusOnes: number;
  tableNumber?: string;
  notes?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskCategory =
  | 'Planning'
  | 'Vendor'
  | 'Invitations'
  | 'Decor'
  | 'Logistics'
  | 'Day-of';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  assignedTo?: string;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'events' | 'budget' | 'guests' | 'tasks' | 'calendar' | 'settings';

export type ThemePreset = 'gold' | 'rose' | 'indigo' | 'emerald' | 'noir';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  description: string;
  accentClass: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  gradient: string;
  tagline: string;
}

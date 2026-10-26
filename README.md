# Fête Planner — Celebration & Event Planner

A modern, responsive Celebration & Event Planner web application built with React, TypeScript, and Tailwind CSS. Designed to organize and orchestrate weddings, milestone birthdays, anniversaries, graduation parties, family gatherings, festivals, and corporate galas.

---

## ✨ Core Features

- **Dashboard**:
  - Live celebration metrics: active celebrations, committed budgets vs limits, confirmed attendee headcount, and checklist completion percentage.
  - Nearest upcoming celebration spotlight card with real-time countdown badge.
  - Quick action toolbar to create events, log expenses, invite guests, and add tasks in one click.
  - Priority checklist alerting for overdue and due-today deliverables.
  - Recent celebration overview cards.

- **Event Management**:
  - Create, view, edit, and delete celebration events with titles, categories, dates, times, venue locations, and target guest capacities.
  - Support for 7 celebration categories: **Birthday**, **Wedding**, **Anniversary**, **Graduation**, **Family Gathering**, **Festival**, and **Corporate**.
  - Event status workflow: *Planning*, *Confirmed*, *Completed*, and *Cancelled*.
  - Curated high-resolution celebration photography presets or custom image URLs.
  - Global celebration context switcher to focus the entire app on one celebration or all celebrations combined.

- **Budget Planner**:
  - Set overall celebration budgets and track expenses across 9 specialized categories (*Venue*, *Catering*, *Decor & Florals*, *Photography & Video*, *Entertainment & Music*, *Attire & Beauty*, *Invitations & Favors*, *Transportation & Logistics*, *Miscellaneous*).
  - Real-time calculations of estimated vs actual costs, paid amounts, and remaining balance.
  - Automatic visual warnings and banners when actual costs exceed planned limits.
  - Category share-of-wallet progress meters.
  - Comprehensive searchable and filterable expense ledger with paid/pending status and due dates.

- **Guest Management & RSVPs**:
  - Invite guests with contact info, plus-ones, and group affiliations (*Family*, *Friends*, *VIP*, *Colleagues*, *Vendors*).
  - Track response status: *Attending*, *Pending*, *Tentative*, and *Declined*.
  - True headcount calculation factoring in guests and their respective plus-ones.
  - Catering dietary requirements tracker (*Vegetarian*, *Vegan*, *Gluten-Free*, *Halal*, *Kosher*, *Nut Allergy*, etc.) with quick catering summary counts.
  - Table seating assignment support.
  - Inline one-click RSVP status toggle.

- **Task & Checklist Management**:
  - Celebration checklist with categories (*Planning*, *Vendor*, *Invitations*, *Decor*, *Logistics*, *Day-of*).
  - Priority levels (*High*, *Medium*, *Low*) and target deadlines.
  - Overdue alerts and deadline proximity indicators (*Due Today*, *Due in X days*, *Overdue*).
  - Responsible assignee tracking and notes.

- **Chronological Calendar**:
  - Full monthly interactive calendar showing both celebration event dates and task deadlines.
  - Interactive day inspector: clicking any day displays all celebrations and checklist items due on that date.
  - Month navigation and quick "Today" shortcut.

- **Personalization & Themes**:
  - 5 tailored celebration color palettes:
    1. **Champagne Gold** (Warm celebratory amber & golden illumination)
    2. **Rose Romance** (Blush floral & velvety burgundy tones)
    3. **Royal Indigo** (Deep starlit sapphire & refined navy)
    4. **Festive Emerald** (Lush botanical evergreen & celebratory sage)
    5. **Midnight Editorial** (Sleek architectural monochrome & charcoal)
  - Full Dark Mode and Light Mode support with optical contrast compensation.

- **Data Persistence & Backups**:
  - Automatic synchronization to browser LocalStorage.
  - Downloadable JSON backup archives.
  - One-click restore from JSON backup with validation.
  - "Reset to Sample Celebrations" option to restore realistic starter celebrations.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 with custom font tokens and dark mode classes
- **Icons**: Lucide React
- **Testing**: Vitest automated unit and integration tests

### Directory Structure

```text
├── src/
│   ├── assets/
│   │   └── images/               # High-fidelity domain celebration imagery
│   ├── components/
│   │   ├── Navbar.tsx            # Top Bar Contract compliant navigation
│   │   ├── DashboardView.tsx     # Celebration overview & operational KPIs
│   │   ├── EventsView.tsx        # Event hub (grid & list view with filters)
│   │   ├── BudgetView.tsx        # Financial allocations & expense ledger
│   │   ├── GuestsView.tsx        # Guest attendee list & RSVP management
│   │   ├── TasksView.tsx         # Checklists, milestones & task tracking
│   │   ├── CalendarView.tsx      # Interactive month & day itinerary calendar
│   │   ├── SettingsView.tsx      # Theme switcher & JSON backup management
│   │   ├── EventModal.tsx        # Event creation & editing dialog
│   │   ├── ExpenseModal.tsx      # Expense recording & vendor dialog
│   │   ├── GuestModal.tsx        # Guest invitation & dietary dialog
│   │   ├── TaskModal.tsx         # Checklist item scheduling dialog
│   │   ├── ConfirmModal.tsx      # Accessible confirmation dialogs
│   │   └── Toast.tsx             # Notification toast alerts
│   ├── context/
│   │   └── EventPlannerContext.tsx # Centralized state & LocalStorage engine
│   ├── data/
│   │   └── initialData.ts        # Realistic pre-populated celebrations
│   ├── tests/
│   │   ├── eventCalculations.test.ts # Math, budget & RSVP calculations
│   │   ├── validation.test.ts        # Form input validation rules
│   │   └── dataPersistence.test.ts   # Backup serialization tests
│   ├── types/
│   │   ├── index.ts              # Core TypeScript interfaces & types
│   │   └── theme.ts              # Celebration theme presets
│   ├── utils/
│   │   └── eventCalculations.ts  # Domain math, countdown & validation helpers
│   ├── App.tsx                   # Main application layout
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styling, fonts & scrollbars
├── index.html                    # HTML shell & font preconnect
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

The application runs on `http://localhost:3000`.

---

## 🧪 Running Automated Tests

Run the full suite of unit and integration tests:

```bash
npm run test
```

Or run tests in watch mode:

```bash
npx vitest
```

### Type Checking & Build

```bash
# Type-check TypeScript files
npm run lint

# Build production bundle
npm run build
```

---

## 🔒 Security & Quality Standards

- **Zero-Pill Anti-Slop Discipline**: Metadata is presented cleanly with typographic separators (`·`), avoiding cluttered badge sandwiches.
- **Tabular Figures**: All financial figures and timestamps use `tabular-nums` for crisp vertical column alignment.
- **Accessible Forms**: Inputs feature semantic `<label>` associations, visible focus rings, and explicit validation feedback.
- **Safe JSON Imports**: Exported backups validate structure before updating state to prevent data corruption.

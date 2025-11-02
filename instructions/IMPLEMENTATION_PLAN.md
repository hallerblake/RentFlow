# Rental Property Management Platform - Implementation Plan

## Project Overview

A modern, multi-tenant SaaS application for landlords to manage rental properties, track payments, send SMS reminders, and handle maintenance requests.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk (or NextAuth)
- **SMS**: Twilio
- **Hosting**: Vercel
- **Version Control**: GitHub

### Design Philosophy: "Powerful Simplicity"
- Clean, spacious layouts with plenty of whitespace
- Clear visual hierarchy - most important actions front and center
- Progressive disclosure - advanced features hidden until needed
- Mobile-first responsive design
- Instant feedback with real-time updates

---

## Phase 1: Project Initialization

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest rental-management --typescript --tailwind --app
cd rental-management
```

### Step 2: Install Core Dependencies

```bash
# Database
npm install @neondatabase/serverless
npm install drizzle-orm drizzle-kit
npm install postgres

# Authentication
npm install @clerk/nextjs

# UI Components
npx shadcn-ui@latest init

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# SMS
npm install twilio

# Data Fetching
npm install @tanstack/react-query

# Icons
npm install lucide-react

# Charts
npm install recharts

# Date Handling
npm install date-fns

# Drag & Drop (for Kanban)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Animations
npm install framer-motion

# Utilities
npm install clsx tailwind-merge class-variance-authority
```

### Step 3: Install shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add command
npx shadcn-ui@latest add form
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
```

---

## Phase 2: Project Structure

### Create Folder Structure

```
rental-management/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── properties/
│   │   ├── tenants/
│   │   ├── payments/
│   │   ├── maintenance/
│   │   ├── sms/
│   │   └── settings/
│   ├── api/
│   │   ├── companies/
│   │   ├── properties/
│   │   ├── tenants/
│   │   ├── payments/
│   │   ├── maintenance/
│   │   └── sms/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── dashboard/
│   ├── properties/
│   ├── tenants/
│   ├── payments/
│   ├── maintenance/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileNav.tsx
│   └── shared/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── migrations/
│   ├── utils.ts
│   ├── validations.ts
│   └── constants.ts
├── hooks/
├── types/
└── public/
```

---

## Phase 3: Database Schema

### Multi-Tenant Database Architecture

#### Core Tables Schema (Drizzle ORM)

Create `lib/db/schema.ts`:

```typescript
import { pgTable, text, serial, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'company_admin', 'property_manager', 'viewer']);
export const propertyStatusEnum = pgEnum('property_status', ['vacant', 'occupied', 'maintenance', 'unavailable']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'cancelled']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['requested', 'in_progress', 'completed', 'closed']);
export const maintenancePriorityEnum = pgEnum('maintenance_priority', ['low', 'medium', 'high', 'urgent']);

// Companies Table
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  settings: text('settings'), // JSON string for company-specific settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: userRoleEnum('role').notNull().default('viewer'),
  companyId: integer('company_id').references(() => companies.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Properties Table
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  propertyType: text('property_type'), // house, apartment, condo, etc.
  bedrooms: integer('bedrooms'),
  bathrooms: decimal('bathrooms'),
  squareFeet: integer('square_feet'),
  rentAmount: decimal('rent_amount', { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  status: propertyStatusEnum('status').notNull().default('vacant'),
  images: text('images'), // JSON array of image URLs
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tenants Table
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  leaseStartDate: timestamp('lease_start_date'),
  leaseEndDate: timestamp('lease_end_date'),
  rentAmount: decimal('rent_amount', { precision: 10, scale: 2 }),
  depositPaid: decimal('deposit_paid', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentMethod: text('payment_method'), // cash, check, ach, card
  confirmationNumber: text('confirmation_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Maintenance Requests Table
export const maintenanceRequests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: maintenancePriorityEnum('priority').notNull().default('medium'),
  status: maintenanceStatusEnum('status').notNull().default('requested'),
  assignedTo: text('assigned_to'), // Vendor/contractor name
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
  images: text('images'), // JSON array of image URLs
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// SMS Reminders Table
export const smsReminders = pgTable('sms_reminders', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  phoneNumber: text('phone_number').notNull(),
  message: text('message').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  status: text('status'), // scheduled, sent, failed, delivered
  twilioSid: text('twilio_sid'),
  reminderType: text('reminder_type'), // payment_due, payment_overdue, lease_renewal, maintenance_update
  relatedId: integer('related_id'), // ID of related payment or maintenance request
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// SMS Templates Table
export const smsTemplates = pgTable('sms_templates', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  name: text('name').notNull(),
  templateType: text('template_type').notNull(), // payment_due, payment_overdue, etc.
  message: text('message').notNull(),
  isActive: boolean('is_active').default(true),
  daysBefore: integer('days_before'), // For scheduled reminders
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Database Connection

Create `lib/db/client.ts`:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### Drizzle Configuration

Create `drizzle.config.ts` in root:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

---

## Phase 4: Seed Data Script

Create `lib/db/seed.ts`:

```typescript
import { db } from './client';
import { companies, users } from './schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create companies
  const companiesList = [
    'Sherman Haller',
    'Haller Properties',
    'MR3 Properties',
    'Permian Rentals',
  ];

  const insertedCompanies = await db
    .insert(companies)
    .values(
      companiesList.map((name) => ({
        name,
        email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '555-0100',
      }))
    )
    .returning();

  console.log(`✅ Created ${insertedCompanies.length} companies`);

  // Create super admin user
  // Note: Password should be hashed. With Clerk, this isn't needed as Clerk handles auth
  const superAdmin = await db
    .insert(users)
    .values({
      clerkId: 'placeholder_clerk_id', // Will be updated after Clerk setup
      email: 'haller.blake@gmail.com',
      firstName: 'Blake',
      lastName: 'Haller',
      role: 'super_admin',
      companyId: null, // Super admin has access to all companies
    })
    .returning();

  console.log('✅ Created super admin user:', superAdmin[0].email);

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
```

Run seed:
```bash
npx tsx lib/db/seed.ts
```

---

## Phase 5: Authentication Setup (Clerk)

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=your_neon_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Clerk Middleware

Create `middleware.ts` in root:

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhooks(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Wrap App with Clerk Provider

Update `app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Phase 6: UI Layout Components

### Main Dashboard Layout

Create `app/(dashboard)/layout.tsx`:

```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Sidebar Component

Create `components/layout/Sidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'SMS', href: '/sms', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <span className="text-xl font-bold text-gray-900">
            RentManager
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### Top Bar Component

Create `components/layout/TopBar.tsx`:

```typescript
'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search properties, tenants..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
```

---

## Phase 7: Feature Pages

### Dashboard Home

Create `app/(dashboard)/dashboard/page.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Wrench } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, here's what's happening</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Occupied Units
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-gray-500">75% occupancy rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,450</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-red-600">3 urgent items</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items would go here */}
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payment items would go here */}
              <p className="text-sm text-gray-500">No upcoming payments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Properties Page

Create `app/(dashboard)/properties/page.tsx`:

```typescript
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage your rental properties</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Properties grid/list would go here */}
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-gray-500">No properties yet. Add your first property to get started.</p>
      </div>
    </div>
  );
}
```

---

## Phase 8: API Routes

### Properties API

Create `app/api/properties/route.ts`:

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { properties } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET all properties for a company
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's company_id from database
    // Filter properties by company_id
    // Return properties

    const allProperties = await db.select().from(properties);
    
    return NextResponse.json(allProperties);
  } catch (error) {
    console.error('[PROPERTIES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST create new property
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    // Get user's company_id
    // Create property with company_id
    
    const newProperty = await db.insert(properties).values({
      ...body,
      companyId: 1, // Replace with actual company_id
    }).returning();

    return NextResponse.json(newProperty[0]);
  } catch (error) {
    console.error('[PROPERTIES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
```

---

## Phase 9: SMS Integration

### Twilio Service

Create `lib/services/twilio.ts`:

```typescript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Twilio credentials are not configured');
}

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendPaymentReminder(
  tenantPhone: string,
  tenantName: string,
  amount: number,
  dueDate: string
) {
  const message = `Hi ${tenantName}, this is a reminder that your rent payment of $${amount} is due on ${dueDate}. Thank you!`;
  return sendSMS(tenantPhone, message);
}

export async function sendMaintenanceUpdate(
  tenantPhone: string,
  tenantName: string,
  status: string,
  description: string
) {
  const message = `Hi ${tenantName}, your maintenance request "${description}" has been updated to: ${status}.`;
  return sendSMS(tenantPhone, message);
}
```

### SMS API Route

Create `app/api/sms/send/route.ts`:

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/services/twilio';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { to, message } = await request.json();

    if (!to || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const result = await sendSMS(to, message);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return new NextResponse(result.error, { status: 500 });
    }
  } catch (error) {
    console.error('[SMS_SEND]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
```

---

## Phase 10: Deployment

### Neon Database Setup

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env.local` as `DATABASE_URL`

### Run Migrations

```bash
# Generate migrations
npx drizzle-kit generate:pg

# Push to database
npx drizzle-kit push:pg
```

### Clerk Setup

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy API keys to `.env.local`
4. Configure allowed redirect URLs

### Twilio Setup

1. Go to [twilio.com](https://twilio.com)
2. Create account and get phone number
3. Copy credentials to `.env.local`

### GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Rental Property Management Platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
4. Deploy!

---

## Phase 11: Claude Code Usage Guide

### How to Use Claude Code in VS Code

1. **Open your project in VS Code**
2. **Start Claude Code in the terminal:**
   ```bash
   claude-code
   ```

3. **Use these prompts sequentially:**

#### Initial Setup
```
Create the project structure for a rental property management platform with the folder structure specified in the implementation plan. Set up Next.js 14 with TypeScript, Tailwind CSS, and all necessary configuration files.
```

#### Database Setup
```
Implement the complete database schema using Drizzle ORM as specified in the implementation plan. Create the schema.ts file with all tables: companies, users, properties, tenants, payments, maintenance_requests, sms_reminders, and sms_templates. Include proper relationships, enums, and indexes.
```

#### Database Seed
```
Create a seed script that populates the database with:
- 4 companies: Sherman Haller, Haller Properties, MR3 Properties, Permian Rentals
- Super admin user: haller.blake@gmail.com with first name Blake, last name Haller
- Sample properties and tenants for each company for testing
```

#### Authentication
```
Set up Clerk authentication with middleware for protected routes. Create sign-in and sign-up pages. Implement role-based access control with user roles: super_admin, company_admin, property_manager, and viewer.
```

#### Layout Components
```
Create the main dashboard layout with:
- Responsive sidebar with navigation (collapsible on mobile)
- Top bar with search, notifications, and user profile
- Modern, clean design using shadcn/ui components
- Smooth transitions and hover effects
```

#### Dashboard Page
```
Build the dashboard home page with:
- 4 metric cards showing: Total Properties, Occupied Units, Monthly Revenue, Pending Maintenance
- Recent activity feed
- Upcoming payments section
- Use the Card component from shadcn/ui with proper styling
```

#### Properties Feature
```
Create a complete properties management feature with:
- Grid and list view toggle
- Property cards with images, status badges, and quick actions
- Add/edit property modal with form validation
- Filters for status, price range, and property type
- Search functionality
Make it visually appealing and mobile-responsive
```

#### Tenants Feature
```
Build the tenant management system with:
- Tenant directory with contact cards
- Tenant detail view with tabs (Overview, Payment History, Maintenance, Documents)
- Add/edit tenant forms
- One-click contact (phone/email)
- Active/inactive status indicators
```

#### Payments Feature
```
Create the payment tracking system with:
- Payment table with status badges (Paid, Due Soon, Overdue)
- Revenue chart showing last 6 months
- Date range filters
- Record payment modal
- Bulk actions (send reminders, mark as paid)
- Export to CSV functionality
Use color-coding: green for paid, amber for due soon, red for overdue
```

#### Maintenance Feature
```
Implement maintenance request management with:
- Kanban board view (Requested, In Progress, Completed, Closed)
- Drag-and-drop between columns using @dnd-kit
- Priority badges (High, Medium, Low, Urgent)
- Add maintenance request modal with photo upload
- Filter by priority, property, and date
Alternative list view for users who prefer tables
```

#### SMS Integration
```
Create the SMS reminder system with:
- Twilio integration service
- Scheduled reminders dashboard with active/inactive toggles
- Editable message templates with variable placeholders
- Send manual messages to selected tenants
- Message history table with delivery status
- API routes for sending SMS
```

#### API Routes
```
Create RESTful API routes for:
- /api/properties - CRUD operations with company filtering
- /api/tenants - tenant management
- /api/payments - payment tracking and status updates
- /api/maintenance - maintenance request management
- /api/sms/send - send SMS messages
Implement proper authentication checks and company-level data isolation
```

#### Responsive Design Polish
```
Ensure the entire application is fully responsive:
- Mobile-first approach
- Sidebar becomes hamburger menu on mobile
- Tables convert to stacked cards on small screens
- Touch-friendly button sizes (minimum 44px)
- Test all features on mobile, tablet, and desktop viewports
```

#### Final Polish
```
Add finishing touches:
- Loading skeletons for all data fetches
- Toast notifications for all user actions
- Error boundaries and proper error handling
- Smooth page transitions using Framer Motion
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimization (lazy loading, code splitting)
```

### Tips for Using Claude Code

- **Be specific**: Provide clear, detailed instructions
- **One feature at a time**: Don't overwhelm with too many requests
- **Review the code**: Always review what Claude Code generates
- **Test frequently**: Test each feature before moving to the next
- **Ask for modifications**: If something isn't quite right, ask Claude Code to adjust it
- **Request documentation**: Ask Claude Code to add comments explaining complex logic

---

## Development Checklist

### Core Functionality
- [ ] Project initialized with Next.js 14 + TypeScript
- [ ] All dependencies installed
- [ ] Database schema created with Drizzle ORM
- [ ] Neon PostgreSQL connection configured
- [ ] Database seeded with initial data
- [ ] Clerk authentication implemented
- [ ] Role-based access control working
- [ ] Multi-tenant data isolation enforced

### UI/UX
- [ ] Responsive sidebar navigation
- [ ] Top bar with search and user profile
- [ ] Dashboard with metrics cards
- [ ] Properties page (grid + list views)
- [ ] Tenants management interface
- [ ] Payments tracking with status indicators
- [ ] Maintenance Kanban board
- [ ] SMS automation dashboard
- [ ] Mobile-responsive design
- [ ] Loading states and skeletons
- [ ] Toast notifications
- [ ] Smooth animations and transitions

### Features
- [ ] Add/edit/delete properties
- [ ] Add/edit/delete tenants
- [ ] Record payments
- [ ] Track payment status
- [ ] Create maintenance requests
- [ ] Update maintenance status
- [ ] Send SMS reminders (manual)
- [ ] Schedule automated SMS reminders
- [ ] Payment due reminders
- [ ] Overdue payment notifications
- [ ] Global search functionality

### API & Integration
- [ ] Properties CRUD API
- [ ] Tenants CRUD API
- [ ] Payments CRUD API
- [ ] Maintenance CRUD API
- [ ] SMS sending API
- [ ] Twilio integration working
- [ ] Company context middleware
- [ ] Protected routes

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] GitHub repository created
- [ ] Vercel deployment successful
- [ ] Production environment tested
- [ ] SSL certificate configured
- [ ] Custom domain (optional)

---

## Additional Features (Future Enhancements)

### Phase 12: Advanced Features
- Document management (lease agreements, ID scans)
- Bulk import properties/tenants via CSV
- Advanced reporting and analytics
- Automated late fee calculation
- Vendor/contractor management
- Expense tracking
- Calendar integration for property showings
- Tenant portal (self-service payment, maintenance requests)
- Mobile app (React Native)
- Payment gateway integration (Stripe, PayPal)
- E-signature for leases (DocuSign integration)
- Background check integration
- Credit check integration
- Automated rent increase notices
- Vacancy cost calculator
- ROI calculator per property

---

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **Neon Database**: https://neon.tech/docs
- **Clerk Auth**: https://clerk.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Twilio SMS**: https://www.twilio.com/docs/sms
- **Vercel Deployment**: https://vercel.com/docs

---

## Support

For issues or questions:
1. Check the documentation links above
2. Search for solutions in GitHub Issues
3. Ask Claude Code for help with specific implementation details

---

**Remember**: Start with the core functionality (database, auth, basic CRUD), then layer on the advanced features. Focus on making it work first, then make it beautiful, then make it fast.

Good luck building your rental property management platform! 🚀

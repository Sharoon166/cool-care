# Cool Care — Full Project Documentation

> **Stack**: SvelteKit 5 + TailwindCSS v4 + Drizzle ORM + PostgreSQL (Neon) + Better Auth  
> **Business**: Electrical & AC repair service — invoicing, quotations, customer & payment management  
> **Deploy**: Vercel (adapter-vercel)

---

## 1. Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Framework        | SvelteKit 5 (Svelte 5.45+)                                    |
| CSS              | TailwindCSS v4, `tw-animate-css`                              |
| UI Components    | shadcn-svelte (bits-ui), custom components                    |
| Icons            | `@tabler/icons-svelte` v3, `@lucide/svelte` v0.56             |
| Database ORM     | Drizzle ORM v0.41 + `drizzle-kit`                             |
| Database         | PostgreSQL via `@neondatabase/serverless`                     |
| Auth             | Better Auth v1.4 with drizzle adapter                         |
| Validation       | Zod v4                                                        |
| Forms            | sveltekit-superforms (not heavily used), custom form handling |
| Tables           | `@tanstack/table-core` v8                                     |
| Charts           | `layerchart`, `d3-scale`, `d3-shape`                          |
| Drag & Drop      | `@dnd-kit-svelte`                                             |
| Date handling    | `@internationalized/date`                                     |
| PDF generation   | `pdfkit` (server-side)                                        |
| Phone input      | `svelte-tel-input`                                            |
| QR codes         | `qrcode`, `svelte-qrcode`                                     |
| Toasts           | `svelte-sonner`                                               |
| ID generation    | `@paralleldrive/cuid2`                                        |
| Password hashing | `bcryptjs`                                                    |

---

## 2. Project Structure

```
cool-care/
├── drizzle/                          # DB migrations
│   ├── 0000_pink_doctor_faustus.sql
│   ├── 0001_flaky_gladiator.sql
│   ├── 0002_add_indexes.sql          # NOT registered in journal
│   └── meta/_journal.json
├── scripts/
│   ├── create-admin.ts
│   └── clear-users.ts
├── src/
│   ├── app.d.ts                      # Session/User types in App.Locals
│   ├── app.html                      # HTML shell with font preloads
│   ├── hooks.server.ts               # Auth middleware + redirect logic
│   ├── lib/
│   │   ├── auth-client.ts            # Better Auth client (browser)
│   │   ├── constants.ts              # Company info, payment info
│   │   ├── index.ts
│   │   ├── utils.ts                  # cn(), formatCurrency(), formatDate()
│   │   ├── components/
│   │   │   ├── app-sidebar.svelte
│   │   │   ├── site-header.svelte
│   │   │   ├── nav-main.svelte
│   │   │   ├── nav-secondary.svelte
│   │   │   ├── nav-user.svelte
│   │   │   ├── section-cards.svelte
│   │   │   ├── page-header.svelte
│   │   │   ├── theme-toggle.svelte
│   │   │   ├── command-palette.svelte
│   │   │   ├── data-table.svelte (shadcn)
│   │   │   ├── schemas.ts
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   ├── invoices/             # Invoice form, preview, payment form
│   │   │   ├── customers/            # Customer form, overview, history
│   │   │   ├── analytics/
│   │   │   └── ui/                   # shadcn-svelte UI primitives
│   │   ├── hooks/
│   │   ├── server/
│   │   │   ├── auth.ts               # Better Auth server setup
│   │   │   ├── payment-actions.ts    # Payment logic (add/delete)
│   │   │   └── db/
│   │   │       ├── index.ts          # DB client initialization
│   │   │       ├── schema.ts         # Customers, invoices, payments tables
│   │   │       └── auth-schema.ts    # User, session, account, verification tables
│   │   ├── utils/                    # (empty)
│   │   └── validations/
│   │       ├── customer.ts           # Zod schema for customer
│   │       └── invoice.ts            # Zod schemas for invoice + payment
│   └── routes/
│       ├── +layout.svelte            # Root layout (imports layout.css)
│       ├── +page.svelte              # Landing page -> redirects
│       ├── layout.css                # Tailwind imports + CSS variables
│       ├── (app)/                    # Authenticated routes group
│       │   ├── +layout.svelte        # Sidebar + site header layout
│       │   ├── +layout.server.ts     # Passes user/session to client
│       │   ├── about/
│       │   ├── customers/
│       │   ├── dashboard/
│       │   ├── invoices/
│       │   ├── settings/
│       │   └── users/
│       ├── api/auth/[...all]/+server.ts  # Better Auth API handler
│       ├── info/                     # Public info/customer portal
│       └── login/
├── static/
├── .env.example
├── components.json                   # shadcn-svelte config
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
└── package.json
```

---

## 3. Database Schema & Relations

### 3.1 Tables Overview

```
user ──1:N── session
user ──1:N── account
user ──1:N── verification

customers ──1:N── invoices ──1:N── payments
```

### 3.2 `customers` table

```sql
CREATE TABLE "customers" (
  "id"           text PRIMARY KEY,          -- cuid2
  "name"         varchar(255) NOT NULL,
  "email"        varchar(255),
  "phone"        varchar(20) NOT NULL,
  "alternate_phone" varchar(20),
  "address"      varchar(255),
  "city"         varchar(100),
  "postal_code"  varchar(20),
  "company_name" varchar(255),
  "gst_number"   varchar(50),
  "is_active"    boolean DEFAULT true NOT NULL,
  "priority"     varchar(20) DEFAULT 'normal',  -- 'normal' | 'high' | 'vip'
  "notes"        text,
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL,
  "created_by"   text,
  "deleted_at"   timestamp                  -- soft delete
);
```

### 3.3 `invoices` table

```sql
CREATE TABLE "invoices" (
  "id"           text PRIMARY KEY,          -- cuid2
  "type"         varchar(20) DEFAULT 'invoice' NOT NULL,  -- 'invoice' | 'quotation'
  "invoice_number" varchar(50) NOT NULL,
  "invoice_date" timestamp DEFAULT now() NOT NULL,
  "customer_id"  text REFERENCES customers(id),
  "items"        jsonb NOT NULL,            -- InvoiceItem[] (see below)
  "subtotal"     numeric(10,2) NOT NULL,
  "discount_type" varchar(20) DEFAULT 'percentage',  -- 'percentage' | 'value'
  "discount_value" numeric(10,2) DEFAULT '0',
  "discount_amount" numeric(10,2) DEFAULT '0',
  "total"        numeric(10,2) NOT NULL,
  "previous"     numeric(10,2) DEFAULT '0',  -- Previous balance/advance
  "paid"         numeric(10,2) DEFAULT '0',  -- Advance payment (deprecated)
  "total_paid"   numeric(10,2) DEFAULT '0',  -- Sum of ALL payments
  "balance"      numeric(10,2) NOT NULL,     -- total + previous - total_paid
  "status"       varchar(20) DEFAULT 'draft', -- 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'converted'
  "converted_to_invoice_id" text,             -- For quotations converted to invoices
  "notes"        text,
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL,
  "created_by"   text,
  "deleted_at"   timestamp                   -- soft delete
);
```

**InvoiceItem JSON type**:

```typescript
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number; // quantity × rate (or rate if isService)
  notes?: string;
  isService?: boolean; // When true, quantity = 1, amount = rate
};
```

### 3.4 `payments` table

```sql
CREATE TABLE "payments" (
  "id"            text PRIMARY KEY,          -- cuid2
  "invoice_id"    text REFERENCES invoices(id) NOT NULL,
  "amount"        numeric(10,2) NOT NULL,
  "payment_date"  timestamp DEFAULT now() NOT NULL,
  "payment_method" varchar(20) NOT NULL,     -- 'cash' | 'online' | 'custom'
  "custom_method" varchar(100),              -- For custom payment methods
  "notes"         text,
  "created_at"    timestamp DEFAULT now() NOT NULL,
  "updated_at"    timestamp DEFAULT now() NOT NULL,
  "created_by"    text
);
```

### 3.5 Auth Tables (`auth-schema.ts`)

- `user`: id, name, email (unique), emailVerified, image, username (unique), displayUsername
- `session`: id, expiresAt, token (unique), userId (FK → user), ipAddress, userAgent
- `account`: id, accountId, providerId, userId (FK → user), accessToken, refreshToken, password, etc.
- `verification`: id, identifier, value, expiresAt

### 3.6 Indexes (from `0002_add_indexes.sql`)

```sql
-- Customers
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Invoices
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_type ON invoices(type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX idx_invoices_customer_type_deleted ON invoices(customer_id, type, deleted_at);

-- Payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_invoice_payment_date ON payments(invoice_id, payment_date);
```

> **⚠ IMPORTANT**: `0002_add_indexes.sql` exists on disk but is **NOT registered** in `drizzle/meta/_journal.json`. You must run it manually or re-register it.

---

## 4. Authentication (Better Auth)

### 4.1 Server Setup (`src/lib/server/auth.ts`)

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { username } from 'better-auth/plugins';
import * as authSchema from './db/auth-schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification
    }
  }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  plugins: [username(), sveltekitCookies(getRequestEvent)]
});
```

### 4.2 Client Setup (`src/lib/auth-client.ts`)

```typescript
import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  plugins: [usernameClient()]
});
export const { signIn, signOut, useSession } = authClient;
```

### 4.3 Auth Middleware (`src/hooks.server.ts`)

```typescript
// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth', '/info'];
// Routes that require authentication
const protectedRoutes = ['/dashboard', '/customers', '/invoices', '/users', '/settings'];

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers });
  event.locals.session = session?.session || null;
  event.locals.user = session?.user || null;

  // Protected routes → redirect to login
  // Login when authenticated → redirect to /dashboard
  // Root (/) → redirect to /dashboard (authed) or /login (not authed)
};
```

### 4.4 API Route

`src/routes/api/auth/[...all]/+server.ts` handles Better Auth requests (handled by `better-auth/svelte-kit`).

---

## 5. Routes & Pages

### 5.1 Dashboard `/dashboard`

| File              | Purpose                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `+page.server.ts` | Fetches metrics, chart data, recent invoices, top customers. Supports time ranges (`7d`, `30d`, `12m`, `custom`). |
| `+layout.svelte`  | Provides the Softnet top nav bar (separate from app sidebar)                                                      |
| `+page.svelte`    | 2-column grid: Cash Flow cards + Net Income table (L) / Chart + Payables (R) + Recent Activity                    |

**Data returned by `load()`**:

```typescript
{
  metrics: { totalRevenue, totalInvoices, totalQuotations, activeCustomers },
  chartData: { date: Date, revenue: number }[],
  recentInvoices: { id, invoiceNumber, total, status, invoiceDate, customerName }[],
  topCustomers: { name, totalRevenue, invoiceCount }[],
  timeRange: string,
  period: string,
  databaseError?: boolean
}
```

### 5.2 Invoices `/invoices`

| File                        | Purpose                                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `+page.server.ts`           | Fetches all invoices (non-deleted) with customer info, calculates stats (total, invoices, quotations, totalValue, paid, pending, overdue). Actions: `create`, `update`, `delete`, `updateStatus`, `addPayment`, `deletePayment` |
| `+page.svelte`              | Full CRUD list with search, type/status filters, stats cards, status update dialog, delete with confirmation                                                                                                                    |
| `[id]/+page.server.ts`      | Fetches single invoice + payments. Actions: `addPayment`, `deletePayment`                                                                                                                                                       |
| `[id]/+page.svelte`         | Invoice detail view: items table, payment summary, payment history, quotation → invoice conversion                                                                                                                              |
| `[id]/edit/+page.server.ts` | Fetches invoice + all customers for dropdown                                                                                                                                                                                    |
| `[id]/edit/+page.svelte`    | Edit form using InvoiceForm component in edit mode                                                                                                                                                                              |
| `new/+page.server.ts`       | Generates invoice number (`INV-YYYYMM-NNN` or `QT-YYYYMM-NNN`), fetches customers                                                                                                                                               |
| `new/+page.svelte`          | Create form using InvoiceForm component                                                                                                                                                                                         |

### 5.3 Customers `/customers`

| File                        | Purpose                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `+page.server.ts`           | Fetches all non-deleted customers. Actions: `create`, `update`, `delete`             |
| `+page.svelte`              | Full CRUD list with search, priority/status filters, stats cards, create/edit dialog |
| `[id]/+page.server.ts`      | Fetches single customer + invoice history + payment summary                          |
| `[id]/+page.svelte`         | Customer detail: overview tab, invoice history tab                                   |
| `[id]/edit/+page.server.ts` | Fetches customer data for edit form                                                  |
| `[id]/edit/+page.svelte`    | Edit form using CustomerForm component                                               |

### 5.4 Other Routes

| Route       | Purpose                                        |
| ----------- | ---------------------------------------------- |
| `/users`    | User management (admin)                        |
| `/settings` | App settings                                   |
| `/about`    | About page                                     |
| `/login`    | Login page                                     |
| `/info`     | Public customer portal (view invoices by ID)   |
| `/`         | Landing page → redirects to login or dashboard |

### 5.5 Layout Hierarchy

```
src/routes/+layout.svelte                # Root: imports layout.css, renders children
  src/routes/(app)/+layout.svelte        # Auth layout: sidebar + site header (hidden on /dashboard)
    src/routes/(app)/dashboard/+layout.svelte  # Dashboard layout: Softnet top nav
    src/routes/(app)/invoices/...
    src/routes/(app)/customers/...
    ...
  src/routes/login/+page.svelte          # Separate from app layout
  src/routes/info/...
```

The `(app)/+layout.svelte` conditionally renders the sidebar + SiteHeader ONLY if the current path is NOT `/dashboard`. The dashboard has its own layout with a full-width Softnet-branded top nav.

---

## 6. Key Components

### 6.1 `InvoiceForm` (`src/lib/components/invoices/invoice-form.svelte`)

- Mode: `create` | `edit`
- Fields: type (invoice/quotation), invoiceNumber, invoiceDate, customerId, items[], discountType, discountValue, previous, paid, notes
- Items: dynamic table with add/remove, calculated amount (quantity × rate), service checkbox
- Financial calcs: subtotal, discountAmount, total, balance (all reactive via `$derived`)
- Submits via `use:enhance`, validates with Zod, shows toast on success/failure
- Advance payment creates a `payments` record automatically on create

### 6.2 `PaymentForm` (`src/lib/components/invoices/payment-form.svelte`)

- Fields: amount (validated against balance), paymentDate, paymentMethod, customMethod, notes
- Creates payment record + updates invoice totals (`totalPaid`, `balance`, `status`)

### 6.3 `CustomerForm` (`src/lib/components/customers/customer-form.svelte`)

- Fields: name, email, phone, alternatePhone, address, city, postalCode, companyName, gstNumber, priority, isActive, notes
- Submits via `use:enhance` with Zod validation

### 6.4 `InvoicePreview` (`src/lib/components/invoices/invoice-preview.svelte`)

- Full invoice/quote printable preview with company info, customer info, items table, payment summary, QR code
- Used for print/PDF generation

### 6.5 Dashboard Components

- `CashFlowCards` — Inflow (green), Outflow (purple), Net Changes (dark) cards
- `ProfitLossChart` — Dark card with SVG smooth line chart (d3-shape curve), glow effect, floating metric
- `NetIncomeTable` — Fiscal year comparison table
- `PayableSection` — Payable & Owing cards
- `SectionCards` — Total Revenue, Invoices, Quotations, Active Customers (old dashboard)
- `RevenueChart` — Time series revenue chart (old dashboard)
- `TopCustomers` — Top 5 customers by revenue (old dashboard)
- `RecentActivity` — Recent invoices list (old dashboard)

---

## 7. Backend Logic

### 7.1 Invoice Creation Flow

1. Form submits items as JSON string → parsed server-side
2. Zod validates the data
3. Backend calculates: `subtotal = Σ item.amount`, `discountAmount`, `total = subtotal - discountAmount`
4. Sets `totalPaid = paid` (advance payment), `balance = total + previous - paid`
5. Determines `status`: `'draft'` if no advance, `'partial'` if partial advance, `'paid'` if fully paid
6. If advance payment > 0, creates a `payments` record automatically
7. Returns success with the new invoice

### 7.2 Invoice Update Flow

1. Same calculation as create
2. Preserves existing `totalPaid` and adjusts for changes in advance payment (`paid`)
3. If advance payment changed, deletes old advance payment record and creates new one
4. Recalculates `status` using `calculateInvoiceStatus()` helper

### 7.3 Payment Flow (`payment-actions.ts`)

```typescript
addPayment(formData):
  1. Validates with paymentSchema
  2. Checks payment ≤ current balance
  3. Creates payments record
  4. Updates invoice: totalPaid += amount, balance -= amount
  5. Updates invoice status via calculateInvoiceStatus()

deletePayment(formData):
  1. Gets payment amount + invoiceId
  2. Deletes payment record
  3. Updates invoice: totalPaid -= amount, balance += amount
  4. Updates invoice status

calculateInvoiceStatus(totalAmount, paidAmount, currentStatus):
  - 'draft' | 'converted' → unchanged
  - paidAmount === 0 → 'sent'
  - paidAmount >= totalAmount → 'paid'
  - 0 < paidAmount < totalAmount → 'partial'
  - else → currentStatus
```

### 7.4 Quotation → Invoice Conversion

1. POST to `/invoices/convert` with `quotationId`
2. Creates a new invoice copying items from quotation
3. Sets new invoice status to `'sent'`
4. Updates quotation status to `'converted'`, sets `convertedToInvoiceId`
5. Returns `{ invoiceId }`

### 7.5 Dashboard Data Loading

1. Fetches metrics for the selected time range (4 parallel queries):
   - Sum of payments in range
   - Count of invoices in range
   - Count of quotations in range
   - Count of active customers
2. Gets recent invoices (last 10, non-deleted)
3. Gets all payments from last 13 months
4. Processes payments into time series (daily/monthly grouping based on range)
5. Gets top 5 customers by revenue in range

---

## 8. Validation Schemas (Zod)

### Customer (`src/lib/validations/customer.ts`)

```typescript
export const customerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1).max(20),
  alternatePhone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  companyName: z.string().max(255).optional().or(z.literal('')),
  gstNumber: z.string().max(50).optional().or(z.literal('')),
  priority: z.enum(['normal', 'high', 'vip']).default('normal'),
  isActive: z.boolean().default(true),
  notes: z.string().optional().or(z.literal(''))
});
```

### Invoice (`src/lib/validations/invoice.ts`)

```typescript
export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
  amount: z.number().min(0),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(['cash', 'online', 'custom']),
  customMethod: z.string().optional(),
  notes: z.string().optional()
});

export const invoiceSchema = z.object({
  type: z.enum(['invoice', 'quotation']),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  customerId: z.string().min(1),
  items: z.array(invoiceItemSchema).min(1),
  discountType: z.enum(['percentage', 'value']),
  discountValue: z.number().min(0),
  previous: z.number().min(0).default(0),
  paid: z.number().min(0).default(0),
  status: z.enum([...]).optional(),
  notes: z.string().optional()
});
```

---

## 9. Utilities

### Currency Formatting (`src/lib/utils.ts`)

```typescript
// Uses Intl.NumberFormat with 'en-PK' locale (Pakistani Rupees)
formatCurrency(amount, options?) // "Rs. 1,234.56"
formatPKR.standard(amount)       // "Rs. 1,234.56"
formatPKR.compact(amount)        // "Rs. 1.2K"
formatPKR.exact(amount)          // "Rs. 1,234.56" (always 2 decimals)
formatPKR.whole(amount)          // "Rs. 1,235" (no decimals)
formatPKR.short(amount)          // "Rs. 1.2K" / "Rs. 1.2M" / "Rs. 1.2B"
```

### Date Formatting

```typescript
formatDate.short(date); // "Jan 1, 2023"
formatDate.long(date); // "January 1, 2023"
formatDate.full(date); // "Monday, January 1, 2023"
```

### Tailwind Merge

```typescript
cn(...classes); // clsx + tailwind-merge
```

### Path Alias

```typescript
// svelte.config.js alias
'@/': './src/lib'   // So you can import from '@/components/...'
'$lib'              // Built-in SvelteKit alias
```

---

## 10. Constants (`src/lib/constants.ts`)

```typescript
export const COMPANY_INFO = {
  name: 'Cool Care',
  tagline: 'Electrical & AC repair services',
  address: 'Iqbal Town, near Sohan Highway, Islamabad',
  phones: ['+92-336-3097147', '+92-315-5417036'],
  email: 'info@coolcare.com',
  website: 'www.coolcare.com',
  gstNumber: 'GST123456789'
};

export const PAYMENT_INFO = {
  bank: {
    bankName: 'HBL Bank Limited',
    accountName: 'Cool Care Solutions',
    accountNumber: 'PK12HABL1234567890123',
    iban: 'PK12HABL1234567890123456789',
    swiftCode: 'HABLPKKA'
  },
  jazzCash: { accountNumber: '0315-5417036', accountTitle: 'Sharoon Shalam' },
  easyPaisa: { accountNumber: '0336-3097147', accountTitle: 'Allah Ditta Masih' }
};
```

---

## 11. Environment Variables

```env
DATABASE_URL="postgres://user:password@host:port/db-name"
BETTER_AUTH_SECRET="your-super-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:5173"
```

---

## 12. NPM Scripts

| Script                 | Purpose                        |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start Vite dev server          |
| `npm run build`        | Production build               |
| `npm run preview`      | Preview production build       |
| `npm run check`        | Type-check with `svelte-check` |
| `npm run format`       | Format with Prettier           |
| `npm run lint`         | Lint with Prettier + ESLint    |
| `npm run db:push`      | Push schema to DB (Drizzle)    |
| `npm run db:generate`  | Generate migration             |
| `npm run db:migrate`   | Apply migrations               |
| `npm run db:studio`    | Open Drizzle Studio            |
| `npm run create-admin` | Create admin user (tsx)        |
| `npm run clear-users`  | Clear all users (tsx)          |

---

## 13. Important Notes

### 13.1 Soft Delete Pattern

All major entities (`customers`, `invoices`) use soft delete via `deletedAt` timestamp. Queries must always filter `WHERE deletedAt IS NULL`.

### 13.2 Invoice Status Lifecycle

```
draft → sent → partial → paid
                         → overdue
       → cancelled
quotation: sent → converted
```

### 13.3 Financial Logic

- `balance = total + previous - totalPaid`
- `totalPaid` is the sum of ALL payment records for an invoice
- `paid` is the "advance payment" at creation time (also stored as a payment record with note "Advance payment received at invoice creation")
- When editing, if `paid` changes, the advance payment record is deleted and recreated

### 13.4 Route Groups

- `(app)` — Authenticated routes with sidebar layout
- Dashboard has its own `+layout.svelte` inside `(app)/dashboard/` that overrides the parent layout
- The parent `(app)/+layout.svelte` checks `$page.url.pathname === '/dashboard'` and hides the sidebar

### 13.5 Styling

- Uses TailwindCSS v4 with CSS variables defined in `layout.css`
- Custom `@theme inline` block for design tokens
- Neo-brutalist CSS classes: `.brutal-card`, `.brutal-card-dark`, `.brutal-btn`, `.brutal-icon-btn`
- Typography: Poppins (headings), Inter (body) — loaded via Google Fonts in `app.html`
- Dark mode via `.dark` class on `<html>` element (toggle stored in localStorage)

### 13.6 PDF Generation

- Uses `pdfkit` (server-side)
- Print routes: `/invoices/[id]/print` and `/info/[customerId]/invoice/[invoiceId]/print`
- Print styles in `layout.css` hide nav, sidebar, and logos

### 13.7 Important Gotchas

1. **Migration 0002 is not in journal** — the indexes SQL file exists but Drizzle hasn't tracked it. If you need those indexes, run the SQL manually or re-create the migration.

2. **Dashboard layout overrides parent** — the `(app)/+layout.svelte` conditionally hides the sidebar when on `/dashboard`. The dashboard has its own `+layout.svelte` with a Softnet-branded header. This means the dashboard page is completely standalone with no app sidebar.

3. **Invoice ID generation** — uses `cuid2` via `@paralleldrive/cuid2`, not auto-increment.

4. **Currency is in PKR** — `en-PK` locale with "Rs." prefix. If you need USD, change the locale and symbol in `utils.ts`.

5. **Invoice number format** — `INV-YYYYMM-NNN` for invoices, `QT-YYYYMM-NNN` for quotations. The NNN is random, not sequential.

6. **The `schemas.ts` component** is an unrelated shadcn example table schema with `{ id, header, type, status, target, limit, reviewer }` — it might be left over from scaffolding.

7. **Command Palette** uses `@lucide/svelte` for icons (not `@tabler/icons-svelte`) — both icon libraries are present.

8. **Superforms** is in the dependencies but the app uses custom form handling with `use:enhance` instead.

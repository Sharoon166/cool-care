import type { Customer, Invoice, Payment, Project, Expense, ProjectPayment, InvoiceItem } from '$lib/server/db/schema';

export type {
  Customer,
  Invoice,
  Payment,
  Project,
  Expense,
  ProjectPayment,
  InvoiceItem
};

export type CustomerOption = {
  id: string;
  name: string;
  companyName: string | null;
  phone: string;
  email: string | null;
};

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'converted';

export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export type ExpenseCategory = 'Labor' | 'Materials' | 'Software' | 'Other';

export type PaymentMethod = 'cash' | 'easypaisa' | 'jazzcash' | 'banktransfer' | 'custom';

export type ActionErrors = Record<string, string[] | undefined>;

export type ActionResult<T = Record<string, unknown>> =
  | { success: true } & T
  | { success: false; error: string; errors?: ActionErrors; data?: Record<string, unknown> };

export type ProjectData = {
  id: string;
  name: string;
  description: string | null;
  clientId: string | null;
  clientName: string | null;
  clientCompany: string | null;
  budget: number;
  status: string;
  startDate: string | Date | null;
  expectedEndDate: string | Date | null;
  notes: string | null;
  pin: string | null;
  createdAt: string | Date;
};

export type FinancialData = {
  totalExpenses: number;
  totalReceived: number;
};

export type ExpenseListItem = {
  id: string;
  date: string | Date;
  category: string;
  description: string;
  amount: number | string;
};

export type PaymentListItem = {
  id: string;
  date: string | Date;
  method: string | null;
  reference: string | null;
  amount: number | string;
  notes: string | null;
};

export type InvoiceListData = {
  id: string;
  type: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  customerId: string | null;
  customerName: string | null;
  customerCompany: string | null;
  total: string;
  balance: string;
  totalPaid: string;
  status: string | null;
  createdAt: string | Date;
};

export type CustomerInvoiceData = {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string | null;
  total: string;
  invoiceDate: string | Date;
  items: InvoiceItem[];
  subtotal: string;
  discountType: string | null;
  discountValue: string | null;
  discountAmount: string | null;
  notes: string | null;
  previous: string | null;
  paid: string | null;
  totalPaid: string | null;
  balance: string;
  createdAt: string | Date;
};

export type PaymentData = {
  id: string;
  amount: string;
  paymentDate: string | Date;
  paymentMethod: string;
  customMethod: string | null;
  notes: string | null;
  createdAt: string | Date;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

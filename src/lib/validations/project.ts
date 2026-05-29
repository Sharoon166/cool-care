import { z } from 'zod';

const projectStatuses = ['Active', 'On Hold', 'Completed', 'Cancelled'] as const;
const expenseCategories = ['Labor', 'Materials', 'Software', 'Other'] as const;

export const projectStatusesArr = projectStatuses;

export const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(255),
    description: z.string().optional().or(z.literal('')),
    clientId: z.string().min(1, 'Client is required'),
    budget: z.coerce.number().positive('Budget must be greater than zero'),
    status: z.enum(projectStatuses).default('Active'),
    startDate: z.string().optional().or(z.literal('')),
    expectedEndDate: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    pin: z
      .string()
      .regex(/^\d{4}$/, 'PIN must be exactly 4 digits')
      .optional()
      .or(z.literal(''))
      .transform((v) => (v === '' ? null : v))
      .nullable()
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.expectedEndDate) return true;
      return new Date(data.expectedEndDate) > new Date(data.startDate);
    },
    {
      message: 'Expected end date must be after start date',
      path: ['expectedEndDate']
    }
  );

export const expenseSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(expenseCategories, { errorMap: () => ({ message: 'Category must be one of: Labor, Materials, Software, Other' }) }),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero')
});

export const projectPaymentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  date: z.string().min(1, 'Date is required'),
  method: z.string().optional().or(z.literal('')),
  reference: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  notes: z.string().optional().or(z.literal(''))
});

export const statusSchema = z.object({
  status: z.enum(projectStatuses)
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type ProjectPaymentFormData = z.infer<typeof projectPaymentSchema>;

import { db } from '$lib/server/db';
import { projects, customers, expenses, projectPayments } from '$lib/server/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import type { Actions } from './$types';
import { expenseSchema, projectPaymentSchema, statusSchema } from '$lib/validations/project';

async function getProject(projectId: string) {
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      clientId: projects.clientId,
      clientName: customers.name,
      clientCompany: customers.companyName,
      budget: sql<number>`CAST(${projects.budget} AS numeric)`,
      status: projects.status,
      startDate: projects.startDate,
      expectedEndDate: projects.expectedEndDate,
      notes: projects.notes,
      pin: projects.pin,
      createdAt: projects.createdAt
    })
    .from(projects)
    .leftJoin(customers, eq(projects.clientId, customers.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));

  if (!project) {
    throw error(404, 'Project not found');
  }

  return project;
}

async function verifyProjectActive(projectId: string) {
  const [project] = await db
    .select({ id: projects.id, deletedAt: projects.deletedAt })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project || project.deletedAt) {
    throw error(404, 'Project not found or has been deleted');
  }
}

async function getProjectFinancials(projectId: string) {
  const [expensesResult] = await db
    .select({
      totalExpenses: sql<number>`COALESCE(CAST(SUM(CAST(${expenses.amount} AS numeric)) AS numeric), 0)`
    })
    .from(expenses)
    .where(eq(expenses.projectId, projectId));

  const [paymentsResult] = await db
    .select({
      totalReceived: sql<number>`COALESCE(CAST(SUM(CAST(${projectPayments.amount} AS numeric)) AS numeric), 0)`
    })
    .from(projectPayments)
    .where(eq(projectPayments.projectId, projectId));

  return {
    totalExpenses: expensesResult?.totalExpenses ?? 0,
    totalReceived: paymentsResult?.totalReceived ?? 0
  };
}

async function getProjectExpenses(projectId: string) {
  return await db
    .select()
    .from(expenses)
    .where(eq(expenses.projectId, projectId))
    .orderBy(expenses.date);
}

async function getProjectPayments(projectId: string) {
  return await db
    .select()
    .from(projectPayments)
    .where(eq(projectPayments.projectId, projectId))
    .orderBy(projectPayments.date);
}

export async function load({ params }) {
  const projectId = params.id;

  return {
    project: getProject(projectId),
    financials: getProjectFinancials(projectId),
    expenses: getProjectExpenses(projectId),
    payments: getProjectPayments(projectId)
  };
}

export const actions: Actions = {
  updateStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const rawStatus = formData.get('status') as string;

    const result = statusSchema.safeParse({ status: rawStatus });
    if (!result.success) {
      return fail(400, { success: false as const, error: 'Invalid status value' });
    }

    try {
      await db
        .update(projects)
        .set({ status: result.data.status, updatedAt: new Date() })
        .where(eq(projects.id, id));

      return { success: true as const };
    } catch {
      return fail(500, { success: false as const, error: 'Failed to update status' });
    }
  },

  createExpense: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    const result = expenseSchema.safeParse(rawData);
    if (!result.success) {
      return fail(400, {
        success: false,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data: rawData
      });
    }

    try {
      await verifyProjectActive(result.data.projectId);

      const [expense] = await db
        .insert(expenses)
        .values({
          projectId: result.data.projectId,
          date: new Date(result.data.date),
          category: result.data.category,
          description: result.data.description,
          amount: String(result.data.amount)
        })
        .returning();

      return { success: true as const, expense };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to create expense', data: rawData });
    }
  },

  updateExpense: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const id = rawData.id as string;

    const result = expenseSchema.safeParse(rawData);
    if (!result.success) {
      return fail(400, {
        success: false,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data: rawData
      });
    }

    try {
      const [existing] = await db
        .select({ id: expenses.id, projectId: expenses.projectId })
        .from(expenses)
        .where(eq(expenses.id, id));

      if (!existing) {
        return fail(404, { success: false, error: 'Expense not found' });
      }
      if (existing.projectId !== result.data.projectId) {
        return fail(403, { success: false, error: 'Expense does not belong to this project' });
      }

      const [expense] = await db
        .update(expenses)
        .set({
          date: new Date(result.data.date),
          category: result.data.category,
          description: result.data.description,
          amount: String(result.data.amount),
          updatedAt: new Date()
        })
        .where(eq(expenses.id, id))
        .returning();

      return { success: true as const, expense };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to update expense', data: rawData });
    }
  },

  deleteExpense: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const projectId = formData.get('projectId') as string;

    try {
      const [existing] = await db
        .select({ id: expenses.id, projectId: expenses.projectId })
        .from(expenses)
        .where(eq(expenses.id, id));

      if (!existing) {
        return fail(404, { success: false, error: 'Expense not found' });
      }
      if (projectId && existing.projectId !== projectId) {
        return fail(403, { success: false, error: 'Expense does not belong to this project' });
      }

      await db.delete(expenses).where(eq(expenses.id, id));
      return { success: true as const };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to delete expense' });
    }
  },

  createPayment: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    const result = projectPaymentSchema.safeParse(rawData);
    if (!result.success) {
      return fail(400, {
        success: false,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data: rawData
      });
    }

    try {
      await verifyProjectActive(result.data.projectId);

      const [payment] = await db
        .insert(projectPayments)
        .values({
          projectId: result.data.projectId,
          date: new Date(result.data.date),
          method: result.data.method || null,
          reference: result.data.reference || null,
          amount: String(result.data.amount),
          notes: result.data.notes || null
        })
        .returning();

      return { success: true as const, payment };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to create payment', data: rawData });
    }
  },

  updatePayment: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const id = rawData.id as string;

    const result = projectPaymentSchema.safeParse(rawData);
    if (!result.success) {
      return fail(400, {
        success: false,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data: rawData
      });
    }

    try {
      const [existing] = await db
        .select({ id: projectPayments.id, projectId: projectPayments.projectId })
        .from(projectPayments)
        .where(eq(projectPayments.id, id));

      if (!existing) {
        return fail(404, { success: false, error: 'Payment not found' });
      }
      if (existing.projectId !== result.data.projectId) {
        return fail(403, { success: false, error: 'Payment does not belong to this project' });
      }

      const [payment] = await db
        .update(projectPayments)
        .set({
          date: new Date(result.data.date),
          method: result.data.method || null,
          reference: result.data.reference || null,
          amount: String(result.data.amount),
          notes: result.data.notes || null,
          updatedAt: new Date()
        })
        .where(eq(projectPayments.id, id))
        .returning();

      return { success: true as const, payment };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to update payment', data: rawData });
    }
  },

  savePin: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const rawPin = formData.get('pin') as string;

    if (!id) {
      return fail(400, { success: false, error: 'Project ID is required' });
    }

    const { z } = await import('zod');
    const pinSchema = z.string().regex(/^[A-Za-z0-9]{4}$/, 'PIN must be exactly 4 letters').nullable().optional();
    const result = pinSchema.safeParse(rawPin || null);
    if (!result.success) {
      return fail(400, { success: false, error: 'PIN must be exactly 4 letters' });
    }

    try {
      await verifyProjectActive(id);
      await db
        .update(projects)
        .set({ pin: result.data || null, updatedAt: new Date() })
        .where(eq(projects.id, id));

      return { success: true as const };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to save PIN' });
    }
  },

  deletePayment: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const projectId = formData.get('projectId') as string;

    try {
      const [existing] = await db
        .select({ id: projectPayments.id, projectId: projectPayments.projectId })
        .from(projectPayments)
        .where(eq(projectPayments.id, id));

      if (!existing) {
        return fail(404, { success: false, error: 'Payment not found' });
      }
      if (projectId && existing.projectId !== projectId) {
        return fail(403, { success: false, error: 'Payment does not belong to this project' });
      }

      await db.delete(projectPayments).where(eq(projectPayments.id, id));
      return { success: true as const };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      return fail(500, { success: false as const, error: 'Failed to delete payment' });
    }
  }
};

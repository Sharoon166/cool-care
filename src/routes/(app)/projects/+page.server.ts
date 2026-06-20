import { db } from '$lib/server/db';
import { projects, customers, expenses, projectPayments } from '$lib/server/db/schema';
import { eq, isNull, desc, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { projectSchema, statusSchema } from '$lib/validations/project';

const FORBIDDEN_FIELDS = ['deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'id'];

function stripMeta(obj: Record<string, unknown>) {
  const clean = { ...obj };
  for (const key of FORBIDDEN_FIELDS) delete clean[key];
  return clean;
}

export const load: PageServerLoad = async ({ depends }) => {
  depends('app:projects:list');
  depends('app:projects:stats');
  depends('app:projects:customers');

  const [allProjects, allCustomers] = await Promise.all([
    db
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
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        createdBy: projects.createdBy,
        deletedAt: projects.deletedAt,
        spent: sql<number>`COALESCE((SELECT SUM(CAST(${expenses.amount} AS numeric)) FROM ${expenses} WHERE ${expenses.projectId} = ${projects.id} AND ${expenses.amount} IS NOT NULL), 0)`,
        received: sql<number>`COALESCE((SELECT SUM(CAST(${projectPayments.amount} AS numeric)) FROM ${projectPayments} WHERE ${projectPayments.projectId} = ${projects.id} AND ${projectPayments.amount} IS NOT NULL), 0)`
      })
      .from(projects)
      .leftJoin(customers, eq(projects.clientId, customers.id))
      .where(isNull(projects.deletedAt))
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: customers.id,
        name: customers.name,
        companyName: customers.companyName,
        phone: customers.phone,
        email: customers.email
      })
      .from(customers)
      .where(isNull(customers.deletedAt))
      .orderBy(desc(customers.createdAt))
  ]);

  const totalBudget = allProjects.reduce((sum, p) => sum + Number(p.budget), 0);
  const totalSpent = allProjects.reduce((sum, p) => sum + Number(p.spent), 0);
  const totalReceived = allProjects.reduce((sum, p) => sum + Number(p.received), 0);

  const stats = {
    budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
    collectionRate: totalBudget > 0 ? Math.round((totalReceived / totalBudget) * 100) : 0,
    outstandingReceivables: Math.max(0, totalBudget - totalReceived),
    netCashPosition: totalReceived - totalSpent
  };

  return { projects: allProjects, customers: allCustomers, stats };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const data = stripMeta({ ...rawData, budget: rawData.budget || '0' });

    const result = projectSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        success: false as const,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      const [project] = await db
        .insert(projects)
        .values({
          name: result.data.name,
          description: result.data.description || null,
          clientId: result.data.clientId,
          budget: String(result.data.budget),
          status: result.data.status,
          startDate: result.data.startDate ? new Date(result.data.startDate) : null,
          expectedEndDate: result.data.expectedEndDate ? new Date(result.data.expectedEndDate) : null,
          notes: result.data.notes || null
        })
        .returning();

      return { success: true as const, project };
    } catch {
      return fail(500, { success: false as const, error: 'Failed to create project', data });
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const id = rawData.id as string;
    const data = stripMeta({ ...rawData, budget: rawData.budget || '0' });

    const result = projectSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        success: false as const,
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      const [project] = await db
        .update(projects)
        .set({
          name: result.data.name,
          description: result.data.description || null,
          clientId: result.data.clientId,
          budget: String(result.data.budget),
          status: result.data.status,
          startDate: result.data.startDate ? new Date(result.data.startDate) : null,
          expectedEndDate: result.data.expectedEndDate ? new Date(result.data.expectedEndDate) : null,
          notes: result.data.notes || null,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();

      return { success: true as const, project };
    } catch {
      return fail(500, { success: false as const, error: 'Failed to update project', data });
    }
  },

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

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      await db
        .update(projects)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(projects.id, id));

      return { success: true as const };
    } catch {
      return fail(500, { success: false as const, error: 'Failed to delete project' });
    }
  }
};

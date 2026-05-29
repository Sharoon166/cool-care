import { db } from '$lib/server/db';
import { projects, customers } from '$lib/server/db/schema';
import { eq, isNull, and, desc, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const projectId = params.id;

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
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      createdBy: projects.createdBy,
      deletedAt: projects.deletedAt
    })
    .from(projects)
    .leftJoin(customers, eq(projects.clientId, customers.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));

  if (!project) {
    throw error(404, 'Project not found');
  }

  const allCustomers = await db
    .select({
      id: customers.id,
      name: customers.name,
      companyName: customers.companyName,
      phone: customers.phone,
      email: customers.email
    })
    .from(customers)
    .where(isNull(customers.deletedAt))
    .orderBy(desc(customers.createdAt));

  return { project, customers: allCustomers };
}

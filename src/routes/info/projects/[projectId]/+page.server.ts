import { db } from '$lib/server/db';
import { projects, projectPayments } from '$lib/server/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

async function getProject(projectId: string) {
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      pin: projects.pin,
      budget: sql<number>`CAST(${projects.budget} AS numeric)`,
      status: projects.status
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));

  if (!project) throw error(404, 'Project not found');
  return project;
}

async function buildFullResponse(projectId: string) {
  const [paymentsResult] = await db
    .select({
      totalReceived: sql<number>`COALESCE(CAST(SUM(CAST(${projectPayments.amount} AS numeric)) AS numeric), 0)`
    })
    .from(projectPayments)
    .where(eq(projectPayments.projectId, projectId));

  const projectPaymentsList = await db
    .select({
      id: projectPayments.id,
      method: projectPayments.method,
      reference: projectPayments.reference,
      amount: projectPayments.amount,
      date: projectPayments.date,
      notes: projectPayments.notes
    })
    .from(projectPayments)
    .where(eq(projectPayments.projectId, projectId))
    .orderBy(projectPayments.date);

  const project = await getProject(projectId);

  return {
    project: {
      id: project.id,
      name: project.name,
      budget: project.budget,
      status: project.status
    },
    requiredPin: project.pin,
    pinRequired: false,
    totalReceived: paymentsResult?.totalReceived ?? 0,
    payments: projectPaymentsList
  };
}

export async function load({ params, url, locals }) {
  const projectId = params.projectId;

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    throw error(503, 'Service temporarily unavailable');
  }

  const project = await getProject(projectId);

  // Admin users bypass the PIN gate entirely
  if (locals.user) {
    return buildFullResponse(projectId);
  }

  const pinParam = url.searchParams.get('pin') || '';
  const pinRequired = !!project.pin;
  const authenticatedViaPin = pinRequired && pinParam === project.pin;

  // PIN required but not provided or wrong — return partial data only
  if (pinRequired && !authenticatedViaPin) {
    return {
      project: {
        id: project.id,
        name: project.name,
        budget: project.budget,
        status: project.status
      },
      requiredPin: null,
      pinRequired: true,
      pinError: pinParam ? 'Invalid PIN. Please try again.' : null,
      totalReceived: 0,
      payments: []
    };
  }

  // No PIN required, or PIN matches — return full data
  return buildFullResponse(projectId);
}

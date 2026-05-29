import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { isNull, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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

  return { customers: allCustomers };
};

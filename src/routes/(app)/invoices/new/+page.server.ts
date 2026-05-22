import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { isNull } from 'drizzle-orm';
import { getNextInvoiceNumber } from '$lib/server/invoice-numbers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
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
    .orderBy(customers.name);

  const type = url.searchParams.get('type') === 'quotation' ? 'quotation' : 'invoice';

  return {
    customers: allCustomers,
    invoiceNumber: await getNextInvoiceNumber(type),
    defaultType: type as 'invoice' | 'quotation'
  };
};

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customers, invoices } from '$lib/server/db/schema';
import { sql, or, ilike, and, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'all'; // 'all', 'customers', 'invoices'

  if (!query || query.length < 2) {
    return json({ customers: [], invoices: [] });
  }

  try {
    const results: {
      customers: Array<{
        id: string;
        name: string;
        email: string | null;
        phone: string;
        companyName: string | null;
        type: 'customer';
      }>;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        customerName: string;
        total: number;
        status: string;
        invoiceDate: Date;
        type: 'invoice';
      }>;
    } = {
      customers: [],
      invoices: []
    };

    // Search customers
    if (type === 'all' || type === 'customers') {
      const customerResults = await db
        .select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          companyName: customers.companyName
        })
        .from(customers)
        .where(
          and(
            sql`${customers.deletedAt} IS NULL`,
            or(
              ilike(customers.name, `%${query}%`),
              ilike(customers.email, `%${query}%`),
              ilike(customers.phone, `%${query}%`),
              ilike(customers.companyName, `%${query}%`)
            )
          )
        )
        .limit(10);

      results.customers = customerResults.map((c) => ({
        ...c,
        type: 'customer' as const
      }));
    }

    // Search invoices
    if (type === 'all' || type === 'invoices') {
      const invoiceResults = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          customerName: customers.name,
          total: invoices.total,
          status: invoices.status,
          invoiceDate: invoices.invoiceDate
        })
        .from(invoices)
        .innerJoin(customers, sql`${customers.id} = ${invoices.customerId}`)
        .where(
          and(
            sql`${invoices.deletedAt} IS NULL`,
            or(
              ilike(invoices.invoiceNumber, `%${query}%`),
              ilike(customers.name, `%${query}%`)
            )
          )
        )
        .orderBy(desc(invoices.createdAt))
        .limit(10);

      results.invoices = invoiceResults.map((inv) => ({
        ...inv,
        total: Number(inv.total),
        status: inv.status || 'pending',
        type: 'invoice' as const
      }));
    }

    return json(results);
  } catch (error) {
    console.error('Search error:', error);
    return json({ customers: [], invoices: [], error: 'Search failed' }, { status: 500 });
  }
};

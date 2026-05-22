import { db } from '$lib/server/db';
import { invoiceCounters } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export async function getNextInvoiceNumber(type: 'invoice' | 'quotation'): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `${type === 'quotation' ? 'QT' : 'INV'}-${year}${month}`;

  const [result] = await db
    .insert(invoiceCounters)
    .values({ prefix, counter: 1 })
    .onConflictDoUpdate({
      target: invoiceCounters.prefix,
      set: { counter: sql`${invoiceCounters.counter} + 1`, updatedAt: new Date() }
    })
    .returning({ counter: invoiceCounters.counter });

  const seq = String(result.counter).padStart(3, '0');
  return `${prefix}-${seq}`;
}

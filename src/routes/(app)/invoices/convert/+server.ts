import { db } from '$lib/server/db';
import { invoices, payments } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { calculateInvoiceStatus } from '$lib/server/payment-actions';
import { getNextInvoiceNumber } from '$lib/server/invoice-numbers';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const quotationId = formData.get('quotationId') as string;

  try {
    const [quotation] = await db.select().from(invoices).where(eq(invoices.id, quotationId));

    if (!quotation) {
      return new Response(JSON.stringify({ error: 'Quotation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (quotation.type !== 'quotation') {
      return new Response(
        JSON.stringify({ error: 'Only quotations can be converted to invoices' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (quotation.status === 'converted') {
      return new Response(JSON.stringify({ error: 'This quotation has already been converted' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const invoiceNumber = await getNextInvoiceNumber('invoice');

    // Calculate status based on advance payment
    const totalAmount = parseFloat(quotation.total || '0');
    const paidAmount = parseFloat(quotation.paid || '0');
    const initialStatus = calculateInvoiceStatus(totalAmount, paidAmount, 'sent');

    // Create new invoice from quotation data
    const insertResult = await db
      .insert(invoices)
      .values({
        type: 'invoice',
        invoiceNumber,
        invoiceDate: new Date(),
        customerId: quotation.customerId,
        items: quotation.items,
        subtotal: quotation.subtotal,
        discountType: quotation.discountType,
        discountValue: quotation.discountValue,
        discountAmount: quotation.discountAmount,
        total: quotation.total,
        previous: quotation.previous,
        paid: quotation.paid,
        totalPaid: quotation.paid, // Transfer any advance payment
        balance: (
          parseFloat(quotation.total || '0') +
          parseFloat(quotation.previous || '0') -
          parseFloat(quotation.paid || '0')
        ).toString(), // Balance = total + previous - paid
        status: initialStatus, // Set based on advance payment
        notes: quotation.notes
      })
      .returning();

    if (!insertResult || insertResult.length === 0) {
      throw new Error('Failed to create invoice');
    }

    const newInvoice = insertResult[0];

    // Update the quotation status
    await db
      .update(invoices)
      .set({
        status: 'converted',
        convertedToInvoiceId: newInvoice.id,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, quotationId));

    if (parseFloat(quotation.paid || '0') > 0) {
      await db.insert(payments).values({
        id: createId(),
        invoiceId: newInvoice.id,
        amount: quotation.paid,
        paymentDate: new Date(),
        paymentMethod: 'cash',
        notes: 'Advance payment from quotation conversion',
        isAdvance: true
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: newInvoice.id
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error converting quotation:', error);
    return new Response(JSON.stringify({ error: 'Failed to convert quotation to invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

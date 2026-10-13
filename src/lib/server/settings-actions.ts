import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const paymentSettingsSchema = z.object({
  bank: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional()
  }).optional(),
  jazzCash: z.object({
    accountNumber: z.string().optional(),
    accountTitle: z.string().optional()
  }).optional(),
  easyPaisa: z.object({
    accountNumber: z.string().optional(),
    accountTitle: z.string().optional()
  }).optional()
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'payment_details'))
    .limit(1);

  if (result.length === 0) {
    return {
      bank: {},
      jazzCash: {},
      easyPaisa: {}
    };
  }

  return result[0].value as PaymentSettings;
}

export async function getAllSettings() {
  return await db.select().from(settings);
}

export async function savePaymentSettings(data: PaymentSettings) {
  try {
    const validationResult = paymentSettingsSchema.safeParse(data);
    if (!validationResult.success) {
      return fail(400, { error: 'Invalid payment settings data' });
    }

    await db
      .insert(settings)
      .values({
        key: 'payment_details',
        value: validationResult.data,
        description: 'Payment details for invoices (Bank, JazzCash, Easypaisa)'
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: validationResult.data, updatedAt: new Date() }
      });

    return { success: true };
  } catch (error) {
    console.error('Failed to save payment settings:', error);
    return fail(500, { error: 'Failed to save payment settings' });
  }
}
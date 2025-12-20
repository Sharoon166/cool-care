import { z } from 'zod';

export const customerSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().min(1, 'Phone is required').max(20),
	alternatePhone: z.string().max(20).optional().or(z.literal('')),
	address: z.string().max(255).optional().or(z.literal('')),
	city: z.string().max(100).optional().or(z.literal('')),
	postalCode: z.string().max(20).optional().or(z.literal('')),
	companyName: z.string().max(255).optional().or(z.literal('')),
	gstNumber: z.string().max(50).optional().or(z.literal('')),
	priority: z.enum(['normal', 'high', 'vip']).default('normal'),
	isActive: z.boolean().default(true),
	notes: z.string().optional().or(z.literal(''))
});

export type CustomerFormData = z.infer<typeof customerSchema>;

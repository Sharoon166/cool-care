import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

// Generate invoice/quotation number
function generateInvoiceNumber(type: 'invoice' | 'quotation' = 'invoice') {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const random = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, '0');
	const prefix = type === 'quotation' ? 'QT-' : 'INV-';
	return `${prefix}${year}${month}-${random}`;
}

export const load: PageServerLoad = async ({ url }) => {
	// Get all active customers for selection
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

	// Check if this is for a quotation
	const type = url.searchParams.get('type') === 'quotation' ? 'quotation' : 'invoice';

	return {
		customers: allCustomers,
		invoiceNumber: generateInvoiceNumber(type),
		defaultType: type
	};
};

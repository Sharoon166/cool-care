import { db } from '$lib/server/db';
import { invoices, customers } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, isNull, and } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { COMPANY_INFO, PAYMENT_INFO } from '$lib/constants';
import path from 'path';
import type { RequestHandler } from './$types';
import { formatDate, formatPKR } from '$lib/utils';

/* ---------------- HEXAGON HELPER ---------------- */
function drawHexagon(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number) {
	const sides = 6;
	const rotation = -Math.PI / 6;
	const step = (Math.PI * 2) / sides;
	for (let i = 0; i < sides; i++) {
		const angle = rotation + step * i;
		const x = cx + radius * Math.cos(angle);
		const y = cy + radius * Math.sin(angle);
		if(i==0){
			doc.moveTo(x,y);
		} else {
			doc.lineTo(x,y);
		}
	}
	doc.closePath();
}

interface InvoiceItem {
	id: string;
	description: string;
	quantity: number;
	rate: number;
	amount: number;
	notes?: string;
}

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const invoiceId = params.id;

		const [invoice] = await db
			.select({
				id: invoices.id,
				type: invoices.type,
				invoiceNumber: invoices.invoiceNumber,
				invoiceDate: invoices.invoiceDate,
				customerId: invoices.customerId,
				customerName: customers.name,
				items: invoices.items,
				subtotal: invoices.subtotal,
				discountAmount: invoices.discountAmount,
				total: invoices.total,
				previous: invoices.previous,
				totalPaid: invoices.totalPaid,
				balance: invoices.balance,
				notes: invoices.notes
			})
			.from(invoices)
			.leftJoin(customers, eq(invoices.customerId, customers.id))
			.where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

		if (!invoice) throw fail(404, { message: 'Invoice not found' });

		const items = (invoice.items as unknown as InvoiceItem[]) || [];

		/* ---------- PDF SETUP ---------- */
		const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
		const headers = new Headers({ 'Content-Type': 'application/pdf' });

		const f = (n: string) => path.resolve(`static/fonts/${n}`);
		doc.registerFont('M-Bold', f('Montserrat-Bold.ttf'));
		doc.registerFont('M-Extra', f('Montserrat-ExtraBold.ttf'));
		doc.registerFont('L-Reg', f('Lato-Regular.ttf'));
		doc.registerFont('L-Italic', f('Lato-Italic.ttf'));

		const pageWidth = 595;
		const pageHeight = 842;
		const margin = 50;

		const drawPageDecorations = () => {
			doc.rect(0, 0, pageWidth, 15).fill('#1a2b2b'); // Top band at absolute 0
			doc.rect(0, pageHeight - 40, pageWidth, 40).fill('#1a2b2b'); // Bottom band
			doc.font('L-Reg').fontSize(8).fillColor('#fff').text(
				`${COMPANY_INFO.address}  |  ${COMPANY_INFO.phones.join(', ')}`.toUpperCase(),
				0, pageHeight - 25, { align: 'center', width: pageWidth }
			);
			doc.fillColor('#000');
		};

		drawPageDecorations();

		/* ---------- HEADER CONTENT (Page 1) ---------- */
		// Logo removed for print version

		// Left Side: Company Branding
		doc.fillColor('#000').font('M-Extra').fontSize(24).text(COMPANY_INFO.name.toUpperCase(), margin, 65, { width: 250 });
		doc.font('L-Reg').fontSize(10).fillColor('#888').text(COMPANY_INFO.tagline.toUpperCase(), margin, 96, { 
			width: 250, 
			characterSpacing: 1 
		});

		// Right Side: Invoice Title and Number
		doc.fillColor('#444').font('M-Extra').fontSize(24).text(invoice.type.toUpperCase(), pageWidth - margin - 160, 68, { align: 'right', width: 160 });
		doc.font('L-Reg').fontSize(12).fillColor('#666').text(invoice.invoiceNumber, pageWidth - margin - 160, 98, { align: 'right', width: 160 });


		// Billed To & Date (adjusted position)
		let y = 150;
		doc.font('M-Bold').fontSize(10).fillColor('#555');
		doc.text('BILLED TO:', margin, y);
		doc.text('DATE:', margin, y + 25);

		doc.font('L-Reg').fontSize(11).fillColor('#000');
		doc.text(invoice.customerName ?? 'Walking Customer', margin + 85, y);
		doc.text(formatDate.short(invoice.invoiceDate), margin + 85, y + 25);

		y = 210; 

		/* ---------- TABLE HEADER ---------- */
		const col = { num: 30, desc: 230, qty: 50, rate: 90, total: 95 };
		
		doc.font('M-Bold').fontSize(9).fillColor('#1a2b2b');
		doc.text('#', margin, y);
		doc.text('DESCRIPTION', margin + col.num, y);
		doc.text('QTY', margin + col.num + col.desc, y, { width: col.qty, align: 'center' });
		doc.text('RATE', margin + col.num + col.desc + col.qty, y, { width: col.rate, align: 'right' });
		doc.text('AMOUNT', margin + col.num + col.desc + col.qty + col.rate, y, { width: col.total, align: 'right' });

		y += 18;
		doc.strokeColor('#1a2b2b').lineWidth(1.5).moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
		y += 15;

		/* ---------- ITEM LOOP ---------- */
		items.forEach((item, i) => {
			const descHeight = doc.heightOfString(item.description, { width: col.desc - 10, font: 'L-Reg', size: 10 });
			const notesHeight = item.notes ? doc.heightOfString(item.notes, { width: col.desc - 10, font: 'L-Italic', size: 8 }) + 6 : 0;
			const rowHeight = Math.max(descHeight + notesHeight + 10, 25) + 10;

			// Check if we need a new page
			if (y + rowHeight > pageHeight - 120) {
				doc.addPage();
				drawPageDecorations();
				y = 50;
				
				// Redraw table header on new page
				doc.strokeColor('#eee').lineWidth(1).moveTo(margin, y - 10).lineTo(pageWidth - margin, y - 10).stroke();
				doc.font('M-Bold').fontSize(9).fillColor('#1a2b2b');
				doc.text('#', margin, y);
				doc.text('DESCRIPTION', margin + col.num, y);
				doc.text('QTY', margin + col.num + col.desc, y, { width: col.qty, align: 'center' });
				doc.text('RATE', margin + col.num + col.desc + col.qty, y, { width: col.rate, align: 'right' });
				doc.text('AMOUNT', margin + col.num + col.desc + col.qty + col.rate, y, { width: col.total, align: 'right' });
				y += 18;
				doc.strokeColor('#1a2b2b').lineWidth(1.5).moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
				y += 15;
			}

			// Alternating row background
			if (i % 2 === 1) {
				doc.rect(margin - 10, y - 5, pageWidth - (margin * 2) + 20, rowHeight).fill('#fafafa');
			}
			
			// Row content
			doc.fillColor('#000').font('L-Reg').fontSize(10);
			const startY = y;
			
			// Item number
			doc.text(String(i + 1), margin, startY);
			
			// Description
			doc.text(item.description, margin + col.num, startY, { width: col.desc - 10 });
			
			// Notes (if any)
			if (item.notes) {
				const descEndY = doc.y;
				doc.font('L-Italic').fontSize(8).fillColor('#777');
				doc.text(item.notes, margin + col.num, descEndY + 3, { width: col.desc - 10 });
			}

			// Quantity, Rate, Amount (aligned to top of row)
			doc.fillColor('#000').font('L-Reg').fontSize(10);
			doc.text(String(item.quantity), margin + col.num + col.desc, startY, { width: col.qty, align: 'center' });
			doc.text(Number(item.rate).toLocaleString(), margin + col.num + col.desc + col.qty, startY, { width: col.rate, align: 'right' });
			doc.font('M-Bold').fontSize(10);
			doc.text(Number(item.amount).toLocaleString(), margin + col.num + col.desc + col.qty + col.rate, startY, { width: col.total, align: 'right' });

			y += rowHeight;
		});

		/* ---------- SUMMARY SECTION ---------- */
		// Calculate actual space needed for summary section
		const summaryRows = [
			'SUBTOTAL',
			...(Number(invoice.discountAmount) > 0 ? ['DISCOUNT'] : []),
			...(Number(invoice.previous) > 0 ? ['PREVIOUS BAL.'] : []),
			'TOTAL PAYABLE',
			...(Number(invoice.totalPaid) > 0 ? ['TOTAL PAID'] : []),
			'BALANCE DUE'
		];
		const summaryHeight = summaryRows.length * 22 + 60; // 22px per row + spacing
		const FOOTER_SPACE = 175; // Space for payment details and QR code
		const REQUIRED_SPACE = summaryHeight + FOOTER_SPACE;
		
		// Only create new page if we really don't have enough space
		if (y + REQUIRED_SPACE > pageHeight - 40) {
			doc.addPage();
			drawPageDecorations();
			y = 50;
		}

		y += 20; // Reduced spacing to keep summary closer to table
		const sumX = 340;
		const labelW = 100;
		const valueW = 105;

		const drawSumRow = (label: string, value: string, isBold = false, isAccent = false) => {
			if (isAccent) {
				doc.rect(sumX - 5, y - 8, labelW + valueW + 15, 28).fill('#1a2b2b');
				doc.fillColor('#fff');
			} else {
				doc.fillColor('#444');
			}
			doc.font(isBold ? 'M-Bold' : 'L-Reg').fontSize(isBold ? 11 : 10);
			doc.text(label, sumX, y, { width: labelW, align: 'right' });
			doc.text(value, sumX + labelW + 5, y, { width: valueW, align: 'right' });
			y += 22;
			if (isAccent) doc.fillColor('#000'); // Reset color after accent row
		};

		drawSumRow('SUBTOTAL', Number(invoice.subtotal).toLocaleString());
		if (Number(invoice.discountAmount) > 0) {
			drawSumRow('DISCOUNT', `- ${Number(invoice.discountAmount).toLocaleString()}`);
		}
		if (Number(invoice.previous) > 0) {
			drawSumRow('PREVIOUS BAL.', Number(invoice.previous).toLocaleString());
		}
		
		// Separator line
		doc.strokeColor('#ddd').lineWidth(1).moveTo(sumX + 40, y - 5).lineTo(pageWidth - margin, y - 5).stroke();
		y += 10;
		
		drawSumRow('TOTAL PAYABLE', formatPKR.standard(Number(invoice.total) + Number(invoice.previous)), true);
		
		if (Number(invoice.totalPaid) > 0) {
			drawSumRow('TOTAL PAID', Number(invoice.totalPaid).toLocaleString());
		}
		
		y += 5;
		drawSumRow('BALANCE DUE', formatPKR.standard(invoice.balance), true, true);

		/* ---------- FINAL FOOTER INFO ---------- */
		const qrBuffer = await QRCode.toBuffer(`${url.origin}/info/${invoice.customerId}`, { margin: 1 });
		const fy = pageHeight - 175;
		doc.strokeColor('#eee').lineWidth(1).moveTo(margin, fy - 10).lineTo(pageWidth - margin, fy - 10).stroke();
		
		// Payment Details Section (Left Side)
		doc.fillColor('#1a2b2b').font('M-Bold').fontSize(9).text('PAYMENT DETAILS', margin, fy);
		doc.font('L-Reg').fontSize(9).fillColor('#555');
		doc.text(`JazzCash: ${PAYMENT_INFO.jazzCash.accountNumber} (${PAYMENT_INFO.jazzCash.accountTitle})`, margin, fy + 18);
		doc.text(`Easypaisa: ${PAYMENT_INFO.easyPaisa.accountNumber} (${PAYMENT_INFO.easyPaisa.accountTitle})`, margin, fy + 32);

		// Notes Section (Left Side, below payment details)
		if (invoice.notes) {
			doc.fillColor('#1a2b2b').font('M-Bold').text('REMARKS', margin, fy + 55);
			doc.font('L-Italic').fillColor('#666').text(invoice.notes, margin, fy + 68, { width: 280 });
		}
		
		// QR Code Section (Right Side) - positioned to avoid overlap
		const qrSize = 85;
		const qrx = pageWidth - margin - qrSize;
		const qry = fy + 10; // Moved down slightly to avoid overlap
		
		// QR Code background for better visibility
		doc.rect(qrx - 5, qry - 5, qrSize + 10, qrSize + 10).fill('#f8f8f8').stroke('#ddd');
		
		// QR Code
		doc.image(qrBuffer, qrx, qry, { width: qrSize });
		
		// Logo inside QR with better positioning
		const cx = qrx + qrSize/2;
		const cy = qry + qrSize/2;
		doc.save().fillColor('#fff');
		drawHexagon(doc, cx, cy, 18);
		doc.fill().restore();
		const logoPath = path.resolve('static/logo.png');
		try { 
			doc.image(logoPath, cx - 12, cy - 12, { width: 24 }); 
		} catch {
			console.log("FAILED TO ADD HEXAGON LOGO")
		}
		
		// QR Code label
		doc.fillColor('#666').font('L-Reg').fontSize(8).text('Scan for Customer Portal', qrx - 10, qry + qrSize + 8, { 
			width: qrSize + 20, 
			align: 'center' 
		});

		doc.end();
		const chunks: Buffer[] = [];
		const result = await new Promise<Buffer>((resolve) => {
			doc.on('data', (c) => chunks.push(c));
			doc.on('end', () => resolve(Buffer.concat(chunks)));
		});

		return new Response(result, { headers });
	} catch (err) {
		console.error('PDF Error:', err);
		throw fail(500);
	}
};
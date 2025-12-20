/**
 * Template 0
 */
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
function drawHexagon(
	doc: PDFKit.PDFDocument,
	cx: number,
	cy: number,
	radius: number,
	cornerRadius = 4
) {
	const sides = 6;
	const rotation = -Math.PI / 6; // pointy-top
	const step = (Math.PI * 2) / sides;

	const points = [];

	for (let i = 0; i < sides; i++) {
		const angle = rotation + step * i;
		points.push({
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle)
		});
	}

	for (let i = 0; i < sides; i++) {
		const prev = points[(i + sides - 1) % sides];
		const curr = points[i];
		const next = points[(i + 1) % sides];

		const vx1 = curr.x - prev.x;
		const vy1 = curr.y - prev.y;
		const len1 = Math.hypot(vx1, vy1);

		const vx2 = next.x - curr.x;
		const vy2 = next.y - curr.y;
		const len2 = Math.hypot(vx2, vy2);

		const p1 = {
			x: curr.x - (vx1 / len1) * cornerRadius,
			y: curr.y - (vy1 / len1) * cornerRadius
		};

		const p2 = {
			x: curr.x + (vx2 / len2) * cornerRadius,
			y: curr.y + (vy2 / len2) * cornerRadius
		};

		if (i === 0) {
			doc.moveTo(p1.x, p1.y);
		} else {
			doc.lineTo(p1.x, p1.y);
		}

		doc.quadraticCurveTo(curr.x, curr.y, p2.x, p2.y);
	}

	doc.closePath();
}

/* ------------------------------------------------ */

interface InvoiceItem {
	description: string;
	quantity: number;
	rate: number;
	amount: number;
}

export const GET: RequestHandler = async ({ params, url }) => {
	const invoiceId = params.id;

	try {
		const [invoice] = await db
			.select({
				id: invoices.id,
				type: invoices.type,
				invoiceNumber: invoices.invoiceNumber,
				invoiceDate: invoices.invoiceDate,
				customerId: invoices.customerId,
				customerName: customers.name,
				customerPhone: customers.phone,
				items: invoices.items,
				subtotal: invoices.subtotal,
				total: invoices.total,
				previous: invoices.previous,
				notes: invoices.notes,
				discountAmount: invoices.discountAmount
			})
			.from(invoices)
			.leftJoin(customers, eq(invoices.customerId, customers.id))
			.where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

		if (!invoice) throw fail(404, { message: 'Invoice not found' });

		const items = (invoice.items as unknown as InvoiceItem[]) || [];

		/* ---------- QR CODE (LOGO SAFE) ---------- */
		const qrData = `${url.origin}/info/${invoice.customerId}`;
		const qrBuffer = await QRCode.toBuffer(qrData, {
			errorCorrectionLevel: 'H',
			type: 'png',
			width: 400,
			margin: 1,
			color: {
				dark: '#0f172a',
				light: '#ffffff'
			}
		});

		/* ---------- PDF ---------- */
		const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
		const headers = new Headers();
		headers.set('Content-Type', 'application/pdf');

		const f = (n: string) => path.resolve(`static/fonts/${n}`);
		doc.registerFont('M-Bold', f('Montserrat-Bold.ttf'));
		doc.registerFont('M-Extra', f('Montserrat-ExtraBold.ttf'));
		doc.registerFont('L-Reg', f('Lato-Regular.ttf'));
		doc.registerFont('L-Italic', f('Lato-Italic.ttf'));

		const pageWidth = 595;
		const pageHeight = 842;
		const margin = 50;

		/* ---------- HEADER STRIP ---------- */
		doc.rect(0, 0, pageWidth + 20, 15).fill('#1a2b2b');

		/* ---------- BRANDING ---------- */
		const logoPath = path.resolve('static/logo.png');
		try {
			doc.image(logoPath, margin, 50, { width: 120 });
		} catch {}

		doc
			.font('M-Bold')
			.fontSize(24)
			.fillColor('#000')
			.text('COOL CARE', 300, 55, { align: 'right', width: pageWidth - margin - 300 });

		doc
			.font('L-Reg')
			.fontSize(9)
			.fillColor('#666')
			.text('ELECTRICAL & AC REPAIR SERVICES', 300, 85, {
				align: 'right',
				width: pageWidth - margin - 300,
				characterSpacing: 1
			});

		doc.font('M-Extra').fontSize(40).text(invoice.type.toUpperCase(), margin, 180);
		doc
			.font('L-Reg')
			.fontSize(12)
			.text(invoice.invoiceNumber, margin + 5, 230);

		/* ---------- INFO ---------- */
		let y = 280;
		doc.font('M-Bold').fontSize(10).text('BILLED TO:', margin, y);
		doc
			.font('L-Reg')
			.fontSize(11)
			.text(invoice.customerName ?? 'Walking Customer', margin + 80, y);

		y += 20;
		doc.font('M-Bold').text('DATE:', margin, y);
		doc.font('L-Reg').text(formatDate.short(invoice.invoiceDate), margin + 80, y);

		y += 35;
		doc
			.moveTo(margin, y)
			.lineTo(pageWidth - margin, y)
			.stroke();

		/* ---------- TABLE ---------- */
		y += 20;
		const col = { num: 30, desc: 250, qty: 50, rate: 80, total: 85 };

		doc.font('M-Bold').fontSize(9);
		doc.text('#', margin, y);
		doc.text('DESCRIPTION', margin + col.num, y);
		doc.text('QTY', margin + col.num + col.desc, y, { width: col.qty, align: 'center' });
		doc.text('RATE', margin + col.num + col.desc + col.qty, y, { width: col.rate, align: 'right' });
		doc.text('AMOUNT', margin + col.num + col.desc + col.qty + col.rate, y, {
			width: col.total,
			align: 'right'
		});

		y += 18;
		doc
			.moveTo(margin, y)
			.lineTo(pageWidth - margin, y)
			.stroke();

		items.forEach((item, i) => {
			y += 15;
			if (y > 650) {
				doc.addPage();
				y = 50;
			}

			doc.font('L-Reg').fontSize(10);
			doc.text(String(i + 1), margin, y);
			doc.text(item.description || '-', margin + col.num, y, { width: col.desc });
			doc.text(String(item.quantity), margin + col.num + col.desc, y, {
				width: col.qty,
				align: 'center'
			});
			doc.text(Number(item.rate).toLocaleString(), margin + col.num + col.desc + col.qty, y, {
				width: col.rate,
				align: 'right'
			});
			doc
				.font('M-Bold')
				.text(
					Number(item.amount).toLocaleString(),
					margin + col.num + col.desc + col.qty + col.rate,
					y,
					{
						width: col.total,
						align: 'right'
					}
				);

			y += 22;
			doc
				.moveTo(margin, y)
				.lineTo(pageWidth - margin, y)
				.lineWidth(0.2)
				.strokeColor('#ddd')
				.stroke();
		});

		/* ---------- SUMMARY ---------- */
		y += 20;
		const sx = 350;

		doc
			.font('L-Reg')
			.fontSize(10)
			.fillColor('#666')
			.text('SUBTOTAL', sx, y, { width: 100, align: 'right' });
		doc
			.font('M-Bold')
			.fillColor('#000')
			.text(invoice.subtotal.toLocaleString(), sx + 110, y, {
				width: 85,
				align: 'right'
			});

		if (Number(invoice.previous)) {
			y += 25;
			doc.font('L-Reg').text('BALANCE', sx, y, { width: 100, align: 'right' });
			doc.font('M-Bold').text(invoice.previous.toLocaleString(), sx + 110, y, {
				width: 85,
				align: 'right'
			});
		}

		y += 25;
		doc.rect(sx + 30, y - 8, 165, 30).fill('#f4f4f4');
		doc
			.font('M-Bold')
			.fontSize(12)
			.fillColor('#000')
			.text('TOTAL DUE', sx + 40, y);
		doc.text(formatPKR.standard(Number(invoice.total) + Number(invoice.previous)), sx + 110, y, {
			width: 85,
			align: 'right'
		});

		/* ---------- FOOTER (ALL PAGES) ---------- */
		const pages = doc.bufferedPageRange();
		for (let i = 0; i < pages.count; i++) {
			doc.switchToPage(i);

			doc
				.moveTo(margin, pageHeight - 170)
				.lineTo(pageWidth - margin, pageHeight - 170)
				.stroke();

			const qrSize = 110;
			const qrX = pageWidth - margin - qrSize;
			const qrY = pageHeight - 160;

			// QR
			doc.image(qrBuffer, qrX, qrY, { width: qrSize });

			// HEX CUTOUT
			const centerX = qrX + qrSize / 2;
			const centerY = qrY + qrSize / 2;
			const logoSize = 28;
			const hexRadius = logoSize / 2 + 4;

			doc.save();
			doc.fillColor('#ffffff');
			drawHexagon(doc, centerX, centerY, hexRadius);
			doc.fill();
			doc.restore();

			const opticalOffsetX = -0.01; // tweak once, keep forever
			const opticalOffsetY = -1;

			const lx = centerX - logoSize / 2 + opticalOffsetX;
			const ly = centerY - logoSize / 2 + opticalOffsetY;
			try {
				doc.image(logoPath, lx, ly, { width: logoSize });
			} catch {}

			const fy = pageHeight - 155;
			doc.font('M-Bold').fontSize(9).text('PAY TO:', margin, fy);
			doc.font('L-Reg').fontSize(9).fillColor('#444');
			doc.text(
				`JazzCash: ${PAYMENT_INFO.jazzCash.accountNumber} (${PAYMENT_INFO.jazzCash.accountTitle})`,
				margin,
				fy + 15
			);
			doc.text(
				`Easypaisa: ${PAYMENT_INFO.easyPaisa.accountNumber} (${PAYMENT_INFO.easyPaisa.accountTitle})`,
				margin,
				fy + 27
			);

			if (invoice.notes) {
				doc
					.font('M-Bold')
					.fontSize(9)
					.text('NOTES:', margin, fy + 50);
				doc
					.font('L-Italic')
					.fontSize(9)
					.fillColor('#666')
					.text(invoice.notes, margin, fy + 62, { width: 300 });
			}

			doc.rect(0, pageHeight - 40, pageWidth + 20, 50).fill('#1a2b2b');
			doc.font('L-Reg').fontSize(8).fillColor('#fff');
			doc.text(
				`${COMPANY_INFO.address}  |  ${COMPANY_INFO.phones.join(', ')}`.toUpperCase(),
				0,
				pageHeight - 25,
				{ align: 'center', width: pageWidth }
			);
		}

		doc.end();

		const chunks: Buffer[] = [];
		return new Response(
			await new Promise<Buffer>((resolve) => {
				doc.on('data', (c) => chunks.push(c));
				doc.on('end', () => resolve(Buffer.concat(chunks)));
			}),
			{ headers }
		);
	} catch (err) {
		console.error(err);
		throw fail(500);
	}
};

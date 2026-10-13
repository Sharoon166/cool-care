import { db } from '$lib/server/db';
import { invoices, customers, settings } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, isNull, and } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
// import QRCode from 'qrcode';
import { COMPANY_INFO } from '$lib/constants';
// import path from 'path';
import { LatoRegular, LatoItalic, MontserratBold, MontserratExtraBold } from '$lib/fonts';
import type { RequestHandler } from './$types';
import { formatDate, formatPKR } from '$lib/utils';

/* ---------------- HEXAGON HELPER (unused - QR code removed) ---------------- */
// function drawHexagon(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number) {
//   const sides = 6;
//   const rotation = -Math.PI / 6;
//   const step = (Math.PI * 2) / sides;
//   for (let i = 0; i < sides; i++) {
//     const angle = rotation + step * i;
//     const x = cx + radius * Math.cos(angle);
//     const y = cy + radius * Math.sin(angle);
//     if (i == 0) {
//       doc.moveTo(x, y);
//     } else {
//       doc.lineTo(x, y);
//     }
//   }
//   doc.closePath();
// }

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
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`
    });

    doc.info.Title = `${invoice.customerName} - ${invoice.invoiceNumber} | ${COMPANY_INFO.name} `;
    doc.info.Author = COMPANY_INFO.name;

    doc.registerFont('M-Bold', MontserratBold);
    doc.registerFont('M-Extra', MontserratExtraBold);
    doc.registerFont('L-Reg', LatoRegular);
    doc.registerFont('L-Italic', LatoItalic);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;

    // Fetch payment settings from database
    const [paymentSettingsRow] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'payment_details'))
      .limit(1);

    const paymentSettings = paymentSettingsRow?.value as {
      bank?: { bankName?: string; accountName?: string; accountNumber?: string; iban?: string; swiftCode?: string };
      jazzCash?: { accountNumber?: string; accountTitle?: string };
      easyPaisa?: { accountNumber?: string; accountTitle?: string };
    } || { bank: {}, jazzCash: {}, easyPaisa: {} };

    const drawPageDecorations = () => {
      doc.rect(0, 0, pageWidth, 15).fill('#1a2b2b'); // Top band at absolute 0
      doc.rect(0, pageHeight - 55, pageWidth, 55).fill('#1a2b2b'); // Bottom band

      // Build payment details line from database settings
      const paymentLines: string[] = [];
      
      if (paymentSettings.bank?.accountNumber) {
        const bankName = paymentSettings.bank.bankName || 'Bank';
        paymentLines.push(`${bankName}: ${paymentSettings.bank.accountNumber}`);
      }
      if (paymentSettings.jazzCash?.accountNumber) {
        const title = paymentSettings.jazzCash.accountTitle ? ` (${paymentSettings.jazzCash.accountTitle})` : '';
        paymentLines.push(`JazzCash: ${paymentSettings.jazzCash.accountNumber}${title}`);
      }
      if (paymentSettings.easyPaisa?.accountNumber) {
        const title = paymentSettings.easyPaisa.accountTitle ? ` (${paymentSettings.easyPaisa.accountTitle})` : '';
        paymentLines.push(`Easypaisa: ${paymentSettings.easyPaisa.accountNumber}${title}`);
      }

      if (paymentLines.length > 0) {
        doc.font('L-Reg').fontSize(7).fillColor('#fff');
        doc.text(`PAYMENT DETAILS    ${paymentLines.join('  |  ')}`, 0, pageHeight - 48, {
          width: pageWidth,
          align: 'center'
        });
      }

      // Address line (centered below)
      doc
        .font('L-Reg')
        .fontSize(7)
        .fillColor('#ccc')
        .text(
          `${COMPANY_INFO.address}  |  ${COMPANY_INFO.phones.join(', ')}`.toUpperCase(),
          0,
          pageHeight - 30,
          { align: 'center', width: pageWidth }
        );
      doc.fillColor('#000');
    };

    drawPageDecorations();

    /* ---------- HEADER CONTENT (Page 1) ---------- */
    // Logo removed for print version

    // Left Side: Company Branding
    doc
      .fillColor('#000')
      .font('M-Extra')
      .fontSize(24)
      .text(COMPANY_INFO.name.toUpperCase(), margin, 65, { width: 250 });
    doc
      .font('L-Reg')
      .fontSize(10)
      .fillColor('#888')
      .text(COMPANY_INFO.tagline.toUpperCase(), margin, 96, {
        width: 250,
        characterSpacing: 1
      });

    // Right Side: Invoice Title and Number
    doc
      .fillColor('#444')
      .font('M-Extra')
      .fontSize(24)
      .text(invoice.type.toUpperCase(), pageWidth - margin - 160, 68, {
        align: 'right',
        width: 160
      });
    doc
      .font('L-Reg')
      .fontSize(12)
      .fillColor('#666')
      .text(invoice.invoiceNumber, pageWidth - margin - 160, 98, {
        align: 'right',
        width: 160
      });

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
    doc.text('RATE', margin + col.num + col.desc + col.qty, y, {
      width: col.rate,
      align: 'right'
    });
    doc.text('AMOUNT', margin + col.num + col.desc + col.qty + col.rate, y, {
      width: col.total,
      align: 'right'
    });

    y += 18;
    doc
      .strokeColor('#1a2b2b')
      .lineWidth(1.5)
      .moveTo(margin, y)
      .lineTo(pageWidth - margin, y)
      .stroke();
    y += 15;

    /* ---------- ITEM LOOP ---------- */
    items.forEach((item, i) => {
      const descHeight = doc.heightOfString(item.description, {
        width: col.desc - 10,
        font: 'L-Reg',
        size: 10
      });
      const notesHeight = item.notes
        ? doc.heightOfString(item.notes, {
            width: col.desc - 10,
            font: 'L-Italic',
            size: 8
          }) + 6
        : 0;
      const rowHeight = Math.max(descHeight + notesHeight + 10, 25) + 10;

      const CONTENT_BOTTOM = pageHeight - 70; // footer band starts at 787, keep ~17pt gap

      // in the item loop
      if (y + rowHeight > CONTENT_BOTTOM) {
        doc.addPage();
        drawPageDecorations();
        y = 50;

        // Redraw table header on new page
        doc
          .strokeColor('#eee')
          .lineWidth(1)
          .moveTo(margin, y - 10)
          .lineTo(pageWidth - margin, y - 10)
          .stroke();
        doc.font('M-Bold').fontSize(9).fillColor('#1a2b2b');
        doc.text('#', margin, y);
        doc.text('DESCRIPTION', margin + col.num, y);
        doc.text('QTY', margin + col.num + col.desc, y, {
          width: col.qty,
          align: 'center'
        });
        doc.text('RATE', margin + col.num + col.desc + col.qty, y, {
          width: col.rate,
          align: 'right'
        });
        doc.text('AMOUNT', margin + col.num + col.desc + col.qty + col.rate, y, {
          width: col.total,
          align: 'right'
        });
        y += 18;
        doc
          .strokeColor('#1a2b2b')
          .lineWidth(1.5)
          .moveTo(margin, y)
          .lineTo(pageWidth - margin, y)
          .stroke();
        y += 15;
      }

      // Alternating row background
      if (i % 2 === 1) {
        doc.rect(margin - 10, y - 5, pageWidth - margin * 2 + 20, rowHeight).fill('#fafafa');
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
      doc.text(String(item.quantity), margin + col.num + col.desc, startY, {
        width: col.qty,
        align: 'center'
      });
      doc.text(Number(item.rate).toLocaleString(), margin + col.num + col.desc + col.qty, startY, {
        width: col.rate,
        align: 'right'
      });
      doc.font('M-Bold').fontSize(10);
      doc.text(
        Number(item.amount).toLocaleString(),
        margin + col.num + col.desc + col.qty + col.rate,
        startY,
        { width: col.total, align: 'right' }
      );

      y += rowHeight;
    });

    /* ---------- SUMMARY + PAYMENT DETAILS ---------- */
    const summaryRowCount = 3 + (Number(invoice.discountAmount) > 0 ? 1 : 0) +
      (Number(invoice.previous) > 0 ? 1 : 0) + (Number(invoice.totalPaid) > 0 ? 1 : 0);
    const summaryBlockHeight = summaryRowCount * 22 + 30;
    const remarksHeight = invoice.notes ? 30 : 0;
    const totalNeeded = summaryBlockHeight + remarksHeight;

    if (y + totalNeeded > pageHeight - 55) {
      doc.addPage();
      drawPageDecorations();
      y = 50;
    }

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
      if (isAccent) doc.fillColor('#000');
    };

    y += 20;

    drawSumRow('SUBTOTAL', Number(invoice.subtotal).toLocaleString());
    if (Number(invoice.discountAmount) > 0) {
      drawSumRow('DISCOUNT', `- ${Number(invoice.discountAmount).toLocaleString()}`);
    }
    if (Number(invoice.previous) > 0) {
      drawSumRow('PREVIOUS BAL.', Number(invoice.previous).toLocaleString());
    }

    // Separator line
    doc
      .strokeColor('#ddd')
      .lineWidth(1)
      .moveTo(sumX + 40, y - 5)
      .lineTo(pageWidth - margin, y - 5)
      .stroke();
    y += 10;

    drawSumRow(
      'TOTAL PAYABLE',
      formatPKR.standard(Number(invoice.total) + Number(invoice.previous)),
      true
    );

    if (Number(invoice.totalPaid) > 0) {
      drawSumRow('TOTAL PAID', Number(invoice.totalPaid).toLocaleString());
    }

    y += 5;
    drawSumRow('BALANCE DUE', formatPKR.standard(invoice.balance), true, true);

    // Payment details are now in the footer band (drawPageDecorations)

    if (invoice.notes) {
      y += 20;
      doc.fillColor('#1a2b2b').font('M-Bold').fontSize(8).text('REMARKS', margin, y);
      y += 12;
      doc.font('L-Italic').fillColor('#666').text(invoice.notes, margin, y, { width: 280 });
    }

    // QR Code (commented out - payment details now in footer)
    // const qrBuffer = await QRCode.toBuffer(`${url.origin}/info/${invoice.customerId}`, {
    //   margin: 1,
    //   errorCorrectionLevel: "H",
    // });
    // const qrSize = 85;
    // const qrx = pageWidth - margin - qrSize;
    // const qry = fy + 10;
    // doc.rect(qrx - 5, qry - 5, qrSize + 10, qrSize + 10).fill('#f8f8f8').stroke('#ddd');
    // doc.image(qrBuffer, qrx, qry, { width: qrSize });
    // const cx = qrx + qrSize / 2;
    // const cy = qry + qrSize / 2;
    // doc.save().fillColor('#fff');
    // drawHexagon(doc, cx, cy, 18);
    // doc.fill().restore();
    // const logoPath = path.resolve('static/logo-new.png');
    // try {
    //   doc.image(logoPath, cx - 12, cy - 12, { width: 24 });
    // } catch {
    //   console.log('FAILED TO ADD HEXAGON LOGO');
    // }
    // doc.fillColor('#666').font('L-Reg').fontSize(8)
    //   .text('Scan for Customer Portal', qrx - 10, qry + qrSize + 8, { width: qrSize + 20, align: 'center' });

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

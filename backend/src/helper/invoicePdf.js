// Renders invoice data into a PDF buffer.
//
// PDFKit rather than a headless browser on purpose: it is pure JavaScript with
// no native dependencies, so the API image stays small and the same code runs
// on a free hosting tier that would never fit Chromium.
//
// Currency is written as "BDT" and not the taka sign. PDFKit's built-in fonts
// are WinAnsi-encoded and U+09F3 is not in that set, so the glyph would come
// out as mojibake or throw outright. Rendering it properly means shipping an
// embedded Bengali font; until that is worth the binary in the repository, the
// three-letter code is unambiguous and prints everywhere.

const PDFDocument = require("pdfkit");

const PAGE_MARGIN = 50;
const ACCENT = "#e11d48"; // rose-600, matching the storefront
const INK = "#0f172a"; // slate-900
const MUTED = "#64748b"; // slate-500
const RULE = "#e2e8f0"; // slate-200

// Column edges for the line-item table, as offsets from the left margin.
const COLUMNS = {
  description: { x: 0, width: 250 },
  quantity: { x: 260, width: 50 },
  unitPrice: { x: 320, width: 90 },
  amount: { x: 415, width: 80 },
};

const formatMoney = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return `BDT ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Build the invoice PDF.
 *
 * @param {object} invoice - output of helper/invoiceHelper.buildInvoiceData
 * @returns {Promise<Buffer>} the finished document
 */
const generateInvoicePdf = (invoice) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: PAGE_MARGIN,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: invoice.store.name,
          Subject: `Invoice for order ${invoice.order._id}`,
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const contentWidth = right - left;

      const horizontalRule = (y, color = RULE) => {
        doc
          .save()
          .strokeColor(color)
          .lineWidth(1)
          .moveTo(left, y)
          .lineTo(right, y)
          .stroke()
          .restore();
      };

      // --- header -------------------------------------------------------
      doc
        .fillColor(ACCENT)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(invoice.store.name, left, PAGE_MARGIN);

      // STORE_EMAIL and STORE_PHONE are optional configuration, so print only
      // the lines that have something in them - an empty string still advances
      // the cursor and leaves a gap in the header.
      doc.fillColor(MUTED).font("Helvetica").fontSize(9);
      [invoice.store.address, invoice.store.email, invoice.store.phone]
        .filter((line) => line && String(line).trim())
        .forEach((line, index) => {
          doc.text(line, left, index === 0 ? doc.y + 2 : doc.y, { width: 260 });
        });

      const headerBottomLeft = doc.y;

      // Right-hand title block, drawn from the same top edge as the store name.
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("INVOICE", left, PAGE_MARGIN, {
          width: contentWidth,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(MUTED)
        .text("Invoice number", left, doc.y + 4, {
          width: contentWidth,
          align: "right",
        })
        .fillColor(INK)
        .font("Helvetica-Bold")
        .text(invoice.invoiceNumber, { width: contentWidth, align: "right" })
        .font("Helvetica")
        .fillColor(MUTED)
        .text("Date issued", { width: contentWidth, align: "right" })
        .fillColor(INK)
        .text(formatDate(invoice.issuedAt), {
          width: contentWidth,
          align: "right",
        })
        .fillColor(MUTED)
        .text("Order reference", { width: contentWidth, align: "right" })
        .fillColor(INK)
        .text(invoice.order._id.toString(), {
          width: contentWidth,
          align: "right",
        });

      let y = Math.max(headerBottomLeft, doc.y) + 16;
      horizontalRule(y, ACCENT);
      y += 20;

      // --- billed to / order summary ------------------------------------
      const columnWidth = (contentWidth - 30) / 2;
      const detailsTop = y;

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(INK)
        .text("BILLED TO", left, detailsTop);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(INK)
        .text(invoice.customer.name, left, doc.y + 4, { width: columnWidth })
        .fillColor(MUTED)
        .text(invoice.customer.address, { width: columnWidth });

      if (invoice.customer.addressDetails) {
        doc.text(invoice.customer.addressDetails, { width: columnWidth });
      }

      doc
        .text(invoice.customer.phone, { width: columnWidth })
        .text(invoice.customer.email, { width: columnWidth });

      const billedToBottom = doc.y;

      const summaryX = left + columnWidth + 30;
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(INK)
        .text("ORDER DETAILS", summaryX, detailsTop);

      const summaryRows = [
        ["Order status", invoice.status],
        ["Payment method", invoice.paymentMethod],
        ["Payment status", invoice.isPaid ? "Paid" : "Payment due"],
        ["Shipping region", invoice.order.shippingRegion || "-"],
      ];
      if (invoice.couponCode) {
        summaryRows.push(["Coupon applied", invoice.couponCode]);
      }

      let summaryY = doc.y + 4;
      doc.fontSize(10);
      summaryRows.forEach(([label, value]) => {
        doc
          .font("Helvetica")
          .fillColor(MUTED)
          .text(`${label}:`, summaryX, summaryY, { width: 110 });
        doc
          .font("Helvetica-Bold")
          .fillColor(INK)
          .text(String(value), summaryX + 110, summaryY, {
            width: columnWidth - 110,
          });
        summaryY = doc.y + 2;
      });

      y = Math.max(billedToBottom, summaryY) + 24;

      // --- line items ---------------------------------------------------
      const drawTableHeader = (top) => {
        doc.save().fillColor("#f8fafc").rect(left, top, contentWidth, 22).fill();
        doc.restore();

        doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED);
        doc.text("DESCRIPTION", left + 8 + COLUMNS.description.x, top + 7, {
          width: COLUMNS.description.width,
        });
        doc.text("QTY", left + 8 + COLUMNS.quantity.x, top + 7, {
          width: COLUMNS.quantity.width,
          align: "right",
        });
        doc.text("UNIT PRICE", left + 8 + COLUMNS.unitPrice.x, top + 7, {
          width: COLUMNS.unitPrice.width,
          align: "right",
        });
        doc.text("AMOUNT", left + 8 + COLUMNS.amount.x, top + 7, {
          width: COLUMNS.amount.width,
          align: "right",
        });

        return top + 22;
      };

      y = drawTableHeader(y);

      const bottomLimit = doc.page.height - doc.page.margins.bottom - 60;

      invoice.items.forEach((item) => {
        const description = item.variantLabel
          ? `${item.name}\n${item.variantLabel}`
          : item.name;

        doc.font("Helvetica").fontSize(10);
        const textHeight = doc.heightOfString(description, {
          width: COLUMNS.description.width,
        });
        const rowHeight = Math.max(textHeight + 14, 30);

        // Break before drawing rather than after, so a row is never split
        // across the page boundary.
        if (y + rowHeight > bottomLimit) {
          doc.addPage();
          y = drawTableHeader(doc.page.margins.top);
        }

        doc.fillColor(INK).font("Helvetica").fontSize(10);
        doc.text(item.name, left + 8 + COLUMNS.description.x, y + 7, {
          width: COLUMNS.description.width,
        });
        if (item.variantLabel) {
          doc
            .fillColor(MUTED)
            .fontSize(9)
            .text(item.variantLabel, left + 8 + COLUMNS.description.x, doc.y, {
              width: COLUMNS.description.width,
            });
        }

        doc.fillColor(INK).font("Helvetica").fontSize(10);
        doc.text(String(item.quantity), left + 8 + COLUMNS.quantity.x, y + 7, {
          width: COLUMNS.quantity.width,
          align: "right",
        });
        doc.text(
          formatMoney(item.unitPrice),
          left + 8 + COLUMNS.unitPrice.x,
          y + 7,
          { width: COLUMNS.unitPrice.width, align: "right" }
        );
        doc.font("Helvetica-Bold");
        doc.text(
          formatMoney(item.lineTotal),
          left + 8 + COLUMNS.amount.x,
          y + 7,
          { width: COLUMNS.amount.width, align: "right" }
        );

        y += rowHeight;
        horizontalRule(y);
      });

      // --- totals -------------------------------------------------------
      const totalsRows = [["Subtotal", formatMoney(invoice.totals.subtotal)]];

      if (invoice.totals.productDiscount > 0) {
        totalsRows.push([
          "Product discount",
          `- ${formatMoney(invoice.totals.productDiscount)}`,
        ]);
      }

      totalsRows.push(["Shipping", formatMoney(invoice.totals.shipping)]);

      if (invoice.totals.shippingDiscount > 0) {
        totalsRows.push([
          "Shipping discount",
          `- ${formatMoney(invoice.totals.shippingDiscount)}`,
        ]);
      }

      const totalsHeight = totalsRows.length * 18 + 44;
      if (y + totalsHeight > bottomLimit) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      y += 12;
      const totalsLabelX = left + contentWidth - 260;

      doc.fontSize(10);
      totalsRows.forEach(([label, value]) => {
        doc
          .font("Helvetica")
          .fillColor(MUTED)
          .text(label, totalsLabelX, y, { width: 150 });
        doc
          .font("Helvetica")
          .fillColor(INK)
          .text(value, totalsLabelX + 150, y, { width: 110, align: "right" });
        y += 18;
      });

      y += 4;
      doc
        .save()
        .strokeColor(RULE)
        .lineWidth(1)
        .moveTo(totalsLabelX, y)
        .lineTo(right, y)
        .stroke()
        .restore();
      y += 10;

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(INK)
        .text("Total", totalsLabelX, y, { width: 150 })
        .fillColor(ACCENT)
        .text(formatMoney(invoice.totals.total), totalsLabelX + 150, y, {
          width: 110,
          align: "right",
        });

      y += 34;

      // --- gift note ----------------------------------------------------
      if (invoice.isGift && invoice.giftNote) {
        if (y + 60 > bottomLimit) {
          doc.addPage();
          y = doc.page.margins.top;
        }
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(INK)
          .text("GIFT MESSAGE", left, y);
        doc
          .font("Helvetica-Oblique")
          .fontSize(10)
          .fillColor(MUTED)
          .text(`"${invoice.giftNote}"`, left, doc.y + 4, {
            width: contentWidth - 200,
          });
        y = doc.y + 20;
      }

      // --- footer -------------------------------------------------------
      const footerY = doc.page.height - doc.page.margins.bottom - 30;
      horizontalRule(Math.max(y, footerY - 14));

      const footerText = invoice.store.email
        ? `Thank you for shopping with ${invoice.store.name}. ` +
          `Questions about this invoice? Write to ${invoice.store.email}.`
        : `Thank you for shopping with ${invoice.store.name}.`;

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(MUTED)
        .text(footerText, left, Math.max(y, footerY) + 4, {
          width: contentWidth,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { generateInvoicePdf, formatMoney };

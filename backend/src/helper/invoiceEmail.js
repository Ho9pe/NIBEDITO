// Sends the invoice for a placed order, with the PDF attached.
//
// Deliberately never throws at the caller. Checkout has already taken the
// customer's money commitment and reduced stock by the time this runs, so a
// mail server that is down must not turn a completed order into a failed
// request. The failure is logged and the customer can still download the same
// invoice from the orders page.

const { buildInvoiceData, buildInvoiceFilename } = require("./invoiceHelper");
const { generateInvoicePdf, formatMoney } = require("./invoicePdf");
const { emailWithNodeMailer } = require("./email");
const { clientURL } = require("../secret");
const logger = require("./logger");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildInvoiceEmailHtml = (invoice) => {
  const rows = invoice.items
    .map((item) => {
      const name = escapeHtml(item.name);
      const variant = item.variantLabel
        ? `<br /><span style="color:#64748b;font-size:12px;">${escapeHtml(
            item.variantLabel
          )}</span>`
        : "";
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${name}${variant}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(
            item.lineTotal
          )}</td>
        </tr>`;
    })
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:600px;">
    <h2 style="color:#e11d48;margin-bottom:4px;">Thank you for your order</h2>
    <p style="margin-top:0;color:#64748b;">
      Hello ${escapeHtml(invoice.customer.name)}, your order is confirmed.
      Invoice <strong>${escapeHtml(
        invoice.invoiceNumber
      )}</strong> is attached to this email as a PDF.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <thead>
        <tr>
          <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #e11d48;">Item</th>
          <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #e11d48;">Qty</th>
          <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #e11d48;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table style="width:100%;font-size:14px;margin-top:16px;">
      <tr>
        <td style="color:#64748b;">Subtotal</td>
        <td style="text-align:right;">${formatMoney(
          invoice.totals.subtotal
        )}</td>
      </tr>
      <tr>
        <td style="color:#64748b;">Shipping</td>
        <td style="text-align:right;">${formatMoney(
          invoice.totals.shipping
        )}</td>
      </tr>
      ${
        invoice.totals.discount > 0
          ? `<tr>
        <td style="color:#64748b;">Discount</td>
        <td style="text-align:right;">- ${formatMoney(
          invoice.totals.discount
        )}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="font-weight:bold;padding-top:8px;">Total</td>
        <td style="text-align:right;font-weight:bold;color:#e11d48;padding-top:8px;">${formatMoney(
          invoice.totals.total
        )}</td>
      </tr>
    </table>

    <p style="font-size:14px;color:#64748b;margin-top:20px;">
      Payment method: ${escapeHtml(invoice.paymentMethod)}<br />
      Delivering to: ${escapeHtml(invoice.customer.address)}
    </p>

    <p style="font-size:14px;">
      You can download this invoice again at any time from
      <a href="${clientURL}/my-orders" style="color:#e11d48;">your orders page</a>.
    </p>

    <p style="font-size:12px;color:#94a3b8;">
      ${escapeHtml(invoice.store.name)} &middot; ${escapeHtml(
    invoice.store.email
  )}
    </p>
  </div>`;
};

/**
 * Build and email the invoice for an order.
 *
 * @param {string} orderId
 * @returns {Promise<boolean>} whether the message was handed to the mail server
 */
const sendInvoiceEmail = async (orderId) => {
  try {
    const invoice = await buildInvoiceData(orderId);
    const pdf = await generateInvoicePdf(invoice);

    await emailWithNodeMailer({
      email: invoice.customer.email,
      subject: `Your ${invoice.store.name} invoice ${invoice.invoiceNumber}`,
      html: buildInvoiceEmailHtml(invoice),
      attachments: [
        {
          filename: buildInvoiceFilename(invoice.order),
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    logger.debug(`Invoice ${invoice.invoiceNumber} emailed for order ${orderId}`);
    return true;
  } catch (error) {
    // Always visible: an invoice that silently never arrives is a support
    // ticket nobody can trace. The address is not logged - only the order id,
    // which is enough to find the customer without putting one in the log.
    logger.error(
      `Failed to send invoice email for order ${orderId}:`,
      error.message
    );
    return false;
  }
};

module.exports = { sendInvoiceEmail, buildInvoiceEmailHtml };

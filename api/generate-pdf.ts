import { VercelRequest, VercelResponse } from "@vercel/node";
import { PDFResponse } from "../types/index.js";
import { generatePDF } from "../utils/puppeteer.js";
import { sendEmail } from "../utils/email.js";
import { renderTemplate } from "../utils/template-render.js";
import { validatePDFRequest } from "../utils/validator.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[API] Request received:", req.method);

  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
  const origin = req.headers.origin || "";

  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Validate request
    const validatedData = validatePDFRequest(req.body);
    const { type, data, recipients } = validatedData;

    console.log(
      `[API] Generating ${type} PDF for voucher: ${data.voucherNumber}`,
    );

    // Calculate taxes
    const gstAmount = data.totalAmount * 0.05;
    let tcsAmount = 0;
    let tcsRate = "0%";

    if (data.includeTcs) {
      const TCS_THRESHOLD = 1000000;
      if (data.totalAmount <= TCS_THRESHOLD) {
        tcsAmount = data.totalAmount * 0.05;
        tcsRate = "5%";
      } else {
        const tcsBelowThreshold = TCS_THRESHOLD * 0.05;
        const tcsAboveThreshold = (data.totalAmount - TCS_THRESHOLD) * 0.2;
        tcsAmount = tcsBelowThreshold + tcsAboveThreshold;
        tcsRate = "5% + 20%";
      }
    }

    const grandTotal = data.totalAmount + gstAmount + tcsAmount;

    // Prepare template data
    const templateData = {
      ...data,
      gstAmount,
      tcsAmount,
      tcsRate,
      grandTotal,
      currentYear: new Date().getFullYear(),
    };

    // Render HTML template for PDF
    const html = renderTemplate(type, templateData);

    // Generate PDF
    const pdfBuffer = await generatePDF(html);
    console.log(`[API] PDF generated: ${pdfBuffer.length} bytes`);

    // Prepare email attachment
    const filename = `${type}-${data.voucherNumber || Date.now()}.pdf`;
    const attachment = {
      filename,
      content: pdfBuffer,
      contentType: "application/pdf",
    };

    // Render email template
    const emailHtml = renderTemplate(`${type}-email`, templateData);

    // Send emails
    const emailResults: PDFResponse["emailsSent"] = {
      customer: false,
      agent: false,
    };

    let messageId: string | undefined;

    if (recipients.customer) {
      try {
        const result = await sendEmail({
          to: recipients.customer.email,
          subject: `Booking Confirmation - ${data.voucherNumber}`,
          html: emailHtml,
          attachments: [attachment],
        });
        emailResults.customer = true;
        messageId = result.messageId;
        console.log(
          `[API] Email sent to customer: ${recipients.customer.email}`,
        );
      } catch (error) {
        console.error("[API] Failed to send email to customer:", error);
      }
    }

    if (recipients.agent) {
      try {
        await sendEmail({
          to: recipients.agent.email,
          subject: `Booking Confirmation - ${data.voucherNumber}`,
          html: emailHtml,
          attachments: [attachment],
        });
        emailResults.agent = true;
        console.log(`[API] Email sent to agent: ${recipients.agent.email}`);
      } catch (error) {
        console.error("[API] Failed to send email to agent:", error);
      }
    }

    const response: PDFResponse = {
      success: true,
      emailsSent: emailResults,
      pdfGenerated: true,
      messageId,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[API] Error:", error);

    const response: PDFResponse = {
      success: false,
      emailsSent: { customer: false, agent: false },
      pdfGenerated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
}

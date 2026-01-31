import "dotenv/config";
import express from "express";
import cors from "cors";
import { generatePDF } from "./dist/utils/puppeteer.js";
import { sendEmail } from "./dist/utils/email.js";
import { renderTemplate } from "./dist/utils/template-render.js";
import { validatePDFRequest } from "./dist/utils/validator.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.some((allowed) => origin.includes(allowed))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Cox & Kings PDF Generation Service",
    status: "running",
    version: "1.0.0",
    endpoints: {
      generatePdf: "POST /api/generate-pdf",
      health: "GET /health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main PDF generation endpoint
app.post("/api/generate-pdf", async (req, res) => {
  console.log("[API] Request received");
  console.log("[API] Request type:", req.body.type);
  console.log("[API] Request data keys:", Object.keys(req.body.data || {}));
  console.log("[API] departureDate value:", req.body.data?.departureDate);
  console.log("[API] duration value:", req.body.data?.duration);

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
    const emailResults = {
      customer: false,
      agent: false,
    };

    let messageId;

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

    const response = {
      success: true,
      emailsSent: emailResults,
      pdfGenerated: true,
      messageId,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[API] Error:", error);

    const response = {
      success: false,
      emailsSent: { customer: false, agent: false },
      pdfGenerated: false,
      error: error.message || "Unknown error",
    };

    res.status(500).json(response);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Server] Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("");
  console.log("🚀 Cox & Kings PDF Service");
  console.log("================================");
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoint: http://localhost:${PORT}/api/generate-pdf`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("📧 Gmail configured:", process.env.GMAIL_USER);
  console.log("🔒 CORS origins:", allowedOrigins.join(", "));
  console.log("");
  console.log("Ready to generate PDFs! 📄");
  console.log("================================");
  console.log("");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});

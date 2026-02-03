import express from "express";
import { renderTemplate } from "../../utils/template-render.js";
import { validatePDFRequest } from "../../utils/validator.js";
import {
  prepareTemplateData,
  generatePDFDocument,
} from "../services/pdf.service.js";

const router = express.Router();

/**
 * Main PDF generation endpoint - Returns PDF as base64
 */
router.post("/generate-pdf", async (req, res) => {
  console.log("\n[API] ========== NEW REQUEST ==========");
  console.log("[API] Request type:", req.body.type);
  console.log("[API] Request data keys:", Object.keys(req.body.data || {}));

  // Log important date fields
  console.log("[API] Dates:", {
    departureDate: req.body.data?.departureDate,
    departureStartDate: req.body.data?.departureStartDate,
    departureEndDate: req.body.data?.departureEndDate,
    duration: req.body.data?.duration,
    brandTag: req.body.data?.brandTag
  });

  try {
    // 1. Validate request
    const validatedData = validatePDFRequest(req.body);
    const { type, data } = validatedData;

    const documentId = data.voucherNumber || data.quoteNumber || "unknown";

    // 2. Prepare template data
    const templateData = prepareTemplateData(data);

    // 3. Generate PDF
    const pdfBuffer = await generatePDFDocument(type, templateData);

    // 4. Render email template HTML
    const emailHtml = renderTemplate(`${type}-email`, templateData);

    // 5. Create filename
    const filename = `${type}-${documentId}.pdf`;

    // 6. Convert PDF to base64
    const pdfBase64 = pdfBuffer.toString("base64");

    console.log("[API] ========== REQUEST COMPLETE ==========\n");

    // 7. Return PDF and email HTML to main app
    res.status(200).json({
      success: true,
      pdf: pdfBase64,
      emailHtml: emailHtml,
      filename: filename,
      metadata: {
        type: type,
        documentId: documentId,
        size: pdfBuffer.length,
        tourTitle: data.tourTitle || "Travel Package",
        customerName: data.customerName || "Customer",
        agencyName: data.agencyName || "Agent",
      },
    });
  } catch (error) {
    console.error("[API] ✗ Error:", error.message);
    console.error("[API] ========== REQUEST FAILED ==========\n");

    res.status(500).json({
      success: false,
      error: error.message || "Unknown error",
    });
  }
});

export default router;

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
    brandTag: req.body.data?.brandTag,
  });

  // Log inclusions data
  console.log("[API] Inclusions data check:", {
    hasInclusions: !!req.body.data?.inclusions,
    hasExclusions: !!req.body.data?.exclusions,
    hasTourInclusions: !!req.body.data?.tourInclusions,
    tourInclusionsValue: req.body.data?.tourInclusions,
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

    // 4. Create filename with customer name
    const customerName = (data.customerName || "Customer")
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .toLowerCase();
    const filename = `${customerName}-${documentId}.pdf`;

    // 5. Convert PDF to base64
    const pdfBase64 = pdfBuffer.toString("base64");

    console.log("[API] ========== REQUEST COMPLETE ==========\n");

    // 7. Return PDF and email HTML to main app
    res.status(200).json({
      success: true,
      pdf: pdfBase64,
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

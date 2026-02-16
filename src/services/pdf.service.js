import { generatePDF } from "../../utils/puppeteer.js";
import { renderTemplate } from "../../utils/template-render.js";
import { loadLogoBase64 } from "./logo.service.js";
import { calculateTaxes } from "./tax.service.js";
import { transformImageUrls } from "./image.service.js";

/**
 * Prepare template data with all required fields
 */
export function prepareTemplateData(data) {
  // Calculate taxes
  const { gstAmount, tcsAmount, tcsRate, grandTotal } = calculateTaxes(
    data.totalAmount,
    data.includeTcs,
  );

  // Load logo
  const COX_KINGS_LOGO_BASE64 = loadLogoBase64();

  // Prepare base template data
  let templateData = {
    ...data,
    gstAmount,
    tcsAmount,
    tcsRate,
    grandTotal,
    COX_KINGS_LOGO_BASE64,
    currentYear: new Date().getFullYear(),
  };

  // Transform image URLs
  templateData = transformImageUrls(templateData);

  // Log agency information
  console.log("[PDF] Agency Information:", {
    agencyName: templateData.agencyName || "NOT PROVIDED",
    agencyEmail: templateData.agencyEmail || "NOT PROVIDED",
    agencyPhone: templateData.agencyPhone || "NOT PROVIDED",
  });

  // Log inclusions/exclusions data
  console.log("[PDF] Inclusions/Exclusions Data:", {
    inclusions: templateData.inclusions
      ? `Array(${templateData.inclusions.length})`
      : "NOT PROVIDED",
    exclusions: templateData.exclusions
      ? `Array(${templateData.exclusions.length})`
      : "NOT PROVIDED",
    tourInclusions: templateData.tourInclusions || "NOT PROVIDED",
  });

  // Detailed tourInclusions logging
  if (templateData.tourInclusions) {
    console.log(
      "[PDF] tourInclusions details:",
      JSON.stringify(templateData.tourInclusions, null, 2),
    );
  } else {
    console.log("[PDF] ⚠️ tourInclusions is missing from the data");
  }

  console.log(
    `[PDF] ✓ Template data prepared with ${Object.keys(templateData).length} keys`,
  );

  return templateData;
}

/**
 * Generate PDF from template data
 */
export async function generatePDFDocument(type, templateData) {
  console.log(`[PDF] Generating ${type} PDF...`);

  // Render HTML template
  const html = renderTemplate(type, templateData);

  // Generate PDF
  const pdfBuffer = await generatePDF(html);

  console.log(
    `[PDF] ✓ PDF generated: ${(pdfBuffer.length / 1024).toFixed(2)} KB`,
  );

  return pdfBuffer;
}

/**
 * Create PDF attachment object
 */
export function createPDFAttachment(type, voucherNumber, pdfBuffer) {
  const filename = `${type}-${voucherNumber || Date.now()}.pdf`;

  return {
    filename,
    content: pdfBuffer,
    contentType: "application/pdf",
  };
}

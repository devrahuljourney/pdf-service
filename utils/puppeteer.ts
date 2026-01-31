import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function generatePDF(html: string): Promise<Buffer> {
  console.log("[Puppeteer] Launching browser...");

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    console.log("[Puppeteer] Setting page content...");

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log("[Puppeteer] Generating PDF...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log(`[Puppeteer] PDF generated: ${pdf.length} bytes`);
    return Buffer.from(pdf);
  } finally {
    await browser.close();
    console.log("[Puppeteer] Browser closed");
  }
}

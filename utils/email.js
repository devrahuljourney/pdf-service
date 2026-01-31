import nodemailer from "nodemailer";

export async function sendEmail(options) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD not configured");
  }

  try {
    console.log("[Email] Starting email send process...");

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 60000, // 60 seconds for large attachments
    });

    // Prepare email options
    const mailOptions = {
      from: `Cox & Kings <${gmailUser}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    };

    console.log(`[Email] Sending to: ${mailOptions.to}`);
    console.log(`[Email] Subject: ${options.subject}`);
    console.log(`[Email] Attachments: ${options.attachments?.length || 0}`);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`[Email] ✓ Email sent successfully`);
    console.log(`[Email] Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] ✗ Error sending email:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

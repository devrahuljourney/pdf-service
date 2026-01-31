import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  console.log("[Email] Configuring transporter...");

  // Debug: Check if credentials are available
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Error(
      "Gmail credentials not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD in .env file",
    );
  }

  console.log(`[Email] Using account: ${gmailUser}`);
  console.log(`[Email] Password length: ${gmailPass.length} characters`);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const recipients = Array.isArray(options.to)
    ? options.to.join(", ")
    : options.to;
  console.log(`[Email] Sending to: ${recipients}`);

  const mailOptions = {
    from: `Cox & Kings <${process.env.GMAIL_USER}>`,
    to: recipients,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Sent successfully: ${info.messageId}`);

  return { success: true, messageId: info.messageId };
}

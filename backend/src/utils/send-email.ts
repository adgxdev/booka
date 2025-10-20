import nodemailer from 'nodemailer';

const orgName = 'Booka';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCustomEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  console.log('[Email] Attempting to send email with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  });

  try {
    const result = await transporter.sendMail({
      from: `"${orgName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('[Email] Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw error;
  }
}

// Example usage for patient password email:
export function getAdminWelcomeEmail({ full_name, email, password }: { full_name: string; email: string; password: string }) {
  const subject = `Welcome to ${orgName}`;
  const text = `Hello ${full_name},\n\nYou have been registered as an admin on ${orgName}.\n\nYour login email: ${email}\nYour temporary password: ${password}\n\nPlease log in and change your password as soon as possible.\n\nThank you!`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Welcome to ${orgName}</h2>
      <p>Hello <strong>${full_name}</strong>,</p>
      <p>You have been registered as an admin on <b>${orgName}</b>.</p>
      <p><b>Your login email:</b> ${email}<br/>
         <b>Your temporary password:</b> <span style="font-family:monospace;">${password}</span></p>
      <p>Please log in and change your password as soon as possible.</p>
      <br/>
      <p>Thank you!</p>
    </div>
  `;
  return { subject, text, html };
} 
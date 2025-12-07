// import nodemailer from 'nodemailer';
import { config } from "dotenv";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);



config();

const orgName = 'Booka';

const smtpPort = Number(process.env.SMTP_PORT);
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: smtpPort,
//   secure: smtpPort === 465, // enforce TLS when using port 465
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

export async function sendCustomEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log('[Email] Attempting to send email with config:', {
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    user: process.env.SMTP_USER,
  });

  try {
    // const result = await transporter.sendMail({
    //   from: `"${orgName}" <${process.env.SMTP_USER}>`,
    //   to,
    //   subject,
    //   text,
    //   html,
    // });
    // console.log('[Email] Email sent successfully:', result.messageId);

    const result = await resend.emails.send({
      from: `"${orgName}" <${process.env.SMTP_USER}>`,
      to: [to],
      subject,
      html,
    });


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
export function waitlistEmail({ email, id }: { email: string, id: string }) {
  const subject = `Welcome to ${orgName}`;
  const text = `Hello\n\nYou have been added to waitlist on ${orgName}.\n\nYour login email: ${email}\n\nPlease fill out this form to secure your spot.\n\nThank you!`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Welcome to ${orgName}</h2>
      <p>Hello,</p>
      <p>You have been added to the waitlist on <b>${orgName}</b>.</p>
      
      <p>We need one more favour from you</p></br>
      <p> Please fill out this <a href="https://forms.gle/owgimo7N3eJS4x3t7"> waitlist form </a> for extra waitlist benefits</p>
      <br/>
      <a href="${process.env.CLIENT_ORIGIN}/referrals/${id}"> Track your referrals </a>
      <p>Thank you!</p>
    </div>
  `;
  return { subject, text, html };
} 
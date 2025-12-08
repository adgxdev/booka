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


    const result = await resend.emails.send({
      from: `"${orgName}" <${process.env.SMTP_USER}>`,
      to: [to],
      subject,
      html,
    });
    console.log('[Email] Email sent successfully:', result.data?.id);

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
  console.log(`waitlist link sent: ${id}`);
  const subject = `Welcome to ${orgName}`;
  const text = `Hello\n\nYou have been added to waitlist on ${orgName}.\n\nYour login email: ${email}\n\nPlease fill out this form to secure your spot.\n\nThank you!`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Booka Waitlist</title>
      <style>
        body {
          background-color: #f4f4f4;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .content p {
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #764ba2;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Booka Waitlist! 🎉</h1>
        </div>
        <div class="content">
          <p>You're officially on the Booka waitlist and we're excited to have you with us!</p>

          <p>To complete your registration and help us understand you better, please fill out this short form:</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScbLWJNyqLpvAKy1qgLrT91qw0u1Pn8B4SEK8W-AlNNQgcbqw/viewform" >Fill Out Form</a>

          <p>Join the pre-launch community for information that will be dropping:</p>
          <a href="https://chat.whatsapp.com/D3DN4fPrFa6HZGiF6Sh7Td" >Join WhatsApp Community</a>

          <p>Track your referrals and rewards:</p>
          <a href="${process.env.CLIENT_ORIGIN}/referrals/${id}" >Track Referral</a>

          <p>Lastly, reply with the secret code you see after submitting the form to claim instant Booka Points which is redeemable after launch.</p>

          <p><strong>Team Booka</strong><br>Welcome to the future of book purchasing in African universities.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Booka. All rights reserved.</p>
        </div>
      </div>
    </body>
   </html>
  `;
  return { subject, text, html };
} 
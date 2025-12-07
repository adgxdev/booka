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
  const subject = `Welcome to ${orgName}`;
  const text = `Hello\n\nYou have been added to waitlist on ${orgName}.\n\nYour login email: ${email}\n\nPlease fill out this form to secure your spot.\n\nThank you!`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Booka Waitlist</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
        }

        h1 {
          color: #111;
          font-size: 24px;
          margin-bottom: 16px;
        }

        p {
          color: #333;
          line-height: 1.6;
          font-size: 15px;
          margin-bottom: 16px;
        }

        .btn {
          display: inline-block;
          background-color: #0057ff;
          color: #ffffff !important;
          padding: 12px 18px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
          font-size: 15px;
        }

        .section-title {
          font-weight: bold;
          font-size: 18px;
          margin-top: 30px;
        }

        ul {
          padding-left: 18px;
          margin-top: 12px;
          color: #333;
        }

        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #666;
          text-align: center;
        }
      </style>
      </head>

      <body>
        <div class="container">

          <h1>Welcome to the ${orgName} Waitlist! 🎉</h1>

          <p>You’re officially on the <strong>Booka waitlist</strong>, and we’re excited to have you with us!</p>

          <p>
            To complete your registration and help us understand you better,
            please fill out this short form:
          </p>

          <a class="btn" href="https://docs.google.com/forms/d/e/1FAIpQLScbLWJNyqLpvAKy1qgLrT91qw0u1Pn8B4SEK8W-AlNNQgcbqw/viewform" target="_blank">
            Fill Out the Form
          </a>

          <p class="section-title">Join the Pre-Launch Community 👇🏼</p>

          <a class="btn" href="https://chat.whatsapp.com/D3DN4fPrFa6HZGiF6Sh7Td" target="_blank" style="background:#25D366;">
            Join WhatsApp Community
          </a>
           <a class="btn" href="${process.env.CLIENT_ORIGIN}/referrals/${id}"> Track your referrals </a>

          <p class="section-title">📢 BOOKA EARLY REFERRAL PROGRAM — How It Works</p>

          <p>Earn exclusive rewards just by inviting your friends!</p>

          <p><strong>How to earn rewards:</strong></p>
          <ul>
            <li>Join the Booka waitlist → you receive your unique referral link.</li>
            <li>Share your link privately or publicly (WhatsApp groups, friends, classmates).</li>
            <li>Once <strong>5 real students</strong> sign up using your link, you instantly unlock:
              <strong>Early Access + ₦500 Book Credit</strong> (redeemable after launch).
            </li>
          </ul>

          <p class="section-title">Bonus Reward Levels 🎁</p>

          <ul>
            <li><strong>15 referrals</strong> → Free book delivery or higher book discounts + ₦1,000 Book Credit</li>
            <li><strong>30 referrals</strong> → Become a Booka Campus Brand Ambassador + exclusive merch + early opportunities</li>
          </ul>

          <p class="section-title">⚠ Referral Rules ⚠</p>

          <ul>
            <li>Only real student signups count (no duplicates, fake emails, or fake names).</li>
            <li>Referrals must complete the full waitlist form for it to count.</li>
            <li>The Top 20 referrers get a chance to become Booka Campus Ambassadors.</li>
          </ul>

          <p>
            Lastly, reply with the <strong>secret code</strong> you see after submitting the form
            to claim instant Booka Points (redeemable after launch).
          </p>

          <p>See you at the top ✊🏼</p>

          <div class="footer">
            © 2025 Booka — All Rights Reserved.
          </div>

        </div>
      </body>
    </html>

  `;
  return { subject, text, html };
} 
const dns = require("dns");
const nodemailer = require("nodemailer");

// Force IPv4 DNS resolution across Node to prevent ENETUNREACH on cloud hosts without IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Clean credentials from env
const cleanEmailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
const cleanEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

let transporter = null;

if (cleanEmailUser && cleanEmailPass) {
  console.log(`Email service: Initializing — user=${cleanEmailUser}`);
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // Explicitly force IPv4 connection to prevent IPv6 ENETUNREACH on Render
    auth: {
      user: cleanEmailUser,
      pass: cleanEmailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  // Non-blocking verify — log result but don't halt startup
  transporter.verify()
    .then(() => console.log("✅ Email service: Gmail SMTP verified. Ready to send."))
    .catch((err) => {
      console.error("⚠️ Email verify failed (emails may still send):", err.message);
    });
} else {
  console.warn(`⚠️ Email service DISABLED — EMAIL_USER=${cleanEmailUser || "MISSING"}, EMAIL_PASS=${cleanEmailPass ? "SET" : "MISSING"}`);
}

const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    console.warn(`⚠️ Email skipped to ${to}: transporter not initialized.`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"BankLedger" <${cleanEmailUser}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`📧 Email sent to ${to} — MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email FAILED to ${to}:`, err.message);
    throw err;
  }
};

function maskAccountId(id) {
  if (!id) return "••••";
  const str = String(id);
  return `••••${str.slice(-4)}`;
}

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to BankLedger — Your Account is Ready";
  const text = `Hello ${name},\n\nThank you for choosing BankLedger. Your online banking profile has been created with institutional-grade double-entry ledger protection.\n\nBest regards,\nBankLedger Operations Team`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Bank<span style="color: #38bdf8;">Ledger</span></h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Accounts • Transactions • Trust</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="font-size: 16px; margin-top: 0; color: #0f172a;">Welcome, ${name}!</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">Your BankLedger customer profile has been registered. You now have full access to real-time fund transfers, atomic ACID settlement, and immutable double-entry ledger records.</p>
        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 24px;">This is an automated operational notification. Never share your security credentials.</p>
      </div>
    </div>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, senderName, amount, recipientName, toAccountId, txRef) {
  const maskedTo = maskAccountId(toAccountId);
  const formattedAmount = Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const subject = `Debit Alert: ₹${formattedAmount} sent to ${recipientName || "Recipient"}`;
  const text = `Hello ${senderName},\n\nYour account has been debited with ₹${formattedAmount} sent to ${recipientName || "Recipient"} (${maskedTo}).\nReference ID: ${txRef || "N/A"}\n\nBankLedger Core`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 800;">Bank<span style="color: #38bdf8;">Ledger</span></h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Debit Advice • Immediate Settlement</p>
      </div>
      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #dc2626; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Funds Transferred</span>
          <div style="font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 8px;">- ₹ ${formattedAmount}</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Paid To:</td><td style="padding: 10px 0; text-align: right; font-weight: 700;">${recipientName || "Verified Beneficiary"}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Beneficiary Account:</td><td style="padding: 10px 0; text-align: right; font-family: monospace;">${maskedTo}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Transaction Ref:</td><td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; color: #0284c7;">${txRef || "N/A"}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b;">Settlement Mode:</td><td style="padding: 10px 0; text-align: right; font-weight: 600; color: #059669;">ACID Double-Entry Verified</td></tr>
        </table>
        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 20px; line-height: 1.5;">If you did not initiate this transaction, please contact BankLedger fraud control immediately.</p>
      </div>
    </div>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendCreditAlertEmail(userEmail, recipientName, amount, senderName, fromAccountId, txRef) {
  const maskedFrom = maskAccountId(fromAccountId);
  const formattedAmount = Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const subject = `Credit Alert: ₹${formattedAmount} received from ${senderName || "Sender"}`;
  const text = `Hello ${recipientName},\n\nYour account has been credited with ₹${formattedAmount} received from ${senderName || "Sender"} (${maskedFrom}).\nReference ID: ${txRef || "N/A"}\n\nBankLedger Core`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 800;">Bank<span style="color: #38bdf8;">Ledger</span></h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Credit Advice • Funds Received</p>
      </div>
      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Deposit Successful</span>
          <div style="font-size: 32px; font-weight: 800; color: #15803d; margin-top: 8px;">+ ₹ ${formattedAmount}</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Received From:</td><td style="padding: 10px 0; text-align: right; font-weight: 700;">${senderName || "BankLedger Member"}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Sender Account:</td><td style="padding: 10px 0; text-align: right; font-family: monospace;">${maskedFrom}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Transaction Ref:</td><td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; color: #0284c7;">${txRef || "N/A"}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b;">Availability:</td><td style="padding: 10px 0; text-align: right; font-weight: 600; color: #059669;">Immediately Available</td></tr>
        </table>
        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 20px; line-height: 1.5;">This credit is recorded immutably on your BankLedger account statement.</p>
      </div>
    </div>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const maskedTo = maskAccountId(toAccount);
  const subject = "Transaction Notice: Transfer Not Completed";
  const text = `Hello ${name},\n\nWe could not complete your transfer of ₹${amount} to account ${maskedTo}. No funds have been debited.\n\nBankLedger Operations`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
      <div style="background: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 800;">Bank<span style="color: #38bdf8;">Ledger</span></h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #dc2626; font-size: 16px; margin-top: 0;">Transaction Not Completed</h2>
        <p style="font-size: 13px; color: #475569;">Your transfer of <strong>₹ ${Number(amount).toLocaleString("en-IN")}</strong> to account <code>${maskedTo}</code> could not be settled. Your ledger balance remains unchanged.</p>
      </div>
    </div>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransferOtpEmail(userEmail, name, otp, amount, recipientName, toAccountId) {
  const maskedTo = maskAccountId(toAccountId);
  const formattedAmount = Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const subject = `BankLedger Security: OTP for ₹${formattedAmount} Transfer`;
  const text = `Hello ${name},\n\nYour one-time authorization code for sending ₹${formattedAmount} to ${recipientName || "Recipient"} (${maskedTo}) is:\n\n${otp}\n\nValid for 5 minutes. Do not share.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 800; color: #0f172a;">Bank<span style="color: #0284c7;">Ledger</span></span>
        <span style="display: block; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-top: 2px;">High-Value Transaction Authorization</span>
      </div>
      <p style="font-size: 13px; color: #334155; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 13px; color: #334155; line-height: 1.5;">A high-value transfer of <strong>₹ ${formattedAmount}</strong> to <strong>${recipientName || "Recipient"}</strong> (Account ${maskedTo}) requires your authorization.</p>
      <div style="background: #0f172a; padding: 18px 24px; border-radius: 10px; font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; text-align: center; margin: 20px 0;">${otp}</div>
      <p style="font-size: 12px; color: #64748b;">This code expires in <strong>5 minutes</strong>. Never disclose this code to anyone.</p>
    </div>`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  maskAccountId,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendCreditAlertEmail,
  sendTransactionFailureEmail,
  sendTransferOtpEmail,
};

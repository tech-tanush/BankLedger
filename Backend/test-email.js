require("dotenv").config();
const nodemailer = require("nodemailer");

async function runDirectDiagnostics() {
  console.log("\n=============================================");
  console.log("🔍 BankLedger Email Service Direct Diagnostics");
  console.log("=============================================");

  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const rawPass = process.env.EMAIL_PASS || "";
  const cleanPass = rawPass.replace(/\s+/g, "");

  console.log(`1. EMAIL_USER: ${user || "(MISSING)"}`);
  console.log(`2. EMAIL_PASS: ${cleanPass ? `[${cleanPass.length} characters loaded]` : "(MISSING)"}`);

  if (!user || !cleanPass) {
    console.error("\n❌ Configuration Error: EMAIL_USER or EMAIL_PASS is missing in Backend/.env");
    process.exit(1);
  }

  if (cleanPass.length !== 16) {
    console.warn(`⚠️ Warning: Google App Passwords are normally exactly 16 characters. Yours has ${cleanPass.length} characters.`);
  }

  console.log("\n3. Testing connection to Gmail SMTP (smtp.gmail.com:465)...");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: cleanPass,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP Authentication Successful! Google accepted your credentials.");
  } catch (verifyError) {
    console.error("\n❌ SMTP Authentication Failed!");
    console.error("Error Code:", verifyError.code);
    console.error("Error Message:", verifyError.message);
    if (verifyError.message.includes("535") || verifyError.message.includes("BadCredentials")) {
      console.log("\n👉 Reason: Google rejected your App Password.");
      console.log("1. Ensure 2-Step Verification is turned ON for " + user);
      console.log("2. Generate a fresh 16-character code at https://myaccount.google.com/apppasswords");
      console.log("3. Put the new 16-character code into EMAIL_PASS in Backend/.env");
    }
    process.exit(1);
  }

  const targetRecipient = process.argv[2] || user;
  console.log(`\n4. Dispatching test email to: ${targetRecipient}...`);

  try {
    const info = await transporter.sendMail({
      from: `"BankLedger" <${user}>`,
      to: targetRecipient,
      subject: "BankLedger Core — Live Email Test",
      text: "Hello,\n\nYour BankLedger email notification service is verified and fully operational.\n\nBest regards,\nBankLedger Operations",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">BankLedger Live Test</h2>
          <p style="color: #334155;">Your email notification service has successfully connected to Gmail SMTP.</p>
          <div style="padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-weight: bold;">
            ✅ Email delivery verified at ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `,
    });

    console.log("✅ Email successfully sent!");
    console.log("Message ID:", info.messageId);
    console.log("\n📬 Please check your Gmail Inbox AND your SPAM/Junk folder now.\n");
  } catch (sendError) {
    console.error("\n❌ Failed to dispatch email:");
    console.error(sendError);
  }
}

runDirectDiagnostics();

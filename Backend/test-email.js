require("dotenv").config();
const { sendRegistrationEmail } = require("./src/services/email.service");

async function testEmail() {
  const targetEmail = process.argv[2] || process.env.EMAIL_USER;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("\n❌ Missing configuration in .env!");
    console.log("Please ensure both EMAIL_USER and EMAIL_PASS are set in Backend/.env\n");
    process.exit(1);
  }

  console.log(`\n📧 Testing Gmail App Password connection...`);
  console.log(`- From: ${process.env.EMAIL_USER}`);
  console.log(`- To:   ${targetEmail}`);

  try {
    await sendRegistrationEmail(targetEmail, "BankLedger Admin");
    console.log("✅ Success! Check your inbox for the welcome email.\n");
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
}

testEmail();


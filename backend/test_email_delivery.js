const emailService = require('./services/emailService');
require('dotenv').config();

async function runEmailTest() {
  console.log('=========================================================');
  console.log('📧 RIDESHARE EMAIL DELIVERY & SMTP DIAGNOSTIC SUITE');
  console.log('=========================================================');

  const targetEmail = process.argv[2] || process.env.EMAIL_USER || 'admin@rideshare.com';
  console.log(`Testing email delivery to target address: "${targetEmail}"\n`);

  console.log('--- STEP 1: VERIFYING SMTP CONFIGURATION ---');
  const config = await emailService.verifyEmailConfig();
  console.log('Configured:', config.configured ? '✅ YES' : '❌ NO');
  console.log('Delivery Mode:', config.mode);
  console.log('Email Account:', config.user || 'None (Using Ethereal Fallback)');
  console.log('Status Message:', config.message);
  console.log('---------------------------------------------------\n');

  if (!config.configured) {
    console.log('⚠️ WARNING: EMAIL_USER or EMAIL_PASS is not set in backend/.env.');
    console.log('The system will generate an Ethereal web preview URL, but real emails will NOT be delivered to user inboxes.');
    console.log('To send real emails to real inboxes, please set EMAIL_USER and EMAIL_PASS in backend/.env.');
  }

  console.log('\n--- STEP 2: DISPATCHING TEST EMAIL ---');
  try {
    const info = await emailService.sendTestEmail(targetEmail);
    console.log('\n✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId || 'N/A');
    if (info.response) {
      console.log('SMTP Response:', info.response);
    }
  } catch (err) {
    console.error('\n❌ EMAIL DELIVERY FAILED:');
    console.error(err.message);
    if (err.code === 'EAUTH') {
      console.error('\n🔒 AUTHENTICATION ERROR DETECTED:');
      console.error('If using Gmail: Ensure 2-Step Verification is ON and you are using a 16-character App Password from https://myaccount.google.com/apppasswords.');
      console.error('DO NOT use your normal Gmail login password.');
    }
  }
}

runEmailTest();

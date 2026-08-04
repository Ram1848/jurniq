const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

/**
 * Initializes and verifies Nodemailer SMTP transporter
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  let host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  let port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587');
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  // Auto-detect Gmail configuration
  if (emailUser && emailUser.toLowerCase().endsWith('@gmail.com') && !host) {
    host = 'smtp.gmail.com';
  }

  if (emailUser && emailPass) {
    logger.info(`Configuring Nodemailer Transporter with SMTP Host: ${host || 'smtp.gmail.com'}, Port: ${port}, User: ${emailUser}`);
    
    transporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: port,
      secure: isSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false // Prevents local self-signed SSL cert errors
      }
    });

    // Verify SMTP connection and credentials
    try {
      await transporter.verify();
      logger.info(`✅ SMTP Transporter connected & verified successfully for ${emailUser}!`);
    } catch (verifyErr) {
      logger.error(`❌ SMTP Transporter Verification Failed: ${verifyErr.message}`);
      if (emailUser.toLowerCase().endsWith('@gmail.com')) {
        logger.error('⚠️ Note for Gmail users: Ensure you are using a 16-character Google App Password (NOT your normal Gmail password) and that 2-Step Verification is enabled.');
      }
    }
  } else {
    logger.warn('⚠️ No EMAIL_USER/EMAIL_PASS configured in backend/.env.');
    logger.warn('Falling back to temporary Ethereal.email test server for development logs.');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Ethereal test email account created: ${testAccount.user}`);
    } catch (err) {
      logger.warn(`Could not create Ethereal test account: ${err.message}. Using console JSON transport.`);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
};

/**
 * Diagnostic method to test SMTP configuration status
 */
const verifyEmailConfig = async () => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  
  if (!emailUser || !emailPass) {
    return {
      configured: false,
      mode: 'Ethereal Sandbox (Real emails will NOT be delivered to inbox)',
      user: null,
      message: 'EMAIL_USER and EMAIL_PASS environment variables are missing in backend/.env'
    };
  }

  try {
    const activeTransporter = await getTransporter();
    await activeTransporter.verify();
    return {
      configured: true,
      mode: 'Real SMTP Delivery',
      user: emailUser,
      message: 'SMTP credentials verified successfully.'
    };
  } catch (err) {
    return {
      configured: false,
      mode: 'SMTP Error',
      user: emailUser,
      message: `SMTP Verification Error: ${err.message}`
    };
  }
};

/**
 * Send email helper function with detailed logging
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    logger.info(`Preparing email dispatch to: ${to} | Subject: "${subject}"`);
    const activeTransporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || '"RideShare Platform" <noreply@rideshare.com>';

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Generate clean plain-text fallback
    };

    const info = await activeTransporter.sendMail(mailOptions);

    logger.info(`✅ Email dispatched successfully to: ${to}`);
    logger.info(`Message ID: ${info.messageId || 'N/A'}`);
    if (info.response) {
      logger.info(`SMTP Response: ${info.response}`);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Ethereal Web Preview URL: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    logger.error(`❌ Email sending failed for target address [${to}]: ${error.message}`);
    
    // EAUTH error handling
    if (error.code === 'EAUTH') {
      logger.error('Authentication Error (EAUTH): Check EMAIL_USER and EMAIL_PASS in backend/.env.');
      if (process.env.EMAIL_USER?.toLowerCase().endsWith('@gmail.com')) {
        logger.error('GMAIL SMTP REQUIREMENT: Ensure you generated a 16-character App Password from https://myaccount.google.com/apppasswords');
      }
    }

    throw error;
  }
};

const getEmailTemplate = (title, message, rideDetails = null) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
      <div style="background: #000000; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Ride<span style="color: #6366f1;">Share</span></h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #111827; margin-top: 0;">${title}</h2>
        <p style="color: #4b5563; line-height: 1.6;">${message}</p>
        
        ${rideDetails ? `
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 16px;">Ride Details</h3>
          <p style="margin: 8px 0; color: #4b5563;"><strong>Pickup:</strong> ${rideDetails.pickup}</p>
          <p style="margin: 8px 0; color: #4b5563;"><strong>Drop-off:</strong> ${rideDetails.drop}</p>
          ${rideDetails.fare ? `<p style="margin: 8px 0; color: #4b5563;"><strong>Fare:</strong> ₹${rideDetails.fare}</p>` : ''}
        </div>
        ` : ''}
        
      </div>
      <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">© 2026 RideShare. All rights reserved.</p>
      </div>
    </div>
  `;
};

const sendOTPEmail = async (toEmail, userName, otpCode) => {
  logger.info(`Constructing OTP email for User: "${userName}" at Target Email: "${toEmail}" with OTP: ${otpCode}`);
  const subject = 'RideShare Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
      <div style="background: #000000; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Ride<span style="color: #6366f1;">Share</span></h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #111827; font-size: 16px; margin-top: 0;">Hello ${userName || 'User'},</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Your OTP for resetting your RideShare account password is:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #6366f1;">${otpCode}</span>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">This OTP is valid for <strong>5 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">If you did not request this password reset, please ignore this email.</p>
        <p style="color: #111827; font-size: 14px; font-weight: bold; margin-top: 24px; margin-bottom: 0;">Regards,<br>RideShare Team</p>
      </div>
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">© 2026 RideShare. All rights reserved.</p>
      </div>
    </div>
  `;
  const text = `Hello ${userName || 'User'},\n\nYour OTP for resetting your RideShare account password is: ${otpCode}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\nRegards,\nRideShare Team`;

  return await sendEmail(toEmail, subject, html, text);
};

const sendTestEmail = async (toEmail) => {
  const subject = 'RideShare SMTP Test Email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #eaeaea;">
      <h2 style="color: #6366f1;">RideShare SMTP Delivery Test</h2>
      <p style="color: #4b5563;">Congratulations! Your Nodemailer SMTP setup is working correctly and delivering emails to real inboxes.</p>
      <p style="color: #9ca3af; font-size: 13px;">Sent at: ${new Date().toISOString()}</p>
    </div>
  `;
  return await sendEmail(toEmail, subject, html);
};

module.exports = {
  sendEmail,
  getEmailTemplate,
  sendOTPEmail,
  sendTestEmail,
  verifyEmailConfig
};

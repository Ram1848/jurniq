const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Using ethereal email for testing
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || 'elisha.schmeler48@ethereal.email',
    pass: process.env.EMAIL_PASS || 'd1bA67vXJ1yNtbPq85'
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"RideShare Platform" <noreply@rideshare.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
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
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">© 2024 RideShare. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  getEmailTemplate
};

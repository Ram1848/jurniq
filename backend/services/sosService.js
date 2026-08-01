const { pool } = require('../config/db');
const emailService = require('./emailService');
const { getIo } = require('../socket/socketServer');
const logger = require('../utils/logger');

/**
 * Triggers an Emergency SOS event.
 */
const triggerSOS = async (ride_id, user_id, latitude, longitude) => {
  try {
    // 1. Get ride details to find the driver
    const [rides] = await pool.query(
      `SELECT r.*, u.full_name as rider_name, u.phone as rider_phone,
              d.user_id as driver_user_id, du.full_name as driver_name, du.phone as driver_phone,
              dr.vehicle_number, dr.vehicle_type
       FROM rides r
       JOIN users u ON r.rider_id = u.user_id
       LEFT JOIN drivers dr ON r.driver_id = dr.user_id
       LEFT JOIN users du ON dr.user_id = du.user_id
       WHERE r.ride_id = ?`,
      [ride_id]
    );

    if (rides.length === 0) {
      throw new Error('Ride not found');
    }

    const ride = rides[0];
    const driver_id = ride.driver_user_id || 0; // 0 if no driver yet (edge case)

    // 2. Insert SOS Event into database
    const [result] = await pool.query(
      `INSERT INTO emergency_events (ride_id, user_id, driver_id, latitude, longitude, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [ride_id, user_id, driver_id, latitude, longitude]
    );

    const event_id = result.insertId;

    // 3. Fetch user's emergency contacts
    const [contacts] = await pool.query(
      `SELECT * FROM emergency_contacts WHERE user_id = ?`,
      [user_id]
    );

    // 4. Send Emails to emergency contacts
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    for (const contact of contacts) {
      if (contact.email) {
        const emailHtml = emailService.getEmailTemplate(
          '🚨 EMERGENCY SOS ALERT 🚨',
          `URGENT: ${ride.rider_name} has triggered an SOS alert during a ride.`,
          {
            'Rider Name': ride.rider_name,
            'Rider Phone': ride.rider_phone,
            'Driver Name': ride.driver_name || 'N/A',
            'Driver Phone': ride.driver_phone || 'N/A',
            'Vehicle': ride.vehicle_number ? `${ride.vehicle_type} (${ride.vehicle_number})` : 'N/A',
            'Location': `<a href="${mapLink}">View on Google Maps</a>`,
            'Time': new Date().toLocaleString()
          }
        );

        emailService.sendEmail(
          contact.email, 
          `🚨 URGENT SOS ALERT: ${ride.rider_name} needs help!`, 
          emailHtml
        ).catch(err => logger.error(`Failed to send SOS email to ${contact.email}: ${err.message}`));
      }
    }

    // 5. Emit Socket.IO event to Admins
    try {
      const io = getIo();
      io.emit('sos_alert', {
        event_id,
        ride_id,
        user_id,
        rider_name: ride.rider_name,
        driver_name: ride.driver_name,
        latitude,
        longitude,
        timestamp: new Date()
      });
    } catch (err) {
      logger.error(`Socket.IO not initialized or failed to emit sos_alert: ${err.message}`);
    }

    return { event_id, message: 'SOS Alert triggered successfully' };

  } catch (error) {
    logger.error(`Error in triggerSOS: ${error.message}`);
    throw error;
  }
};

/**
 * Resolves an active SOS alert.
 */
const resolveSOS = async (event_id) => {
  const [result] = await pool.query(
    `UPDATE emergency_events SET status = 'resolved' WHERE event_id = ?`,
    [event_id]
  );
  if (result.affectedRows === 0) {
    throw new Error('SOS event not found');
  }
  return { success: true };
};

/**
 * Gets all active SOS alerts for Admin Dashboard.
 */
const getActiveAlerts = async () => {
  const [alerts] = await pool.query(
    `SELECT e.*, 
            ru.full_name as rider_name, ru.phone as rider_phone,
            du.full_name as driver_name, du.phone as driver_phone
     FROM emergency_events e
     JOIN users ru ON e.user_id = ru.user_id
     LEFT JOIN users du ON e.driver_id = du.user_id
     WHERE e.status = 'active'
     ORDER BY e.created_at DESC`
  );
  return alerts;
};

/**
 * Emergency Contacts CRUD
 */
const getEmergencyContacts = async (user_id) => {
  const [contacts] = await pool.query(
    `SELECT * FROM emergency_contacts WHERE user_id = ?`,
    [user_id]
  );
  return contacts;
};

const addEmergencyContact = async (user_id, { contact_name, relationship, phone, email }) => {
  const [result] = await pool.query(
    `INSERT INTO emergency_contacts (user_id, contact_name, relationship, phone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, contact_name, relationship, phone, email]
  );
  return { contact_id: result.insertId, contact_name, relationship, phone, email };
};

const deleteEmergencyContact = async (contact_id, user_id) => {
  await pool.query(
    `DELETE FROM emergency_contacts WHERE contact_id = ? AND user_id = ?`,
    [contact_id, user_id]
  );
  return { success: true };
};

module.exports = {
  triggerSOS,
  resolveSOS,
  getActiveAlerts,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact
};

const sosService = require('../services/sosService');

const triggerSOS = async (req, res) => {
  try {
    const { ride_id, latitude, longitude } = req.body;
    
    if (!ride_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'ride_id, latitude, and longitude are required' });
    }

    const result = await sosService.triggerSOS(ride_id, req.user.user_id, latitude, longitude);
    
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resolveSOS = async (req, res) => {
  try {
    const result = await sosService.resolveSOS(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await sosService.getActiveAlerts();
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await sosService.getEmergencyContacts(req.user.user_id);
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addEmergencyContact = async (req, res) => {
  try {
    const { contact_name, relationship, phone, email } = req.body;
    
    if (!contact_name || !phone) {
      return res.status(400).json({ success: false, message: 'contact_name and phone are required' });
    }

    const contact = await sosService.addEmergencyContact(req.user.user_id, { contact_name, relationship, phone, email });
    res.status(201).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmergencyContact = async (req, res) => {
  try {
    await sosService.deleteEmergencyContact(req.params.id, req.user.user_id);
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  triggerSOS,
  resolveSOS,
  getActiveAlerts,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact
};

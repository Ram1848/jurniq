const chatService = require('../services/chatService');

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const reply = await chatService.getChatResponse(message);
    
    res.status(200).json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage
};

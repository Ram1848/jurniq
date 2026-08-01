const express = require('express');
const router = express.Router();
// We won't require strictly auth for the chat bot so prospective riders can use it
// But we could add it if we want. For now, it's public.
const { sendMessage } = require('../controllers/chatController');

router.post('/message', sendMessage);

module.exports = router;

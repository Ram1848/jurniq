const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const infoStream = fs.createWriteStream(path.join(logDir, 'info.log'), { flags: 'a' });
const errorStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

const formatMessage = (level, message) => {
  return `[${new Date().toISOString()}] [${level}] ${message}\n`;
};

const logger = {
  info: (message) => {
    const formatted = formatMessage('INFO', message);
    console.log(formatted.trim());
    infoStream.write(formatted);
  },
  error: (message, trace) => {
    const formatted = formatMessage('ERROR', message + (trace ? `\n${trace}` : ''));
    console.error(formatted.trim());
    errorStream.write(formatted);
  },
  warn: (message) => {
    const formatted = formatMessage('WARN', message);
    console.warn(formatted.trim());
    infoStream.write(formatted);
  }
};

module.exports = logger;

/**
 * utils/logger.js — Simple Logger
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(level, message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${message}\n`;
  
  console.log(`[${level.toUpperCase()}] ${message}`);
  
  try {
    fs.appendFileSync(path.join(LOG_DIR, 'combined.log'), line);
    if (level === 'error') {
      fs.appendFileSync(path.join(LOG_DIR, 'error.log'), line);
    }
  } catch (err) {
    // ignore log errors
  }
}

module.exports = {
  info: (msg) => log('info', msg),
  error: (msg) => log('error', msg),
  warn: (msg) => log('warn', msg),
  debug: (msg) => {
    if (process.env.DEBUG) log('debug', msg);
  }
};

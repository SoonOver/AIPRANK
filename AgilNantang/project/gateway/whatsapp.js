/**
 * gateway/whatsapp.js — WhatsApp Bot Gateway for SI BABU
 */

'use strict';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const orchestrator = require('../orchestrator');

// In-memory history per chat
const historyMap = new Map();
const MAX_HISTORY = 5;

// Simple Rate Limiter
const rateLimitMap = new Map();
const LIMIT_WINDOW = 30000; 
const MAX_MESSAGES = 5;

function isRateLimited(userId) {
  const now = Date.now();
  const userData = rateLimitMap.get(userId) || { count: 0, firstMsg: now };

  if (now - userData.firstMsg > LIMIT_WINDOW) {
    userData.count = 1;
    userData.firstMsg = now;
    rateLimitMap.set(userId, userData);
    return false;
  }

  userData.count++;
  rateLimitMap.set(userId, userData);
  return userData.count > MAX_MESSAGES;
}

function init() {
  const enabled = process.env.WHATSAPP_ENABLED === 'true';
  if (!enabled) {
    console.log('[whatsapp] Gateway tidak diaktifkan (WHATSAPP_ENABLED=false)');
    return;
  }

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });

  console.log('[whatsapp] Memulai client...');

  client.on('qr', (qr) => {
    console.log('[whatsapp] Scan QR code ini untuk login:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('[whatsapp] Gateway ONLINE');
  });

  client.on('message', async (msg) => {
    if (msg.from.includes('@g.us') || msg.isStatus) return;

    const input = msg.body;
    if (!input) return;

    const userId = msg.from;
    if (isRateLimited(userId)) {
      await msg.reply('Sabar bro, jangan spam ya... 😅');
      return;
    }

    const history = historyMap.get(userId) || [];

    try {
      const result = await orchestrator.run(input, { history });
      
      if (result.success) {
        history.push(`user: ${input}`);
        history.push(`si babu: ${result.output.slice(0, 500)}`);
        historyMap.set(userId, history.slice(-(MAX_HISTORY * 2)));

        await msg.reply(result.output);
      } else {
        await msg.reply(`Waduh, ada masalah: ${result.error || 'Gagal memproses.'}`);
      }
    } catch (err) {
      console.error('[whatsapp] Error:', err.message);
      await msg.reply('Gue lagi pusing, coba lagi nanti ya... 🤕');
    }
  });

  client.initialize().catch(err => {
    console.error('[whatsapp] Gagal inisialisasi:', err.message);
  });
}

module.exports = { init };

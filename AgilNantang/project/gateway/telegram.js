/**
 * gateway/telegram.js — Telegram Bot Gateway for SI BABU
 */

'use strict';

const TelegramBot = require('node-telegram-bot-api');
const orchestrator = require('../orchestrator');
const logger = require('../utils/logger');

// In-memory history per chat
const historyMap = new Map();
const MAX_HISTORY = 5;

// Simple Rate Limiter
const rateLimitMap = new Map();
const LIMIT_WINDOW = 30000; // 30 detik
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('YOUR_')) {
    console.log('[telegram] TELEGRAM_BOT_TOKEN tidak valid, gateway dilewati.');
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log('[telegram] Gateway ONLINE');

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Halo! Gue SI BABU, AI Agent lo. Ada yang bisa gue bantu? 😄');
  });

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const input  = msg.text;

    if (isRateLimited(userId)) {
      bot.sendMessage(chatId, 'Sabar bro, jangan spam. Tunggu bentar ya... 😅');
      return;
    }

    bot.sendChatAction(chatId, 'typing');

    // Get history
    const history = historyMap.get(chatId) || [];

    try {
      const result = await orchestrator.run(input, { history });
      
      if (result.success) {
        // Save history
        history.push(`user: ${input}`);
        history.push(`si babu: ${result.output.slice(0, 500)}`);
        historyMap.set(chatId, history.slice(-(MAX_HISTORY * 2)));

        if (result.output.length > 4000) {
          const chunks = result.output.match(/[\s\S]{1,4000}/g);
          for (const chunk of chunks) {
            await bot.sendMessage(chatId, chunk);
          }
        } else {
          await bot.sendMessage(chatId, result.output);
        }
      } else {
        await bot.sendMessage(chatId, `Waduh, ada masalah: ${result.error || 'Gagal memproses.'}`);
      }
    } catch (err) {
      console.error('[telegram] Error:', err.message);
      bot.sendMessage(chatId, 'Gue lagi pusing, coba lagi nanti ya... 🤕');
    }
  });

  bot.on('polling_error', (err) => {
    if (err.code === 'ETELEGRAM' && err.message.includes('401')) {
      console.error('[telegram] Token salah atau tidak valid.');
      bot.stopPolling();
    }
  });
}

module.exports = { init };

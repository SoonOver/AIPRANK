/**
 * provider/router.js — Arahkan ke provider aktif
 * Set AI_PROVIDER=gemini | nvidia | grok di .env
 */

'use strict';

const PROVIDER = process.env.AI_PROVIDER || 'gemini';

const SUPPORTED = ['gemini', 'nvidia', 'grok', 'openai'];

async function call(prompt, options = {}) {
  if (!SUPPORTED.includes(PROVIDER)) {
    throw new Error(`Provider "${PROVIDER}" tidak dikenal. Pilih: ${SUPPORTED.join(', ')}`);
  }

  const p = require(`./${PROVIDER}`);
  return p.call(prompt, options);
}

module.exports = { call };

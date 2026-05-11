/**
 * provider/grok.js — X.AI Grok API
 */

'use strict';

const https = require('https');

const MODEL      = 'grok-2-latest';
const MAX_TOKENS = 2048;

async function call(prompt, options = {}) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('GROK_API_KEY belum di-set di .env');

  const model  = options.model     || MODEL;
  const tokens = options.maxTokens || MAX_TOKENS;

  const body = JSON.stringify({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: tokens,
    temperature: options.temperature ?? 0.7,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.x.ai',
      path    : '/v1/chat/completions',
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            return reject(new Error(`Grok API error: ${json.error.message}`));
          }
          const text = json.choices?.[0]?.message?.content;
          if (!text) return reject(new Error('Grok: response kosong'));
          resolve(text.trim());
        } catch (err) {
          reject(new Error(`Parse error: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error('Grok: request timeout (30s)'));
    });

    req.write(body);
    req.end();
  });
}

module.exports = { call };

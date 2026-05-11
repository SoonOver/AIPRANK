/**
 * provider/nvidia.js — NVIDIA NIM API
 */

'use strict';

const https = require('https');

const MODEL      = 'meta/llama-3.1-8b-instruct';
const MAX_TOKENS = 2048;

async function call(prompt, options = {}) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY belum di-set di .env');

  const model  = options.model     || MODEL;
  const tokens = options.maxTokens || MAX_TOKENS;

  const body = JSON.stringify({
    model,
    messages   : [{ role: 'user', content: prompt }],
    max_tokens : tokens,
    temperature: options.temperature ?? 0.7,
    stream     : false,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
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
        // Log status untuk debug
        if (process.env.DEBUG) {
          console.error(`[nvidia] HTTP ${res.statusCode}`);
        }
        try {
          const json = JSON.parse(data);
          if (json.error) {
            return reject(new Error(`NVIDIA API error: ${json.error.message || JSON.stringify(json.error)}`));
          }
          const text = json.choices?.[0]?.message?.content;
          if (!text) return reject(new Error('NVIDIA: response kosong'));
          resolve(text.trim());
        } catch {
          reject(new Error(`Parse error (HTTP ${res.statusCode}): ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(180000, () => {
      req.destroy(new Error('NVIDIA: request timeout (120s)'));
    });

    req.write(body);
    req.end();
  });
}

module.exports = { call };

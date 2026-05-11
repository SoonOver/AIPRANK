'use strict';

const provider = require('../../provider/router');
const { makeCasual } = require('../../utils/response_style');

async function run(ctx) {
  const source = ctx.prev?.output || '';
  const input  = ctx.input;
  const tone   = ctx.tone || 'santai';
  const isCasual = tone !== 'formal' && input.length < 150;

  const history = (() => {
    try {
      const mem = require('../../utils/memory_engine').loadMemory();
      return mem.short.slice(-3)
        .map(m => `user: ${m.input}\nassistant: ${m.output}`)
        .join('\n') || '';
    } catch { return ''; }
  })();

  const prompt = isCasual
    ? `Kamu adalah SI BABU, temen ngobrol yang kebetulan pinter.

HISTORY:
${history || '(belum ada)'}

HASIL RESEARCH:
${source.slice(0, 2000)}

PERTANYAAN USER: ${input}

CARA JAWAB:
- Ngobrol santai kayak WhatsApp, bukan laporan
- Pakai "gue", "lo"
- Jangan pakai ##, poin penting, kesimpulan
- Ringkas yang relevan aja, buang yang ga penting
- Kalau info ga ada/ga yakin → bilang jujur, jangan karang
- Boleh emoji dikit

Jawab sekarang:`

    : `Kamu adalah SI BABU, AI assistant informatif.

HASIL RESEARCH:
${source.slice(0, 2000)}

PERTANYAAN: ${input}

Buat ringkasan yang:
- Informatif dan mudah dipahami
- Pakai bahasa Indonesia yang jelas
- Buang info tidak relevan
- Kalau tidak ada info valid → bilang tidak ditemukan

Jawab:`;

  let output;
  try {
    output = await provider.call(prompt, { maxTokens: 500 });
    if (isCasual) output = makeCasual(output);
  } catch (err) {
    return { ok: false, error: `Provider error: ${err.message}` };
  }

  if (!output || output.trim().length < 20) {
    return { ok: false, error: 'Output terlalu pendek' };
  }

  return { ok: true, output: output.trim(), role: 'summarizer' };
}

module.exports = { run };

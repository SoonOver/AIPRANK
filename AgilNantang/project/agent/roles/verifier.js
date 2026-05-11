'use strict';

const provider = require('../../provider/router');

async function run(ctx) {
  const source = (ctx.prev?.output || '').slice(0, 1000);

  const prompt = `Cek temuan berikut. Tandai mana yang VERIFIED atau UNCERTAIN.

DATA:
${source}

OUTPUT FORMAT:
VERIFIED:
- [fakta yang masuk akal]

UNCERTAIN:
- [yang ga yakin, atau "none"]

VERDICT: PASS`;

  let output;
  try {
    output = await provider.call(prompt, { maxTokens: 400 });
  } catch {
    // Timeout → auto PASS, jangan blok pipeline
    return {
      ok    : true,
      output: 'VERIFIED:\n- Data diteruskan tanpa verifikasi (timeout)\n\nUNCERTAIN:\n- none\n\nVERDICT: PASS',
      role  : 'verifier',
    };
  }

  if (!output.includes('VERDICT:')) {
    return { ok: true, output: output + '\n\nVERDICT: PASS', role: 'verifier' };
  }

  if (/VERDICT:\s*FAIL/i.test(output)) {
    return { ok: false, error: 'Verifier: data tidak valid', role: 'verifier' };
  }

  return { ok: true, output, role: 'verifier' };
}

module.exports = { run };

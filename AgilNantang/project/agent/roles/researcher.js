'use strict';

const provider     = require('../../provider/router');
const searchWeb    = require('../../tools/search_web');
const fetchUrl     = require('../../tools/fetch_url');
const searchGithub = require('../../tools/search_github');
const { makeCasual } = require('../../utils/response_style');

// Pertanyaan yang bisa dijawab dari knowledge, tidak perlu search
const NO_SEARCH_PATTERNS = [
  /^(apa|siapa|gimana|kenapa|kapan)\s+(itu\s+)?(gue|lo|lu|kamu|si babu)\b/i,
  /\b(lo|lu|gue|si babu)\s+(bisa|tau|kenal|pernah)\b/i,
  /\bmenurut\s+(lo|lu|kamu)\b/i,
  /\b(bagus|jelek|berat|ringan)\s+(ga|gak|ngga)\b/i,
  /\bopini\b/i,
  /\bpendapat\b/i,
];

function needsGithub(input) {
  return /\b(github|repo|library|package|npm|open.?source|framework)\b/i.test(input);
}

function needsSearch(input) {
  // Jangan search kalau pertanyaan tentang diri sendiri / opini
  if (NO_SEARCH_PATTERNS.some(r => r.test(input))) return false;
  return true;
}

function getHistory() {
  try {
    const mem = require('../../utils/memory_engine').loadMemory();
    return mem.short.slice(-3)
      .map(m => `user: ${m.input}\nsi babu: ${m.output?.slice(0, 100)}`)
      .join('\n') || '';
  } catch { return ''; }
}

async function run(ctx) {
  const input   = ctx.input;
  const tone    = ctx.tone || 'santai';
  const history = getHistory();
  const isCasual = tone !== 'formal' && input.length < 150;

  let webContext     = '';
  let fetchedContent = '';
  let githubContext  = '';

  if (needsSearch(input)) {
    // Web search
    console.log('[researcher] Searching web...');
    const webResults = await searchWeb.search(input);

    if (webResults.length > 0) {
      webContext = searchWeb.format(webResults);

      // Fetch max 2 URL
      for (const r of webResults.slice(0, 2)) {
        console.log(`[researcher] Fetching: ${r.url}`);
        const page = await fetchUrl.fetch(r.url);
        if (page.content.length > 100) {
          fetchedContent += `=== ${r.title} ===\n${page.content.slice(0, 1500)}\n\n`;
        }
      }
    }

    // GitHub kalau relevan
    if (needsGithub(input)) {
      console.log('[researcher] Searching GitHub...');
      const ghResults = await searchGithub.search(input);
      if (ghResults.length > 0) githubContext = searchGithub.format(ghResults);
    }
  }

  const hasData = webContext || fetchedContent || githubContext;

  const dataSection = hasData ? `
HASIL SEARCH:
${webContext || '(tidak ada)'}

KONTEN HALAMAN:
${fetchedContent || '(tidak ada)'}

GITHUB:
${githubContext || '(tidak relevan)'}`.trim() : '(tidak ada data dari web)';

  const prompt = isCasual
    ? `Kamu adalah SI BABU, temen yang kebetulan pinter.

HISTORY:
${history || '(baru mulai)'}

DATA YANG DIDAPET:
${dataSection}

PERTANYAAN: ${input}

CARA JAWAB:
- Ngobrol santai, kayak WhatsApp — BUKAN laporan
- Pakai "gue", "lo"
- JANGAN pakai ## atau poin formal
- Ringkas yang penting aja
- Kalau data ga ada/ga yakin → jujur bilang: "gue ga nemu info jelas soal itu"
- DILARANG mengarang fakta

Jawab:`

    : `Kamu adalah SI BABU, AI assistant informatif.

DATA:
${dataSection}

PERTANYAAN: ${input}

Buat jawaban yang informatif, pakai bahasa Indonesia yang jelas.
Kalau tidak ada data valid → bilang tidak ditemukan, jangan karang.

Jawab:`;

  let output;
  try {
    output = await provider.call(prompt, { maxTokens: 500 });
    if (isCasual) output = makeCasual(output);
  } catch (err) {
    return { ok: false, error: `Provider error: ${err.message}` };
  }

  if (!output.includes('FINDINGS:')) {
    // Researcher boleh return tanpa format FINDINGS kalau casual
    if (isCasual && output.trim().length > 20) {
      return { ok: true, output: output.trim(), role: 'researcher' };
    }
    return { ok: false, error: 'Output researcher tidak sesuai format' };
  }

  return { ok: true, output: output.trim(), role: 'researcher' };
}

module.exports = { run };

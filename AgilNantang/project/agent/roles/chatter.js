'use strict';

const filesystem = require('../../tools/filesystem');

const provider        = require('../../provider/router');
const { makeCasual }  = require('../../utils/response_style');
const { smartSearch, shouldBrowse } = require('../../utils/search_engine');


// Deteksi request filesystem
function isFilesystemRequest(input) {
  return /\b(lihat|buka|baca|cek|ls|list|show|tampil|edit|ubah|ganti|hapus|delete|cari file|find file)\b/i.test(input) &&
         /\b(file|folder|direktori|directory|script|kode|project|ls)\b/i.test(input);
}

function handleFilesystem(input) {
  const home = filesystem.ALLOWED_ROOT;

  // List folder
  const listMatch = input.match(/(?:lihat|ls|list|tampil)\s+(?:isi\s+)?([~\/][\w.\/\-]*|\.|\.\.)/i);
  if (listMatch) {
    const dirPath = listMatch[1].replace('~', home);
    const items   = filesystem.listDir(dirPath);
    if (items.error) return items.error;
    return items.map(i => `${i.type === 'dir' ? '📁' : '📄'} ${i.name}${i.size ? ' (' + i.size + 'B)' : ''}`).join('\n');
  }

  // Baca file
  const readMatch = input.match(/(?:buka|baca|lihat|cek|show|tampil)\s+([~\/][\w.\/\-\.]+)/i);
  if (readMatch) {
    const filePath = readMatch[1].replace('~', home);
    const result   = filesystem.readFile(filePath);
    if (result.error) return result.error;
    return result.content.slice(0, 2000);
  }

  // List home default
  if (/\b(ls|list|lihat folder|lihat file|apa aja|ada apa)\b/i.test(input)) {
    const items = filesystem.listDir(home);
    if (items.error) return items.error;
    return '📂 Home (~):\n' + items.map(i => `  ${i.type === 'dir' ? '📁' : '📄'} ${i.name}`).join('\n');
  }

  return null;
}

function getHistory() {
  try {
    const mem = require('../../utils/memory_engine').loadMemory();
    return mem.short.slice(-3)
      .map(m => `user: ${m.input}\nsi babu: ${m.output?.slice(0,200)}`)
      .join('\n') || '';
  } catch { return ''; }
}

// Deteksi opini / pengalaman pribadi → skip browse
function isOpinionQuery(input) {
  return /\b(menurut|pendapat|saran)\s+(lu|lo|kamu)\b/i.test(input) ||
         /\b(bagus|jelek|worth|berat|ringan)\s+(ga|gak|ngga)\b/i.test(input) ||
         /\b(lu|lo)\s+(pernah|suka|prefer|pilih)\b/i.test(input);
}

async function run(ctx) {
  const history = getHistory();

  // Handle filesystem request langsung tanpa AI
  if (isFilesystemRequest(ctx.input)) {
    const fsResult = handleFilesystem(ctx.input);
    if (fsResult) {
      return { ok: true, output: fsResult, role: 'chatter' };
    }
  }

  const now     = new Date();
  const tgl     = now.toLocaleDateString('id-ID', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  const jam = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });

  // Putuskan apakah perlu browse
  const needsBrowse = ctx.shouldBrowse === true ? true : (!isOpinionQuery(ctx.input) && shouldBrowse(ctx.input));
  let browseSection  = '';
  let hasValidData   = false;

  if (needsBrowse) {
    console.log('[chatter] browsing: yes');
    const result = await smartSearch(ctx.input, history);

    if (result.data?.hasPages) {
      const pagesText = result.data.pages
        .map(p => `--- ${p.title} (${p.url})\n${p.content}`)
        .join('\n\n');
      browseSection = `DATA INTERNET:\n${pagesText}\n\nSNIPPETS:\n${result.data.snippets}`;
      hasValidData  = true;
    } else if (result.data?.snippets) {
      browseSection = `SNIPPETS INTERNET:\n${result.data.snippets}`;
      hasValidData  = true;
    }
  } else {
    console.log(`[chatter] browsing: no | reason: ${isOpinionQuery(ctx.input) ? 'opinion' : 'not needed'}`);
  }

  const dataInstruction = hasValidData
    ? `Ada data internet di atas — gunakan sebagai sumber jawaban.
Rangkum santai, kayak cerita ke temen.
Jangan sebut "dari data" atau "berdasarkan browsing" — langsung cerita aja.
Kalau ada bagian yang tidak ada di data → bilang jujur.`
    : needsBrowse
      ? `Gue udah coba cari tapi tidak nemu info valid.
Jawab jujur: "gue belum nemu info valid soal itu, coba cek langsung di Google atau TikTok"
JANGAN karang data, tanggal, angka, atau kronologi.`
      : `Jawab dari pengetahuan lo.
Kalau tidak yakin → jujur bilang "gue kurang yakin soal itu".
JANGAN mengarang fakta spesifik.`;

  const prompt = `Kamu adalah SI BABU — AI agent yang dibuat langsung sama user yang lagi ngobrol ini.

WAKTU SEKARANG: ${tgl}, ${jam}

TENTANG LO:
- Nama: SI BABU, dibuat sama user ini
- Jalan di Node.js + Termux
- Bisa: coding, research, browsing, ngobrol

HISTORY (6 terakhir):
${history || '(baru mulai)'}

${hasValidData ? browseSection + '\n\n' : ''}USER: "${ctx.input}"

INSTRUKSI DATA:
${dataInstruction}

CARA JAWAB — WAJIB:
- Santai kayak WhatsApp sama temen deket
- Pakai "gue", "lo" — JANGAN "saya", "Anda", "kamu"
- JANGAN pakai ##, **, bullet panjang, atau format artikel
- JANGAN kalimat: "Apakah Anda...", "Mohon klarifikasi...", "Apakah yang dimaksud..."
- Kalau mau tanya balik → santai: "maksud lo gimana?" atau "yang mana nih?"
- KONSISTEN sama history — jangan kontradiksi jawaban sebelumnya
- JANGAN sebut topik dari history kalau user sudah ganti topik
- Fokus ke input user sekarang, jangan balik ke topik lama
- Kalau user koreksi lo → akui langsung, jangan defensif
- Max 3-4 paragraf pendek

Jawab:`;

  let output;
  try {
    output = await provider.call(prompt, { maxTokens: 350 });
    output = makeCasual(output);
  } catch {
    output = 'eh bentar, gue lagi error dikit 😅 coba ulang lagi ya';
  }

  return { ok: true, output: output.trim(), role: 'chatter' };
}

module.exports = { run };

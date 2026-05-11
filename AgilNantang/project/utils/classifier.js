'use strict';

const BUILD_PATTERNS = [
  /\b(buat|bikin|buatin|bikinin|create|build|generate|develop|implement)\s+\w/i,
  /\b(script|bot|app|aplikasi|website|web|api|backend|frontend|cli|tool|sistem|program|fungsi|fitur|endpoint|webhook|gateway|server)\b/i,
  /\b(tambah|add|refactor|update|upgrade|patch)\s+(fitur|feature|fungsi|kode|code|script|endpoint)\b/i,
];

const FIX_PATTERNS = [
  /\b(error|bug|crash|exception|traceback)\b.{0,60}(ini|berikut|:\s*[\n`])/i,
  /\bfix\s+(bug|error|masalah|kode|ini)\b/i,
  /\b(debug|perbaiki)\s+(kode|script|program|fungsi)\b/i,
  /\b(error|exception)\b.{40,}/i,
];

const AUTOMATION_PATTERNS = [
  /\b(otomatis|automate|automation|automasi)\b/i,
  /\b(jadwal|schedule|cron|setiap)\s+.{0,30}\s*(menit|jam|hari|minggu|detik)\b/i,
  /\b(trigger|monitor|watch|daemon|background|service)\b/i,
  /\b(deploy|ci|cd|pipeline|workflow)\b/i,
];

const RESEARCH_PATTERNS = [
  /\b(cari|cariin|search|googling|browsing|temuin)\b.{2,}/i,
  /\b(berita|news|info\s+terbaru|update\s+terbaru)\b/i,
  /\bapa\s+itu\s+\w+/i,
  /\bjelaskan\s+(apa|cara|kenapa|bagaimana|tentang)\b/i,
  /\b(perbedaan|bedanya|compare|vs)\s+\w+\s+(dan|dengan|vs)\s+\w+/i,
  /\b(tutorial|cara\s+pakai|cara\s+install|cara\s+setup)\b/i,
  /\b(rekomendasi|rekomendasiin)\s+\w+/i,
  /\b(lirik|arti\s+lagu|terjemahan\s+lagu)\b/i,
  /\b(harga|cuaca|kurs)\b/i,
];

const STRONG_CHAT = [
  /^(halo|hai|hi|hello|hey|yo|woy|oi)\s*[!?.]?\s*$/i,
  /^(ok|oke|sip|siap|iya|ya|nah)\s*[!?.]?\s*$/i,
  /^(makasih|thanks|mantap|keren|bagus)\s*[!?.]?\s*$/i,
  /^(bye|dadah)\s*[!?.]?\s*$/i,
  /\bmenurut\s+(lu|lo|kamu)\b/i,
  /\b(lu|lo)\s+(pikir|rasa|tau|kenal)\b/i,
  /\b(bagus|jelek|worth|berat|ringan)\s+(ga|gak|ngga)\b/i,
  /\b(serius|beneran|masa\s+sih)\s*[?!]?\s*$/i,
  /\b(lu|lo)\s+(masih|beneran|yakin|ngawur|halu)\b/i,
];

function wordCount(s) { return s.trim().split(/\s+/).length; }

function classify(input) {
  if (!input || !input.trim()) return 'chat';
  const t = input.trim();

  if (t.length < 6) return 'chat';
  if (wordCount(t) <= 2 && !/\b(error|bug|fix|buat|cari)\b/i.test(t)) return 'chat';
  if (STRONG_CHAT.some(function(r) { return r.test(t); })) return 'chat';

  // Error pendek tanpa stacktrace = tanya ke agent, bukan debug
  if (t.length < 50 && /error|eror|gagal/i.test(t) && t.indexOf(':') === -1) return 'chat';

  if (FIX_PATTERNS.some(function(r) { return r.test(t); })) return 'fix';
  if (BUILD_PATTERNS.some(function(r) { return r.test(t); })) return 'build';
  if (AUTOMATION_PATTERNS.some(function(r) { return r.test(t); })) return 'automation';
  if (RESEARCH_PATTERNS.some(function(r) { return r.test(t); })) return 'research';

  return 'chat';
}

module.exports = { classify };

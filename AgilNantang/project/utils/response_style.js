'use strict';

const REPLACEMENTS = [
  // Formal → santai
  { from: /\bAnda\b/g,                                    to: 'lo' },
  { from: /\bsaya\b/gi,                                   to: 'gue' },
  { from: /\bkamu\b/g,                                    to: 'lo' },
  { from: /berdasarkan data (yang tersedia|di atas)/gi,   to: 'dari yang gue cek' },
  { from: /berdasarkan (hasil )?pencarian/gi,             to: 'dari yang gue cari' },
  { from: /poin penting\s*:?/gi,                          to: 'yang penting:' },
  { from: /kesimpulan\s*:?/gi,                            to: 'intinya' },
  { from: /dengan demikian,?/gi,                          to: 'jadi' },
  { from: /oleh karena itu,?/gi,                          to: 'makanya' },
  { from: /perlu diketahui bahwa/gi,                      to: 'fyi,' },
  { from: /tidak ditemukan informasi/gi,                  to: 'gue ga nemu info jelas soal itu' },
  { from: /data yang tersedia/gi,                         to: 'info yang gue dapet' },
  { from: /sebagai informasi tambahan/gi,                 to: 'oh iya,' },
  { from: /mohon (maaf|dimaklumi)/gi,                     to: 'sori ya' },
  { from: /terima kasih/gi,                               to: 'makasih' },

  // Klarifikasi kaku → santai
  { from: /hmm,?\s*gue butuh klarifikasi dulu\s*:?/gi,   to: 'eh, maksud lo gimana ya?' },
  { from: /butuh klarifikasi\s*:?/gi,                     to: 'bisa jelasin lebih?' },
  { from: /apakah (anda|lo) (ingin|mau|maksud)/gi,        to: 'lo mau' },
  { from: /apakah yang (anda|lo) maksud/gi,               to: 'maksud lo' },

  // Pembuka kaku → natural
  { from: /^(baik|baiklah),?\s*/i,                        to: '' },
  { from: /^(tentu|tentu saja),?\s*/i,                    to: '' },
  { from: /^(berikut adalah|berikut ini)/i,               to: 'nih,' },
  { from: /^(sebagai|selaku) (ai|asisten|assistant)/i,    to: '' },
];

function stripMarkdown(text) {
  return text
    .replace(/^#{1,4}\s+.+$/gm, '')       // hapus ## Header
    .replace(/\*\*(.+?)\*\*/g, '$1')      // hapus bold
    .replace(/\*(.+?)\*/g, '$1')          // hapus italic
    .replace(/`(.+?)`/g, '$1')            // hapus inline code (kecuali block)
    .replace(/\n{3,}/g, '\n\n')           // max 2 newline berturut
    .trim();
}

function makeCasual(text) {
  if (!text) return text;
  let result = stripMarkdown(text);
  for (const { from, to } of REPLACEMENTS) {
    result = result.replace(from, to);
  }
  return result.trim();
}

function isKaku(text) {
  const signals = [
    /^#{1,4}\s/m,
    /\bpoin penting\b/i,
    /\bkesimpulan\s*:/i,
    /\bbutuh klarifikasi\b/i,
    /\bberdasarkan data\b/i,
    /\bAnda\b/,
    /^(baik|tentu|berikut adalah)/im,
  ];
  return signals.some(r => r.test(text));
}

module.exports = { makeCasual, stripMarkdown, isKaku };

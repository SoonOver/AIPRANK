'use strict';

const provider  = require('../../provider/router');
const fileTool  = require('../../tools/file');
const path      = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../');

function sanitizeCode(content) {
  const dangerousPatterns = [
    /\beval\s*\(/g,
    /\bnew\s+Function\s*\(/g,
    /\bsetTimeout\s*\(\s*['"`]/g,
    /\bsetInterval\s*\(\s*['"`]/g,
    /child_process\.exec\s*\(/g
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new Error(`Kode diblokir: Terdeteksi pola eksekusi berbahaya (eval/Function/exec) pada file.`);
    }
  }
  return content;
}

async function run(ctx) {
  const source    = (ctx.prev?.output || ctx.input).slice(0, 1200);
  const skillHint = ctx.skillMatch ? ctx.skillMatch.summary?.slice(0, 150) : 'none';
  const tone      = ctx.tone || 'santai';

  const prompt = `Kamu adalah Senior Software Engineer profesional.
Tulis kode production-ready untuk task berikut.

TASK: ${ctx.input}

RENCANA/ARSITEKTUR:
${source}

REFERENSI: ${skillHint}

KONTEKS PROJECT:
- Ini adalah project AI Agent "SI BABU" yang sudah jalan di Node.js
- Orchestrator tersedia lokal di: require('./orchestrator') atau require('../orchestrator')
- Jika task menyebut "si babu", "orchestrator", "agent ini" → gunakan local require, BUKAN API eksternal
- Project root ada di folder yang sama dengan file ini

BAHASA WAJIB: Node.js (JavaScript) — JANGAN Python, JANGAN bahasa lain kecuali diminta eksplisit.

STANDAR WAJIB:
- Gunakan environment variable untuk config sensitif (token, key, password)
  Contoh: process.env.TOKEN bukan hardcode string
- Tambahkan error handling yang proper (try/catch, event error)
- Tambahkan komentar singkat di bagian penting
- Modular — pisahkan fungsi yang bisa dipakai ulang
- Validasi input dasar
- Graceful shutdown (handle SIGINT/SIGTERM)
- Sertakan contoh file .env.example
- Sertakan cara install dan cara jalankan di bagian EXPLANATION

FORMAT — gunakan untuk SETIAP file:
=== FILE: nama_file.js ===
[kode]
=== END FILE ===

=== FILE: .env.example ===
[contoh env]
=== END FILE ===

Setelah semua file:
EXPLANATION:
## Cara Install
[langkah install]

## Cara Jalankan
[langkah jalankan]

## Fitur
[daftar fitur]`;

  let output;
  try {
    output = await provider.call(prompt, { maxTokens: 3000 });
  } catch (err) {
    return { ok: false, error: `Provider error: ${err.message}` };
  }

  if (!output || output.trim().length < 10) {
    return { ok: false, error: 'Builder output kosong' };
  }

  // Auto-save
  const FILE_PATTERN = /=== FILE: (.+?) ===\n(?:```[\w]*\n)?([\s\S]+?)(?:```\n)?=== END FILE ===/g;
  const savedFiles   = [];
  const savedPaths   = new Set(); // track duplikat
  let match;

  while ((match = FILE_PATTERN.exec(output)) !== null) {
    const [, rawPath, content] = match;
    const absPath = path.resolve(PROJECT_ROOT, rawPath.trim());
    if (!absPath.startsWith(PROJECT_ROOT)) continue;
    try {
      if (savedPaths.has(absPath)) continue; // skip duplikat
      savedPaths.add(absPath);
      const safeContent = sanitizeCode(content.trim());
      await fileTool.write(absPath, safeContent);
      savedFiles.push(rawPath.trim());
      console.log(`[builder] Saved: ${rawPath.trim()}`);
    } catch (err) {
      console.error(`[builder] Gagal: ${err.message}`);
    }
  }

  const note = savedFiles.length > 0
    ? `\n\n[Auto-saved: ${savedFiles.join(', ')}]`
    : '';

  return { ok: true, output: output + note, role: 'builder', savedFiles };
}

module.exports = { run };

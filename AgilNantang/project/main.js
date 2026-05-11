'use strict';

require('dotenv').config();

const readline = require('readline');
const os       = require('os');

const c = {
  reset  : '\x1b[0m',  bold   : '\x1b[1m',
  dim    : '\x1b[2m',  cyan   : '\x1b[36m',
  green  : '\x1b[32m', yellow : '\x1b[33m',
  red    : '\x1b[31m', magenta: '\x1b[35m',
};

const AGENT_NAME = 'si babu';
const USER_NAME  = os.userInfo().username || 'user';

function getGreeting() {
  const h = new Date().getHours();
  const time = h < 11 ? 'selamat pagi ☀️'
             : h < 15 ? 'selamat siang 🌤️'
             : h < 18 ? 'selamat sore 🌇'
             :           'selamat malam 🌙';
  const list = [
    'halo, butuh bantuan apa?',
    'selamat datang 😄 mau ngapain?',
    'halo, ada yang bisa gue bantu?',
    'yo, lagi butuh apa?',
    `${time}, ada yang bisa gue bantu?`,
    'siap nerima perintah 😎 mau ngapain?',
  ];
  return list[Math.floor(Math.random() * list.length)];
}

function printBanner() {
  const provider = process.env.AI_PROVIDER || 'gemini';
  console.log(`
${c.cyan}${c.bold}========================================
  AI AGENT — SI BABU
========================================${c.reset}
${c.bold}  Status   :${c.reset} ${c.green}ONLINE${c.reset}
${c.bold}  Mode     :${c.reset} Multi-Agent System
${c.bold}  Provider :${c.reset} ${provider}
${c.bold}  Memory   :${c.reset} ${c.green}ACTIVE${c.reset}
${c.bold}  Gateway  :${c.reset} CLI (Terminal)
${c.dim}----------------------------------------
  Tips:
  • Ketik apa saja untuk mulai
  • Ketik "help" untuk lihat commands
  • Ketik "exit" untuk keluar
----------------------------------------${c.reset}
`);
}

function agentSay(msg) {
  console.log(`\n${c.magenta}${c.bold}${AGENT_NAME}>${c.reset} ${msg}\n`);
}

// Filter output internal yang tidak perlu ditampilkan ke user
function cleanOutput(text) {
  if (!text) return text;

  // Sembunyikan output checker/verifier yang bocor
  if (/^STATUS:\s*(PASS|FAIL)/i.test(text.trim())) return null;

  // Filter output checker/verifier yang bocor
  if (/^(STATUS:|ISSUES:|SUMMARY:|Review Kode)/m.test(text)) {
    // Ambil hanya bagian setelah EXPLANATION jika ada
    const expMatch = text.match(/EXPLANATION[:\s]+([\s\S]+)/i);
    if (expMatch) return expMatch[1].trim();
    return null; // buang semua kalau pure checker output
  }

  // Bersihkan sisa markdown kalau masih ada
  return text
    .replace(/^#{1,4}\s+.+$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Output chunker
function printOutput(text) {
  const clean = cleanOutput(text);
  if (!clean) return;

  const CHUNK = 800;
  if (clean.length <= CHUNK) { agentSay(clean); return; }

  let start = 0;
  let first = true;
  while (start < clean.length) {
    let end = start + CHUNK;
    if (end < clean.length) {
      const b = Math.max(clean.lastIndexOf(' ', end), clean.lastIndexOf('\n', end));
      if (b > start) end = b + 1;
    }
    const chunk = clean.slice(start, end);
    if (first) { agentSay(chunk); first = false; }
    else console.log(`${' '.repeat(AGENT_NAME.length + 2)}${chunk}\n`);
    start = end;
  }
}

// Loader
const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
let loaderInterval = null, loaderIdx = 0;

function startLoader() {
  process.stdout.write('\n');
  loaderInterval = setInterval(() => {
    process.stdout.write(`\r${c.dim}${frames[loaderIdx++ % frames.length]} si babu lagi mikir...${c.reset}`);
  }, 100);
}

function stopLoader() {
  if (!loaderInterval) return;
  clearInterval(loaderInterval);
  loaderInterval = null;
  process.stdout.write('\r' + ' '.repeat(40) + '\r');
}

function handleCommand(input) {
  const cmd = input.toLowerCase().trim();
  if (cmd === 'help') {
    console.log(`\n${c.bold}Commands:${c.reset}
  help      — tampilkan pesan ini
  status    — status task & memory
  clear     — bersihkan layar
  exit/quit — keluar\n`);
    return true;
  }
  if (cmd === 'clear') { console.clear(); printBanner(); agentSay(getGreeting()); return true; }
  if (cmd === 'status') {
    try {
      const state = require('./utils/state').getCurrent();
      const mem   = require('./utils/memory_engine').loadMemory();
      console.log(`\n${c.bold}── Status ───────────────${c.reset}
Task   : ${state?.status || 'none'} | ${state?.type || 'none'}
Memory : short:${mem.short.length} long:${mem.long.length} skills:${mem.skills.length}
Tone   : ${mem.profile?.tone || 'santai'}\n`);
    } catch { agentSay('status belum tersedia.'); }
    return true;
  }
  return false;
}

async function main() {
  printBanner();

  const provider    = process.env.AI_PROVIDER || 'gemini';
  const keyMap      = { gemini: 'GEMINI_API_KEY', nvidia: 'NVIDIA_API_KEY', grok: 'GROK_API_KEY' };
  const requiredKey = keyMap[provider];
  if (requiredKey && !process.env[requiredKey]) {
    console.warn(`${c.yellow}⚠️  ${requiredKey} belum di-set di .env${c.reset}\n`);
  }

  let orchestrator;
  try {
    orchestrator = require('./orchestrator');
  } catch (err) {
    console.error(`${c.red}[FATAL] ${err.message}${c.reset}`);
    process.exit(1);
  }

  // Inisialisasi Gateways
  try {
    const telegram = require('./gateway/telegram');
    telegram.init();
    
    const whatsapp = require('./gateway/whatsapp');
    whatsapp.init();
  } catch (err) {
    if (process.env.DEBUG) console.log(`[gateway] Gateway init failed: ${err.message}`);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  agentSay(getGreeting());

  function prompt() {
    rl.question(`${c.cyan}${USER_NAME}>${c.reset} `, async (raw) => {
      const input = raw.trim();
      if (!input) { prompt(); return; }

      if (['exit','quit','bye'].includes(input.toLowerCase())) {
        agentSay('oke, sampai jumpa! 👋');
        rl.close(); process.exit(0);
      }

      if (handleCommand(input)) { prompt(); return; }

      startLoader();
      let result;
      try {
        result = await orchestrator.run(input);
      } catch (err) {
        stopLoader();
        agentSay(`eh bentar, gue lagi error dikit 😅 — ${err.message}`);
        prompt(); return;
      }
      stopLoader();

      if (!result.success) {
        if (result.clarification) {
          agentSay(`maksud lo yang mana ya? jelasin dikit dong 😄\n\n${result.clarification}`);
        } else {
          agentSay(`eh bentar, gue lagi error dikit 😅 coba ulang lagi ya`);
          if (process.env.DEBUG) console.log(`${c.dim}(${result.error})${c.reset}`);
        }
      } else {
        if (process.env.DEBUG && result.steps?.length) {
          console.log(`${c.dim}  [${result.steps.map(s=>`${s.role}:${s.ok?'✓':'✗'}`).join('→')}]${c.reset}`);
        }
        const steps      = result.steps || [];
        const isBuild    = steps.some(s => s.role === 'builder');
        const savedFiles = result.savedFiles || [];

        if (isBuild) {
          const fileList = savedFiles.length > 0
            ? savedFiles.map(f => '  📄 ' + f).join('\n')
            : '  (tidak ada file tersimpan)';
          agentSay('✅ Done! File tersimpan:\n' + fileList + '\n\nKetik "tampilkan [nama file]" untuk lihat isinya.');
        } else {
          const cleaned = result.output;
          if (!cleaned || cleaned.trim() === '') {
            agentSay('✅ Task selesai!');
          } else {
            printOutput(cleaned);
          }
        }
      }

      prompt();
    });
  }

  prompt();
}

process.on('uncaughtException', (err) => {
  stopLoader();
  console.error(`\n${c.red}[ERROR] ${err.message}${c.reset}`);
});
process.on('unhandledRejection', (reason) => {
  stopLoader();
  console.error(`\n${c.red}[ERROR] ${reason}${c.reset}`);
});

const shutdown = () => {
  stopLoader();
  agentSay('Gue ijin istirahat dulu ya... 👋');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch(err => { console.error(`${c.red}[FATAL] ${err.message}${c.reset}`); process.exit(1); });

'use strict';

const HALLUCINATION_SIGNALS = [
  'as an ai','as a language model','i cannot','i am not able',
  'saya tidak bisa','saya adalah ai','maaf, saya tidak','sorry, i cannot',
];

const DANGEROUS_PATTERNS = [
  /\beval\s*\(/i,
  /\bnew\s+Function\s*\(/i,
  /\bsetTimeout\s*\(\s*['"`]/i,
  /\bsetInterval\s*\(\s*['"`]/i,
  /child_process\.exec\s*\(/i
];

const MIN_LENGTH = {
  planner    : 50,
  builder    : 100,
  requirement: 30,
  architect  : 50,
  checker    : 30,
  researcher : 50,
  verifier   : 30,
  summarizer : 30,
  chatter    : 1,   // chat boleh pendek
  default    : 20,
};

function validate(result, roleName) {
  if (!result) {
    return { ok: false, reason: 'Role tidak mengembalikan hasil', summary: 'null result' };
  }

  if (result.ok === false) {
    return {
      ok           : false,
      reason       : result.error || 'Role return ok:false',
      clarification: result.clarification || null,
      summary      : result.error || 'failed',
    };
  }

  if (!result.output || typeof result.output !== 'string') {
    return { ok: false, reason: 'Output tidak ada atau bukan string', summary: 'no output' };
  }

  // Bypass validasi ketat untuk chatter
  if (roleName === 'chatter') {
    return { ok: true, summary: 'chat response' };
  }

  const text = result.output.trim();

  const minLen = MIN_LENGTH[roleName] || MIN_LENGTH.default;
  if (text.length < minLen) {
    return {
      ok     : false,
      reason : `Output terlalu pendek (${text.length} < ${minLen} karakter)`,
      summary: 'too short',
    };
  }

  const lower = text.toLowerCase();
  for (const signal of HALLUCINATION_SIGNALS) {
    if (lower.includes(signal)) {
      return { ok: false, reason: `Terdeteksi sinyal halusinasi: "${signal}"`, summary: 'hallucination' };
    }
  }

  // Dangerous code check for builder
  if (roleName === 'builder') {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        return { ok: false, reason: 'Terdeteksi pola kode berbahaya (RCE)', summary: 'dangerous code' };
      }
    }
  }

  if (roleName === 'planner' && (!text.includes('GOAL:') || !text.includes('STEPS:'))) {
    return { ok: false, reason: 'Planner missing GOAL/STEPS', summary: 'invalid format' };
  }

  if (roleName === 'builder' && !text.includes('=== FILE:') && !text.includes('```')) {
    return { ok: false, reason: 'Builder output tidak ada kode', summary: 'no code' };
  }

  return { ok: true, summary: text.slice(0, 60).replace(/\n/g, ' ') + '...' };
}

module.exports = { validate };

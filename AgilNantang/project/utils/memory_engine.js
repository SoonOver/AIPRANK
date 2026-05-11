/**
 * utils/memory_engine.js — Memory Engine
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const MEM_DIR = path.resolve(__dirname, '../memory');

const FILES = {
  short  : path.join(MEM_DIR, 'short_term.json'),
  long   : path.join(MEM_DIR, 'long_term.json'),
  skills : path.join(MEM_DIR, 'skills.json'),
  profile: path.join(MEM_DIR, 'user_profile.json'),
};

const LIMITS = {
  short : 10,
  long  : 100,
  skills: 50,
};

function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
    console.error(`[memory] Gagal tulis ${path.basename(filePath)}:`, err.message);
  }
}

function loadMemory() {
  return {
    short  : readJSON(FILES.short,   []),
    long   : readJSON(FILES.long,    []),
    skills : readJSON(FILES.skills,  []),
    profile: readJSON(FILES.profile, { tone: 'santai', preferences: [], updatedAt: null }),
  };
}

function saveShortTerm(input, output) {
  const items = readJSON(FILES.short, []);
  items.push({ input, output: output?.slice(0, 500) || '', ts: Date.now() });
  writeJSON(FILES.short, items.slice(-LIMITS.short));
}

function saveLongTerm(data) {
  const items = readJSON(FILES.long, []);
  const isDuplicate = items.some(i =>
    i.content?.slice(0, 100) === data.content?.slice(0, 100)
  );
  if (isDuplicate) return;
  items.push({
    id     : Date.now().toString(),
    type   : data.type    || 'general',
    content: data.content || '',
    tags   : data.tags    || [],
    source : data.source  || 'agent',
    ts     : Date.now(),
  });
  writeJSON(FILES.long, items.slice(-LIMITS.long));
}

function updateUserProfile(input) {
  const profile = readJSON(FILES.profile, {
    tone: 'santai', preferences: [], updatedAt: null,
  });
  const lower = input.toLowerCase();
  if (['mohon','dengan hormat','saya ingin'].some(s => lower.includes(s))) profile.tone = 'formal';
  if (['dong','deh','gw','lu','gak','ga '].some(s => lower.includes(s)))   profile.tone = 'santai';
  if (['langsung','singkat','simple'].some(s => lower.includes(s)))        profile.tone = 'langsung';
  if (lower.includes('simple') || lower.includes('singkat')) {
    if (!profile.preferences.includes('simple')) profile.preferences.push('simple');
  }
  if (lower.includes('detail') || lower.includes('lengkap')) {
    if (!profile.preferences.includes('detail')) profile.preferences.push('detail');
  }
  profile.updatedAt = new Date().toISOString();
  writeJSON(FILES.profile, profile);
}

function saveSkill(task, result) {
  const skills = readJSON(FILES.skills, []);
  const isDuplicate = skills.some(s =>
    s.taskType === task.type &&
    s.pattern?.slice(0, 80) === task.input?.slice(0, 80)
  );
  if (isDuplicate) return;
  const usedRoles = result.steps?.filter(s => s.ok).map(s => s.role) || [];
  skills.push({
    id      : Date.now().toString(),
    taskType: task.type,
    pattern : task.input?.slice(0, 200) || '',
    roles   : usedRoles,
    summary : result.output?.slice(0, 300) || '',
    ts      : Date.now(),
  });
  writeJSON(FILES.skills, skills.slice(-LIMITS.skills));
}

function retrieveRelevant(input, maxItems = 5) {
  const lower  = input.toLowerCase();
  const words  = lower.split(/\s+/).filter(w => w.length > 3);
  const results = [];

  for (const item of readJSON(FILES.long, [])) {
    const text  = (item.content + ' ' + item.tags?.join(' ')).toLowerCase();
    const score = words.filter(w => text.includes(w)).length;
    if (score > 0) results.push({ score, type: 'long', data: item });
  }

  for (const skill of readJSON(FILES.skills, [])) {
    const text  = (skill.pattern + ' ' + skill.taskType).toLowerCase();
    const score = words.filter(w => text.includes(w)).length;
    if (score > 0) results.push({ score, type: 'skill', data: skill });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(r => ({
      type   : r.type,
      content: r.type === 'skill' ? r.data.summary : r.data.content,
      tags   : r.data.tags || [],
    }));
}

function findSkill(input) {
  const lower  = input.toLowerCase();
  const words  = lower.split(/\s+/).filter(w => w.length > 3);
  const skills = readJSON(FILES.skills, []);
  let best = null, bestScore = 0;
  for (const skill of skills) {
    const text  = (skill.pattern + ' ' + skill.taskType).toLowerCase();
    const score = words.filter(w => text.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = skill; }
  }
  return bestScore >= 2 ? best : null;
}

module.exports = {
  loadMemory, saveShortTerm, saveLongTerm,
  updateUserProfile, saveSkill, retrieveRelevant, findSkill,
};

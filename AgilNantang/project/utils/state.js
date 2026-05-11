/**
 * utils/state.js — Handle state task aktif
 * Persist ke memory/tasks.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TASKS_FILE = path.resolve(__dirname, '../memory/tasks.json');
const MAX_HISTORY = 50;
const TIMEOUT_MS  = 10 * 60 * 1000; // 10 menit

let current = null;

function init(input) {
  cleanupStale(); // Bersihkan task nyangkut tiap kali ada task baru
  current = {
    id        : Date.now().toString(),
    input,
    type      : null,
    status    : 'running',
    lastRole  : null,
    lastOutput: '',
    createdAt : new Date().toISOString(),
    updatedAt : new Date().toISOString(),
  };
  save(current);
  return current;
}

function save(task) {
  current = { ...task, updatedAt: new Date().toISOString() };

  try {
    let history = [];
    if (fs.existsSync(TASKS_FILE)) {
      try { history = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8')); } catch {}
    }

    const idx = history.findIndex(t => t.id === current.id);
    if (idx >= 0) history[idx] = current;
    else history.push(current);

    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    fs.writeFileSync(TASKS_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('[state] Gagal persist:', err.message);
  }
}

function cleanupStale() {
  try {
    if (!fs.existsSync(TASKS_FILE)) return;
    let history = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    let changed = false;
    const now = Date.now();

    history = history.map(t => {
      if (t.status === 'running') {
        const lastUpdate = new Date(t.updatedAt).getTime();
        if (now - lastUpdate > TIMEOUT_MS) {
          changed = true;
          return { ...t, status: 'timeout', updatedAt: new Date().toISOString() };
        }
      }
      return t;
    });

    if (changed) {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(history, null, 2), 'utf8');
      console.log('[state] Cleanup: task nyangkut di-mark timeout');
    }
  } catch (err) {
    console.error('[state] Gagal cleanup:', err.message);
  }
}

function getCurrent() {
  return current;
}

module.exports = { init, save, getCurrent, cleanupStale };

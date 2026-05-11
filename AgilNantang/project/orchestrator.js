'use strict';

const classifier   = require('./utils/classifier');
const state        = require('./utils/state');
const validator    = require('./utils/validator');
const stop         = require('./utils/stop');
const continuation = require('./utils/continuation');
const memory       = require('./utils/memory_engine');
const decider      = require('./agent/roles/decider');

const MAX_STEP  = 10;
const MAX_RETRY = 2;

// Threshold confidence decider untuk override classifier
const DECIDER_CONFIDENCE_THRESHOLD = 0.75;

async function run(input, ctx = {}) {
  stop.init();

  memory.updateUserProfile(input);
  const memData  = memory.loadMemory();
  const relevant = memory.retrieveRelevant(input);
  const profile  = memData.profile;
  const skill    = memory.findSkill(input);

  // ── STEP 1: Classifier — fast first pass ─────────────────────────────
  const classifierResult = classifier.classify(input);
  log(`[classifier] ${classifierResult}`);

  // ── STEP 2: Decider — AI second pass ─────────────────────────────────
  // Ambil history singkat untuk context decider
  const recentHistory = memData.short.slice(-3)
    .map(m => `user: ${m.input}\nsi babu: ${m.output?.slice(0,100)}`)
    .join('\n');

  let finalIntent    = classifierResult;
  let shouldBrowse   = false;
  let deciderReason  = '';

  try {
    const decision = await decider.decide(input, recentHistory, classifierResult);
    log(`[decider] intent=${decision.intent} browse=${decision.should_browse} conf=${decision.confidence} | ${decision.reason}`);

    // Pakai hasil decider hanya kalau confidence cukup tinggi
    if (decision.confidence >= DECIDER_CONFIDENCE_THRESHOLD) {
      finalIntent  = decision.intent;
      shouldBrowse = decision.should_browse;
      deciderReason = decision.reason;
    } else {
      // Confidence rendah → fallback ke classifier
      log(`[decider] confidence rendah (${decision.confidence}), fallback ke classifier`);
      finalIntent  = classifierResult;
      shouldBrowse = false;
    }
  } catch (err) {
    // Decider error → fallback ke classifier
    log(`[decider] error: ${err.message}, fallback ke classifier`);
    finalIntent = classifierResult;
  }

  log(`[intent] final=${finalIntent} | browse=${shouldBrowse}`);

  // ── STEP 3: Route ─────────────────────────────────────────────────────
  if (finalIntent === 'chat') {
    const chatter = require('./agent/roles/chatter');
    let result;
    try {
      result = await chatter.run({
        input,
        tone          : profile.tone,
        memoryRelevant: relevant,
        shouldBrowse,  // inject keputusan browse dari decider
      });
    } catch {
      result = { ok: true, output: 'ada yang bisa gue bantu? 😄' };
    }
    memory.saveShortTerm(input, result.output);
    return { success: true, output: result.output, steps: [], error: null };
  }

  // ── STEP 4: Pipeline ──────────────────────────────────────────────────
  const task = state.init(input);
  task.type  = finalIntent;
  state.save(task);

  let pipeline;
  try {
    pipeline = require(`./agent/pipeline/${finalIntent}`);
  } catch {
    // Pipeline tidak ada → fallback ke chat
    log(`Pipeline "${finalIntent}" tidak tersedia, fallback ke chat`);
    const chatter = require('./agent/roles/chatter');
    const result  = await chatter.run({ input, tone: profile.tone, memoryRelevant: relevant });
    memory.saveShortTerm(input, result.output);
    return { success: true, output: result.output, steps: [], error: null };
  }

  if (typeof pipeline.getRoles !== 'function') {
    return fail(task, `Pipeline "${finalIntent}" tidak valid.`);
  }

  const allRoles = pipeline.getRoles();
  const roles    = allRoles.filter(roleName => {
    try { return typeof require(`./agent/roles/${roleName}`).run === 'function'; }
    catch { log(`Role "${roleName}" dilewati`); return false; }
  });

  if (!roles.length) return fail(task, `Semua role di "${finalIntent}" belum tersedia.`);

  log(`Pipeline: ${roles.join(' → ')}`);

  const stepLog = [];
  let context   = {
    input,
    history       : ctx.history || [],
    memoryRelevant: relevant,
    skillMatch    : skill,
    tone          : profile.tone,
    profile,
    shouldBrowse,
  };
  let stepCount = 0;

  for (const roleName of roles) {
    if (stop.shouldStop(stepCount, MAX_STEP)) {
      return fail(task, `Max step (${MAX_STEP}) tercapai.`, stepLog);
    }

    let roleResult = null;
    let attempt    = 0;

    while (attempt <= MAX_RETRY) {
      attempt++;
      stepCount++;
      log(`[${stepCount}] ${roleName} (attempt ${attempt})`);

      try {
        roleResult = await require(`./agent/roles/${roleName}`).run(context, task);
      } catch (err) {
        roleResult = { ok: false, error: err.message };
      }

      const valid = validator.validate(roleResult, roleName);
      stepLog.push({ role: roleName, ok: valid.ok, summary: valid.summary, attempt, savedFiles: roleResult?.savedFiles || [] });

      if (valid.ok) break;

      if (attempt > MAX_RETRY) {
        return {
          success      : false,
          error        : `Role "${roleName}" gagal: ${valid.reason}`,
          clarification: valid.clarification || null,
          steps        : stepLog,
          output       : null,
        };
      }
      log(`  Retry ${attempt}/${MAX_RETRY}: ${valid.reason}`);
    }

    context.prev    = roleResult;
    context.memory  = { ...context.memory, ...(roleResult.memory || {}) };
    task.lastRole = roleName;
    // Simpan output builder, skip output checker/verifier
    if (!['checker','verifier'].includes(roleName)) {
      task.lastOutput = roleResult.output || '';
    }
    state.save(task);
  }

  const finalOutput = continuation.process(task.lastOutput || '');
  task.status = 'done';
  state.save(task);

  memory.saveShortTerm(input, finalOutput);
  memory.saveSkill(task, { steps: stepLog, output: finalOutput });
  memory.saveLongTerm({
    type   : finalIntent,
    content: finalOutput.slice(0, 1000),
    tags   : [finalIntent, ...input.split(' ').slice(0, 3)],
    source : 'agent',
  });

  // Kumpulkan savedFiles dari builder
  const savedFiles = stepLog
    .filter(s => s.role === 'builder')
    .flatMap(s => s.savedFiles || []);

  return { success: true, output: finalOutput, steps: stepLog, savedFiles, error: null };
}

function fail(task, error, steps = []) {
  if (task) { task.status = 'failed'; state.save(task); }
  log(`FAIL: ${error}`);
  return { success: false, error, steps, output: null };
}

function log(msg) {
  if (process.env.DEBUG || process.env.VERBOSE) console.log(`[orchestrator] ${msg}`);
}

module.exports = { run };

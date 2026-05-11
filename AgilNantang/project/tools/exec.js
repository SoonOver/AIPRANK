/**
 * tools/exec.js — Menjalankan command shell
 */

'use strict';

const { exec } = require('child_process');

async function run(command, options = {}) {
  const timeout = options.timeout || 30000;
  
  return new Promise((resolve) => {
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          error: error.message,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      } else {
        resolve({
          ok: true,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      }
    });
  });
}

module.exports = { run };

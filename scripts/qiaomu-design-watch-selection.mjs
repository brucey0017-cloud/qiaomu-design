#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const selectionFile = path.resolve(getArg('--selection', 'selection.json'));
const timeoutMs = Number(getArg('--timeout', '300000'));
const intervalMs = Number(getArg('--interval', '1000'));
const startedAt = Date.now();

async function readSelection() {
  try {
    const raw = await fs.readFile(selectionFile, 'utf8');
    const selection = JSON.parse(raw);
    if (selection && (selection.id || selection.label || selection.name)) return selection;
  } catch {
    return null;
  }
  return null;
}

while (Date.now() - startedAt <= timeoutMs) {
  const selection = await readSelection();
  if (selection) {
    console.log(`QIAOMU_DESIGN_SELECTION_OBSERVED::${JSON.stringify(selection)}`);
    process.exit(0);
  }
  await new Promise(resolve => setTimeout(resolve, intervalMs));
}

console.error(`QIAOMU_DESIGN_SELECTION_TIMEOUT::${selectionFile}`);
process.exit(2);

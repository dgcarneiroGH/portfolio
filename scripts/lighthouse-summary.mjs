import { writeFile } from 'node:fs/promises';

import { getCommit } from './lighthouse-baseline.mjs';

export async function writeSummary(filePath, runs, meta = {}) {
  const data = {
    timestamp: new Date().toISOString(),
    commit: getCommit(),
    ...meta,
    runs,
  };
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

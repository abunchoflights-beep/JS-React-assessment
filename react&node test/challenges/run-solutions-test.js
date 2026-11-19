const { spawnSync } = require('node:child_process');
const path = require('node:path');

const result = spawnSync(
  process.execPath,
  ['--test', path.join(__dirname, 'assessment.test.js')],
  {
    stdio: 'inherit',
    env: { ...process.env, TEST_SOLUTIONS: 'true' },
  }
);

process.exit(result.status ?? 1);


const { spawn } = require('child_process');
const path = require('path');

console.log("🚀 Launcher starting Bun...");

const bun = spawn('bun', [path.join(__dirname, 'src/index.ts')], {
  stdio: 'inherit',
  shell: true
});

bun.on('exit', (code) => {
  console.log(` Bun exited with code ${code}`);
  process.exit(code || 0);
});

bun.on('error', (err) => {
  console.error('❌ Failed to start Bun:', err);
  process.exit(1);
});

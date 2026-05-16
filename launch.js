import { spawn, execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('==============================');
console.log('  LariGuide - Iniciando...');
console.log('==============================\n');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
});

const vite = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

let exiting = false;

const killAll = () => {
  if (exiting) return;
  exiting = true;
  console.log('\n[LariGuide] Cerrando procesos...');
  if (process.platform === 'win32') {
    try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }); } catch (_) {}
    try { execSync(`taskkill /pid ${vite.pid} /T /F`, { stdio: 'ignore' }); } catch (_) {}
  } else {
    try { server.kill('SIGTERM'); } catch (_) {}
    try { vite.kill('SIGTERM'); } catch (_) {}
  }
  console.log('[LariGuide] Puerto 3001 y 5173 liberados. Hasta luego.');
};

// Abrir el navegador una vez que server y vite hayan arrancado
setTimeout(() => {
  const url = 'http://localhost:5173';
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', url], { stdio: 'ignore', shell: false });
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { stdio: 'ignore' });
    } else {
      spawn('xdg-open', [url], { stdio: 'ignore' });
    }
    console.log(`\n[LariGuide] Abriendo ${url} en el navegador...\n`);
  } catch (_) {}
}, 4000);

process.on('SIGINT', () => { killAll(); process.exit(0); });
process.on('SIGTERM', () => { killAll(); process.exit(0); });

vite.on('close', () => { killAll(); process.exit(0); });

server.on('close', (code) => {
  if (!exiting && code !== 0) {
    console.error(`\n[LariGuide] El servidor falló con código ${code}.`);
    killAll();
    process.exit(1);
  }
});

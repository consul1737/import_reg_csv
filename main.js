import { app, BrowserWindow } from 'electron';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Definir ruta absoluta para el archivo de log
const logPath = path.join(app.getPath('userData'), 'log.txt');

// Función para loguear mensajes
function logError(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${message}\n`);
}

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.stack || error}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
});

// Para registrar manualmente errores:
logError('La app se inició correctamente.');

// Para __dirname en ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html')); // ✔️ Bien ubicado
}

// Levanta tu servidor backend (index.js):
const server = fork(path.join(__dirname, 'src', 'index.js')); // ✔️ arranca Express

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  server.kill(); // ✔️ cierra backend
  app.quit();
});

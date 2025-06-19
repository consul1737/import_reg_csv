import { app, BrowserWindow } from 'electron';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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

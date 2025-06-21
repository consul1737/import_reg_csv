import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Para obtener __dirname en ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para el archivo de log (un nivel arriba, junto al main.js de Electron)
const logPath = path.join(__dirname, '..', 'log-backend.txt');

// Función para registrar errores
function logError(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${message}\n`);
}

const app = express();
const PORT = 3003;

app.get('/', (req, res) => {
  console.log('Recibida una solicitud GET en la ruta raíz');
  logError('Recibida solicitud GET en /'); // También lo logueamos a archivo
  res.send('¡Hola, mundo!');                    
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logError(`Error en petición: ${err.stack || err}`);
  res.status(500).send('Error interno en el servidor');
});

// Captura de errores no manejados
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception en backend: ${error.stack || error}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection en backend: ${reason}`);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  logError(`Servidor Express escuchando en el puerto ${PORT}`);
});

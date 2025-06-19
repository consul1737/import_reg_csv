import express from "express";
import multer from "multer";
import fs from "fs";
import { parse } from "fast-csv";

import { login } from "./api/login.js";
import { saveRegistroCab } from "./api/saveCab.js";
import { saveRegistroCuerpo } from "./api/saveCuerpo.js";

const app = express();
const upload = multer({ dest: 'uploads/' }); // carpeta temporal para multer

app.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    const user = await login();
    const token = user.access_token;
    console.log("Login OK", user);

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(parse({ headers: true, delimiter: ',' }))
      .on('error', error => {
        console.error("Error leyendo CSV:", error);
        res.status(500).json({ error: "Error leyendo CSV" });
      })
      .on('data', row => {
        results.push(row);
      })
      .on('end', async (rowCount) => {
        console.log(`Se procesaron ${rowCount} filas`);

        for (const row of results) {
          const cabeceraData = {
            flowid: parseInt(row.flowid),
            referenciatexto: row.referenciatexto,
            clientid: parseInt(row.clientid),
            clientname: row.clientname,
            cuerpos: [],
            currentuser: parseInt(row.currentuser),
            fecha: row.fecha,
            statusid: parseInt(row.statusid),
            vendedorid: parseInt(row.vendedorid),
            xlatitud: parseFloat(row.xlatitud),
            xlongitud: parseFloat(row.xlongitud),
            statusflowid: parseInt(row.statusflowid),
            totalprecio: parseFloat(row.totalprecio),
            totalimpuestos: parseFloat(row.totalimpuestos),
          };

          const cabResponse = await saveRegistroCab(cabeceraData, token);
          console.log("Cabecera guardada:", cabResponse);

          const cuerpoData = {
            presupcabid: cabResponse.id,
            articulo: row.articulo,
            articulodepositoid: parseInt(row.articulodepositoid),
            cantidad: parseFloat(row.cantidad),
            preciounit: parseFloat(row.preciounit),
            preciototal: parseFloat(row.preciototal),
            cuerpoflowid: parseInt(row.cuerpoflowid),
            cuerpostatusid: parseInt(row.cuerpostatusid),
            xlatitud: parseFloat(row.xlatitud),
            xlongitud: parseFloat(row.xlongitud),
          };

          const cuerpoResponse = await saveRegistroCuerpo(cuerpoData, token);
          console.log("Cuerpo guardado:", cuerpoResponse);
        }

        // Borrar archivo CSV temporal
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: "CSV procesado correctamente" });
      });

  } catch (error) {
    console.error("Error procesando CSV:", error);
    res.status(500).json({ error: "Error procesando CSV" });
  }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));

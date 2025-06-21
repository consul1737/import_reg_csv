import express, { raw } from "express";
import multer from "multer";
import fs from "fs";
import { parse } from "fast-csv";

import { login } from "./api/login.js";
import { saveRegistroCab } from "./api/saveCab.js";
import { saveRegistroCuerpo } from "./api/saveCuerpo.js";
import { getArticulos } from './api/getArticulos.js';
import { getArticuloDeposito } from './api/getArticuloDeposito.js';
import { buscarArticuloId } from './services.js/articuloHelper.js';

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

        const flowid = 11013;
        const statusflowid = 618;
        const referenciatexto = "telepase"; 

        for (const row of results) {
          


          const cabeceraData = {
            flowid: flowid,
            referenciatexto: referenciatexto,
            clientname: row.clientname,
            currentuser: parseInt(row.currentuser),
            fecha: row.fecha,
            statusid: parseInt(row.statusid),
            statusflowid: statusflowid,
            totalprecio: parseFloat(row.totalprecio),
            totalimpuestos: parseFloat(row.totalimpuestos),
          };


          // 🕵️ LOG: Verificar si referenciatexto está bien cargado
          console.log("DEBUG: cabeceraData.referenciatexto =", cabeceraData.referenciatexto);

          // Enviás al backend (por ejemplo, a saveRegistroCab)
          const cabResponse = await saveRegistroCab(cabeceraData, token);
          console.log("Cabecera guardada:", cabResponse);
         
          const rc =  -1
          const statusId = 1660;
          
         const art = {
          pattern : row.articulo,
          rcabidPadre : rc ,
          statusId : statusId
         }

          console.log("DEBUG: Artículos a buscar:", art);
          const articulos = await getArticulos(art, token);
          console.log("DEBUG: Articulos obtenidos:", articulos);

             
          const depositoData = {
            id: articulos.rows[0].id,
            rcabidPadre : rc,
            statusId : statusId  
          };
          

          console.log("DEBUG: deposito a buscar:", depositoData);
          const articulosDeposito = await getArticuloDeposito(depositoData, token);
          console.log("Articulos en deposito:", articulosDeposito);
          // Buscar el ID del artículo y del depósito 

       const articuloId = buscarArticuloId(articulos.rows, row.articulo);
       const primerStock = articulosDeposito.rows.stock[0];
       if (!primerStock) throw new Error("No hay stock disponible para este artículo");
       const depositoId = primerStock.id;
       //const depositoId = buscarArticuloDepositoId(articulosDeposito.rows, articuloId);
          const cuerpoData = {
            presupcabid: cabResponse.id,
            articulo: row.articulo,
            articulodepositoid: primerStock.id, // Usar el primer depósito disponible
            cantidad: parseFloat(row.cantidad),
            preciounit: parseFloat(row.preciounit),
            preciototal: parseFloat(row.preciototal),
            cuerpoflowid: parseInt(row.cuerpoflowid),
            cuerpostatusid: parseInt(row.cuerpostatusid),
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

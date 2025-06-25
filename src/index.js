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
import { getPerfilPorIdentificador } from './api/getPerfilIPoridentificador.js';
import { formatearFecha } from "./services.js/fechaHelper.js";    

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

        console.log("DEBUG: Resultados del CSV:", results);

        const flowid = 11013;
        const statusflowid = 618;
        const referenciatexto = "telepase"; 
        const rc =  -1
        const statusId = 1660
        const cuerpoflowid = 11013; // Completar según necesidad
        

        for (const row of results) {
  const perfilData = {
    identificador: row['Concesion'],
    statusId: statusId
  };
  console.log("DEBUG: Perfil a buscar:", perfilData);
  const perfilResponse = await getPerfilPorIdentificador(perfilData, token);
  console.log("DEBUG: Perfil obtenido:", perfilResponse);
  const perfil = perfilResponse.rows[0];
  const fechaFormateada = formatearFecha(row['Fecha']);

  const cabeceraData = {
    flowid: flowid,
    referenciatexto: referenciatexto,
    clientid: perfil.id,
    clientname: perfil.identificador,
    currentuser: 1, // Definí quién carga esto o de dónde sale
    obsprodd: row['Dominio'], // Dominio del vehículo
    fecha: fechaFormateada,
    statusid: statusId,
    statusflowid: statusflowid,
  };

  console.log("DEBUG: cabeceraData:", cabeceraData);
  const cabResponse = await saveRegistroCab(cabeceraData, token);
  console.log("Cabecera guardada:", cabResponse);

  const art = {
    pattern: row['Estación'],
    rcabidPadre: rc,
    statusId: statusId
  };

  console.log("DEBUG: Artículos a buscar:", art);
  const articulos = await getArticulos(art, token);
  console.log("DEBUG: Articulos obtenidos:", articulos);

  const depositoData = {
    id: articulos.rows[0].id,
    rcabidPadre: rc,
    statusId: statusId  
  };

  console.log("DEBUG: deposito a buscar:", depositoData);
  const articulosDeposito = await getArticuloDeposito(depositoData, token);
  console.log("Articulos en deposito:", articulosDeposito);

  const articuloId = buscarArticuloId(articulos.rows, row['Estación']);
  const primerStock = articulosDeposito.rows.stock[0];
  if (!primerStock) throw new Error("No hay stock disponible para este artículo");

  const cuerpoData = {
    presupcabid: cabResponse.id,
    articulo: row['Estación'],
    articulodepositoid: primerStock.id,
    cantidad: 1, 
    
    preciounit: parseFloat(row['Importe Final'].replace(',', '.')),
    preciototal: parseFloat(row['Importe Final'].replace(',', '.')),
    cuerpoflowid: cuerpoflowid, // completar según necesidad
    cuerpostatusid: statusId, // o el que corresponda
  };

  console.log("DEBUG: cuerpoData:", cuerpoData);
  // Guardar cuerpo del registro

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

import { login } from "./api/login.js";
import { getFlows } from "./api/getFlows.js";
import { saveRegistroCab } from "./api/saveCab.js";
import { saveRegistroCuerpo } from "./api/saveCuerpo.js";

async function main() {
  const user = await login();
  const token = user.access_token;
  console.log("Login OK", user);

  const flows = await getFlows(token);
  console.log("Flows:", flows);

  const cabeceraData = {
    flowid: 11013,
    referenciatexto: "eliminarImport",
    clientid: 826,
    clientname: "RIVAROSA S.A",
    cuerpos: [],
    currentuser: 38,
    fecha: "2025-06-04",
    statusid: 1660,
    vendedorid: 358,
    xlatitud: -32.3846144,
    xlongitud: -63.258624,
    statusflowid: 618,
    totalprecio: 1,
    totalimpuestos: 1,
  };

  const cabResponse = await saveRegistroCab(cabeceraData, token);
  console.log("Registro cab guardado:", cabResponse);

  const cuerpoData = {
    presupcabid: cabResponse.id, // Este sí, porque ya lo tenemos después de guardar el cab
    articulo: "SATTO",
    articulodepositoid: 2292,
    cantidad: 1,
    preciounit: 1,
    preciototal: 1,
    cuerpoflowid: 11013,
    cuerpostatusid: 1660,
    xlatitud: -32.3846144,
    xlongitud: -63.258624,
  };

  const cuerpoResponse = await saveRegistroCuerpo(cuerpoData, token);
  console.log("Registro cuerpo guardado:", cuerpoResponse);
}

main();

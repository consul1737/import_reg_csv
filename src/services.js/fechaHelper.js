// /services/fechaHelper.js 

export function formatearFecha(fechaCSV) {
  if (!fechaCSV) return null;

  try {
    const [mes, dia, anioHora] = fechaCSV.split('/');
    const [anio, hora] = anioHora.split(' ');

    // Retorna en formato YYYY-MM-DD HH:mm:ss
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')} ${hora}`;
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return null;
  }
}
//   const fechaFormateada = formatearFecha(cabeceraData.fecha);
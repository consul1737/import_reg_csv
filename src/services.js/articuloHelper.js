export function buscarArticuloId(listaArticulos, nombreBuscado) {
  const articulo = listaArticulos.find(item => item.nombre === nombreBuscado);
  if (!articulo) throw new Error(`Articulo no encontrado: ${nombreBuscado}`);
  return articulo.id;
}
/* export function buscarArticuloDepositoId(listaDepositos, articuloId) {
  const deposito = listaDepositos.find(item => item.articuloid === articuloId);
  if (!deposito) throw new Error(`Depósito no encontrado para artículo ID: ${articuloId}`);
  return deposito.depositoid;
} */
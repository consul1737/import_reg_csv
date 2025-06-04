export async function getFlows(token) {
  const response = await fetch("https://api.flowsma.com/donandres/workspace/getFlows/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`  // <-- acá sumamos el token
    },
    body: JSON.stringify({ id: 10323, tipoactividad: 2 })
  });

  return await response.json();
}

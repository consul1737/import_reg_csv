export async function getPerfilPorIdentificador (payload, token) {
  const response = await fetch("https://api.flowsma.com/donandres/workspace/getPerfilPorIdentificador", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // ✅ Token agregado
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
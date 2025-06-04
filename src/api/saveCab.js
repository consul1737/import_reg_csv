export async function saveRegistroCab(payload, token) {
  const response = await fetch("https://api.flowsma.com/donandres/workspace/saveRegistroCab", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // 🔐 token agregado
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}


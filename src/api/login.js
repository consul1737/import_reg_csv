export async function login() {
  const response = await fetch("https://api.flowsma.com/donandres/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Administrador",
      password: "1234",
      rememberMe: false
    })
  });

  const data = await response.json();
  return data; // muchas veces devuelven un token o user info
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    if (user) {
      localStorage.setItem('acosmart_user', user);
      window.location.href = 'materiais.html';
    }
  });
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const senha = document.getElementById("password").value;

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Credenciais inválidas");
      }
      return res.json();
    })
    .then((data) => {
      window.location.href = "alertas.html";
    })
    .catch((err) => {
      alert("Erro ao fazer login: " + err.message);
    });
}); 
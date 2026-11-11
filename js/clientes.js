document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/clientes")
    .then((res) => res.json())
    .then((clientes) => {
      const tbody = document.getElementById("clientesTableBody");
      tbody.innerHTML = "";

      clientes.forEach((cliente) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26]";

        tr.innerHTML = `
          <td class="p-3.5 font-bold">${cliente.nome_razao || "-"}</td>
          <td class="p-3.5">${cliente.cpf_cnpj || "-"}</td>
          <td class="p-3.5">${cliente.telefone || "-"}</td>
          <td class="p-3.5 text-blue-400">${cliente.email || "-"}</td>
          <td class="p-3.5">${cliente.endereco || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao carregar clientes:", err));
});
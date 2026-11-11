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
  fetch("http://localhost:3000/api/fornecedores")
    .then((res) => res.json())
    .then((fornecedores) => {
      const tbody = document.getElementById("fornecedoresTableBody");
      tbody.innerHTML = "";

      fornecedores.forEach((fornecedor) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26]";

        tr.innerHTML = `
          <td class="p-3.5 font-bold">${fornecedor.razao_social || "-"}</td>
          <td class="p-3.5">${fornecedor.cnpj || "-"}</td>
          <td class="p-3.5">${fornecedor.telefone || "-"}</td>
          <td class="p-3.5 text-blue-400">${fornecedor.email || "-"}</td>
          <td class="p-3.5">${fornecedor.cidade || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao carregar fornecedores:", err));
});
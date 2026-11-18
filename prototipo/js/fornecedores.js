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
          <td class="p-3.5 text-right"><a class="px-2.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px]">editar</a>
          <a class="px-2.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px]">remover</a></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao carregar fornecedores:", err));
});
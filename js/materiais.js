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
  const tbody = document.getElementById("materiaisTableBody");

  fetch("http://localhost:3000/api/materiais")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Erro na requisição: Status ${res.status}`);
      }
      return res.json();
    })
    .then((materiais) => {
      tbody.innerHTML = "";

      if (materiais.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-slate-500">Nenhum material cadastrado.</td></tr>`;
        return;
      }

      materiais.forEach((material) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26]";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100">${material.nome || "-"}</td>
          <td class="p-3.5">${material.tipo || "-"}</td>
          <td class="p-3.5">${material.espessura_mm !== null && material.espessura_mm !== undefined ? material.espessura_mm : "-"}</td>
          <td class="p-3.5">${material.unidade || "-"}</td>
          <td class="p-3.5 text-blue-400">${material.descricao || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar materiais:", err);
      tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
});
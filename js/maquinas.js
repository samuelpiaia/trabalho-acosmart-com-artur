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
  const tbody = document.getElementById("maquinasTableBody");

  fetch("http://localhost:3000/api/maquinas")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Erro na requisição: Status ${res.status}`);
      }
      return res.json();
    })
    .then((maquinas) => {
      tbody.innerHTML = "";

      if (maquinas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-3.5 text-center text-slate-500">Nenhuma máquina cadastrada.</td></tr>`;
        return;
      }

      maquinas.forEach((maquina) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26]";

        const statusClass =
          maquina.status && maquina.status.toLowerCase() === "operacional"
            ? "text-emerald-400"
            : maquina.status && maquina.status.toLowerCase() === "parada"
            ? "text-red-400"
            : "text-amber-400";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100">${maquina.nome || "-"}</td>
          <td class="p-3.5">${maquina.tipo || "-"}</td>
          <td class="p-3.5">${maquina.capacidade || "-"}</td>
          <td class="p-3.5 ${statusClass}">${maquina.status || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar máquinas:", err);
      tbody.innerHTML = `<tr><td colspan="4" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
});
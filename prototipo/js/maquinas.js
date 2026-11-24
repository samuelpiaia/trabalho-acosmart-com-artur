document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Conectar botão de Nova Máquina
  const btnNovo = document.getElementById('btnNovaMaquina');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-maquina.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarMaquinas();
});

function carregarMaquinas() {
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
        tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-slate-500">Nenhuma máquina cadastrada.</td></tr>`;
        return;
      }

      maquinas.forEach((maquina) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-colors";

        const statusLower = (maquina.status || "").toLowerCase();
        const statusClass =
          statusLower.includes("oper")
            ? "text-emerald-400"
            : statusLower.includes("parada") || statusLower.includes("inat")
            ? "text-red-400"
            : "text-amber-400";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100 flex items-center gap-1.5">
            <span class="text-blue-400">⚙️</span>
            <span>${maquina.nome || "-"}</span>
          </td>
          <td class="p-3.5">${maquina.tipo || "-"}</td>
          <td class="p-3.5 font-mono text-slate-300">${maquina.capacidade || "-"}</td>
          <td class="p-3.5 ${statusClass} font-semibold">${maquina.status || "-"}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <a href="editar-maquina.html?id=${maquina.ID_maquina}" class="px-2.5 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block shadow">editar</a>
            <button onclick="removerMaquina(${maquina.ID_maquina}, '${(maquina.nome || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">remover</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar máquinas:", err);
      tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
}

// Remover máquina com chamada à API
async function removerMaquina(id, nome) {
  if (!confirm(`Deseja realmente remover o equipamento "${nome}" (ID ${id}) do parque fabril?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/maquinas/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status HTTP ${res.status}`);
    }
    alert('Máquina removida com sucesso!');
    carregarMaquinas();
  } catch (err) {
    alert('Erro ao remover máquina: ' + err.message);
  }
}

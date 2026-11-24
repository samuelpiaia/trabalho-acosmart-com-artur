document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Conectar botão de Novo Material
  const btnNovo = document.getElementById('btnNovoMaterial');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-material.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarMateriais();
});

function carregarMateriais() {
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
        tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-slate-500">Nenhum material cadastrado.</td></tr>`;
        return;
      }

      materiais.forEach((material) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-colors";

        const espessura = material.espessura_mm !== null && material.espessura_mm !== undefined
          ? `${material.espessura_mm} mm`
          : "-";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100 flex items-center gap-1.5">
            <span class="text-blue-400">🧱</span>
            <span>${material.nome || "-"}</span>
          </td>
          <td class="p-3.5">${material.tipo || "-"}</td>
          <td class="p-3.5 font-mono text-blue-400">${espessura}</td>
          <td class="p-3.5">${material.unidade || "-"}</td>
          <td class="p-3.5 text-slate-400 text-xs">${material.descricao || "-"}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <a href="editar-material.html?id=${material.ID_Material}" class="px-2.5 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block shadow">editar</a>
            <button onclick="removerMaterial(${material.ID_Material}, '${(material.nome || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">remover</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar materiais:", err);
      tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
}

// Função para remover material com chamada real ao banco
async function removerMaterial(id, nome) {
  if (!confirm(`Deseja realmente remover o material "${nome}" (ID ${id}) do banco de dados?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/materiais/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status HTTP ${res.status}`);
    }
    alert('Material removido com sucesso!');
    carregarMateriais();
  } catch (err) {
    alert('Erro ao remover material: ' + err.message);
  }
}

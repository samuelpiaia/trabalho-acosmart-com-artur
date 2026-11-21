document.addEventListener('DOMContentLoaded', () => {
  // Validação de sessão do operador
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }

  // Exibir nome do utilizador logado no cabeçalho
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `Operador: ${loggedUser}`;
  }

  // Conectar botão de Adicionar Alertas
  const btnNovo = document.getElementById('btnNovoPedido');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-alerta.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarAlertas();
});

function carregarAlertas() {
  const tbody = document.getElementById("alertasTableBody");

  fetch("http://localhost:3000/api/alertas")
    .then((res) => res.json())
    .then((alertas) => {
      tbody.innerHTML = "";

      if (alertas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-slate-500">Nenhum alerta cadastrado no banco de dados.</td></tr>`;
        return;
      }

      alertas.forEach((alerta) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-colors";

        const nivelClass =
          alerta.nivel && alerta.nivel.toLowerCase().includes("alto")
            ? "text-red-400 font-bold"
            : alerta.nivel && alerta.nivel.toLowerCase().includes("méd")
            ? "text-amber-400 font-semibold"
            : "text-slate-400";

        const resolvidoBadge =
          alerta.resolvido === 1 || alerta.resolvido === true
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">Sim</span>'
            : '<span class="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">Não</span>';

        const dataFormatada = alerta.data
          ? new Date(alerta.data).toLocaleDateString("pt-BR")
          : '<span class="text-slate-500 italic">-</span>';

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100 flex items-center gap-1.5">
            <span class="${alerta.resolvido ? 'text-emerald-400' : 'text-amber-400'}">⚠️</span>
            <span>${alerta.tipo || "-"}</span>
          </td>
          <td class="p-3.5 text-slate-300 text-xs">${alerta.mensagem || "-"}</td>
          <td class="p-3.5 ${nivelClass}">${alerta.nivel || "-"}</td>
          <td class="p-3.5 font-mono text-slate-400">${dataFormatada}</td>
          <td class="p-3.5">${resolvidoBadge}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <a href="editar-alerta.html?id=${alerta.ID_alerta}" class="px-2 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block shadow">editar</a>
            <button onclick="alternarResolvido(${alerta.ID_alerta}, ${alerta.resolvido ? 0 : 1})" class="px-2 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">
              ${alerta.resolvido ? 'Reabrir' : 'Resolver'}
            </button>
            <button onclick="removerAlerta(${alerta.ID_alerta})" class="px-2 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">remover</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar alertas:", err);
      tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-red-400">Erro ao carregar dados do MySQL: ${err.message}</td></tr>`;
    });
}

// Alternar status de resolvido
async function alternarResolvido(id, novoStatus) {
  try {
    const res = await fetch(`http://localhost:3000/api/alertas/${id}`);
    if (!res.ok) throw new Error('Não foi possível obter os dados do alerta');
    const al = await res.json();
    al.resolvido = novoStatus;

    const putRes = await fetch(`http://localhost:3000/api/alertas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(al)
    });
    if (!putRes.ok) throw new Error('Falha ao atualizar status no MySQL');
    carregarAlertas();
  } catch (err) {
    alert('Erro: ' + err.message);
  }
}

// Remover alerta
async function removerAlerta(id) {
  if (!confirm(`Deseja realmente remover o alerta #${id} do banco de dados?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/alertas/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao remover alerta no MySQL');
    alert('Alerta removido com sucesso!');
    carregarAlertas();
  } catch (err) {
    alert('Erro ao remover: ' + err.message);
  }
}

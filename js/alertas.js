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

  // Ação para o botão de marcar todos como lidos
  const btnAcknowledgeAll = document.getElementById('btnAcknowledgeAll');
  if (btnAcknowledgeAll) {
    btnAcknowledgeAll.addEventListener('click', () => {
      alert('Todos os alertas pendentes foram marcados como resolvidos/lidos.');
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/alertas")
    .then((res) => res.json())
    .then((alertas) => {
      const tbody = document.getElementById("alertasTableBody");
      tbody.innerHTML = "";

      alertas.forEach((alerta) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-all";

        const nivelClass =
          alerta.nivel && alerta.nivel.toLowerCase() === "alto"
            ? "text-red-400"
            : alerta.nivel && alerta.nivel.toLowerCase() === "médio"
            ? "text-amber-400"
            : "text-slate-400";

        const resolvidoBadge =
          alerta.resolvido === 1 || alerta.resolvido === true
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">Sim</span>'
            : '<span class="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">Não</span>';

        const dataFormatada = alerta.data
          ? new Date(alerta.data).toLocaleDateString("pt-BR")
          : '<span class="text-slate-500 italic">-</span>';

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100">${alerta.tipo || "-"}</td>
          <td class="p-3.5">${alerta.mensagem || "-"}</td>
          <td class="p-3.5 ${nivelClass}">${alerta.nivel || "-"}</td>
          <td class="p-3.5">${dataFormatada}</td>
          <td class="p-3.5">${resolvidoBadge}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao carregar alertas:", err));
});
document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Conectar botão de Nova Ordem de Produção
  const btnNovoPedido = document.getElementById('btnNovoPedido');
  if (btnNovoPedido) {
    btnNovoPedido.addEventListener('click', () => {
      window.location.href = 'novo-pedido.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarPedidos();
});

function carregarPedidos() {
  const tbody = document.getElementById("pedidosTableBody");

  fetch("http://localhost:3000/api/pedidos")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Erro na requisição: Status ${res.status}`);
      }
      return res.json();
    })
    .then((pedidos) => {
      tbody.innerHTML = "";

      if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-3.5 text-center text-slate-500">Nenhum pedido cadastrado no banco.</td></tr>`;
        return;
      }

      pedidos.forEach((pedido) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-colors";

        const dataPedido = pedido.data_pedido
          ? new Date(pedido.data_pedido).toLocaleDateString("pt-BR")
          : "-";
        const prazoEntrega = pedido.prazo_entrega
          ? new Date(pedido.prazo_entrega).toLocaleDateString("pt-BR")
          : "-";
        const valorTotal = pedido.valor_total
          ? `R$ ${parseFloat(pedido.valor_total).toFixed(2)}`
          : "-";

        const statusLower = (pedido.status || "").toLowerCase();
        const statusBadge =
          statusLower.includes("concl")
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">Concluído</span>'
            : statusLower.includes("prod") || statusLower.includes("andamento")
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-400 border border-blue-800 font-semibold">Em Produção</span>'
            : '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800 font-semibold">Aguardando</span>';

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100 font-mono-tech">#ORD-${pedido.ID_pedido}</td>
          <td class="p-3.5 font-medium text-slate-200">${pedido.cliente || `Cliente #${pedido.ID_cliente || '-'}`}</td>
          <td class="p-3.5 font-mono text-slate-400">${dataPedido}</td>
          <td class="p-3.5 font-mono text-slate-400">${prazoEntrega}</td>
          <td class="p-3.5 text-emerald-400 font-bold font-mono">${valorTotal}</td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <a href="editar-pedido.html?id=${pedido.ID_pedido}" class="px-2 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block shadow">editar</a>
            <a href="oficina.html" class="px-2 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">Executar</a>
            <button onclick="cancelarPedido(${pedido.ID_pedido})" class="px-2 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">cancelar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar pedidos:", err);
      tbody.innerHTML = `<tr><td colspan="7" class="p-3.5 text-center text-red-400">Erro ao carregar dados do MySQL: ${err.message}</td></tr>`;
    });
}

// Cancelar / Excluir Pedido no MySQL
async function cancelarPedido(id) {
  if (!confirm(`Deseja realmente cancelar/remover a Ordem de Produção #ORD-${id} do banco de dados?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status HTTP ${res.status}`);
    }
    alert('Pedido cancelado com sucesso no MySQL!');
    carregarPedidos();
  } catch (err) {
    alert('Erro ao cancelar pedido: ' + err.message);
  }
}

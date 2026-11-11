document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  const btnNovoPedido = document.getElementById('btnNovoPedido');
  if (btnNovoPedido) {
    btnNovoPedido.addEventListener('click', () => {
      alert('Nova ordem de produção configurada! A redirecionar para a oficina.');
      window.location.href = 'oficina.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
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
        tbody.innerHTML = `<tr><td colspan="7" class="p-3.5 text-center text-slate-500">Nenhum pedido cadastrado.</td></tr>`;
        return;
      }

      pedidos.forEach((pedido) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-all";

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
          statusLower === "concluído" || statusLower === "concluido"
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">Concluído</span>'
            : statusLower === "em andamento" || statusLower === "em fila"
            ? '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">Em Fila</span>'
            : `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">${pedido.status || "-"}</span>`;

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100">#ORD-${pedido.ID_pedido}</td>
          <td class="p-3.5">${pedido.cliente || "-"}</td>
          <td class="p-3.5">${dataPedido}</td>
          <td class="p-3.5">${prazoEntrega}</td>
          <td class="p-3.5 text-emerald-400 font-bold">${valorTotal}</td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right"><a href="oficina.html" class="px-2.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px]">Executar</a></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar pedidos:", err);
      tbody.innerHTML = `<tr><td colspan="7" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
});
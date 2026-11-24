document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Conectar botão de Novo Cliente
  const btnNovo = document.getElementById('btnNovoPedido');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-cliente.html';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarClientes();
});

function carregarClientes() {
  const tbody = document.getElementById("clientesTableBody");

  fetch("http://localhost:3000/api/clientes")
    .then((res) => res.json())
    .then((clientes) => {
      tbody.innerHTML = "";

      if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-slate-500">Nenhum cliente cadastrado no banco.</td></tr>`;
        return;
      }

      clientes.forEach((cliente) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26] transition-colors";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100 flex items-center gap-1.5">
            <span class="text-blue-400">🏢</span>
            <span>${cliente.nome_razao || "-"}</span>
          </td>
          <td class="p-3.5 font-mono text-slate-300">${cliente.cpf_cnpj || "-"}</td>
          <td class="p-3.5 font-mono text-slate-400">${cliente.telefone || "-"}</td>
          <td class="p-3.5 text-blue-400">${cliente.email || "-"}</td>
          <td class="p-3.5 text-slate-400 text-xs">${cliente.endereco || "-"}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <a href="editar-cliente.html?id=${cliente.ID_cliente}" class="px-2.5 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block shadow">editar</a>
            <button onclick="removerCliente(${cliente.ID_cliente}, '${(cliente.nome_razao || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech inline-block shadow ml-1">remover</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar clientes:", err);
      tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-red-400">Erro ao carregar dados do MySQL: ${err.message}</td></tr>`;
    });
}

// Remover cliente no MySQL
async function removerCliente(id, nome) {
  if (!confirm(`Deseja realmente remover o cliente "${nome}" (ID ${id}) do banco de dados?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/clientes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status HTTP ${res.status}`);
    }
    alert('Cliente removido com sucesso!');
    carregarClientes();
  } catch (err) {
    alert('Erro ao remover cliente: ' + err.message);
  }
}

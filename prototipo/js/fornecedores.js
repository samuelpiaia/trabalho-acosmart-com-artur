// fornecedores.js - Conexão e Ações da Tabela de Fornecedores AçoSmart

document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Botão Novo Fornecedor
  const btnNovo = document.getElementById('btnNovoPedido');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-fornecedor.html';
    });
  }

  carregarFornecedores();
});

async function carregarFornecedores() {
  const tbody = document.getElementById('fornecedoresTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('http://localhost:3000/api/fornecedores');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const fornecedores = await res.json();

    tbody.innerHTML = '';

    if (fornecedores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-slate-500 font-mono-tech text-xs">Nenhum fornecedor cadastrado no banco.</td></tr>`;
      return;
    }

    fornecedores.forEach((fornecedor) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-[#1a1e26] border-b border-[#222631] transition-colors';

      tr.innerHTML = `
        <td class="p-3.5 font-bold text-slate-100">${fornecedor.razao_social || '-'}</td>
        <td class="p-3.5 font-mono text-slate-300">${fornecedor.cnpj || '-'}</td>
        <td class="p-3.5 text-slate-400">${fornecedor.telefone || '-'}</td>
        <td class="p-3.5 text-blue-400">${fornecedor.email || '-'}</td>
        <td class="p-3.5 text-slate-300">${fornecedor.cidade || '-'}</td>
        <td class="p-3.5 text-right space-x-1">
          <a href="editar-fornecedor.html?id=${fornecedor.ID_Fornecedor}" class="px-2.5 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block font-semibold transition-colors">
            editar
          </a>
          <button onclick="removerFornecedor(${fornecedor.ID_Fornecedor}, '${(fornecedor.razao_social || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech font-semibold transition-colors">
            remover
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar fornecedores:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-red-400 font-mono-tech text-xs">Erro ao carregar fornecedores: ${err.message}</td></tr>`;
  }
}

async function removerFornecedor(id, nome) {
  if (!confirm(`Confirma a remoção do fornecedor "${nome}" (ID ${id})?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/fornecedores/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Status HTTP ${res.status}`);
    }

    alert(`Fornecedor "${nome}" removido com sucesso.`);
    carregarFornecedores();
  } catch (err) {
    console.error('Erro ao remover fornecedor:', err);
    alert('Erro ao remover fornecedor: ' + err.message);
  }
}

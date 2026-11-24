// usuarios.js - Conexão e Ações da Tabela de Usuários/Colaboradores AçoSmart

document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  // Botão Novo Usuário
  const btnNovo = document.getElementById('btnNovoPedido');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      window.location.href = 'novo-usuario.html';
    });
  }

  carregarUsuarios();
});

async function carregarUsuarios() {
  const tbody = document.getElementById('usuariosTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('http://localhost:3000/api/usuarios');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const usuarios = await res.json();

    tbody.innerHTML = '';

    if (usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-slate-500 font-mono-tech text-xs">Nenhum usuário cadastrado no banco.</td></tr>`;
      return;
    }

    usuarios.forEach((usuario) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-[#1a1e26] border-b border-[#222631] transition-colors';

      const perfilClass =
        usuario.perfil && usuario.perfil.toLowerCase() === 'admin'
          ? 'text-amber-400 font-bold'
          : 'text-slate-300';

      const statusClass =
        usuario.status && usuario.status.toLowerCase() === 'ativo'
          ? 'text-emerald-400 font-bold'
          : 'text-red-400 font-bold';

      tr.innerHTML = `
        <td class="p-3.5 font-bold text-slate-100">${usuario.nome || '-'}</td>
        <td class="p-3.5 text-blue-400">${usuario.email || '-'}</td>
        <td class="p-3.5 font-mono text-slate-500">••••••••</td>
        <td class="p-3.5 ${perfilClass}">${usuario.perfil || '-'}</td>
        <td class="p-3.5 ${statusClass}">${usuario.status || '-'}</td>
        <td class="p-3.5 text-right space-x-1">
          <a href="editar-usuario.html?id=${usuario.ID_colaborador}" class="px-2.5 py-1 bg-[#008000] hover:bg-[#007300] text-white rounded text-[11px] font-mono-tech inline-block font-semibold transition-colors">
            editar
          </a>
          <button onclick="removerUsuario(${usuario.ID_colaborador}, '${(usuario.nome || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-[#CC0000] hover:bg-[#A30000] text-white rounded text-[11px] font-mono-tech font-semibold transition-colors">
            remover
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-3.5 text-center text-red-400 font-mono-tech text-xs">Erro ao carregar usuários: ${err.message}</td></tr>`;
  }
}

async function removerUsuario(id, nome) {
  if (!confirm(`Confirma a remoção do usuário "${nome}" (ID ${id})?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Status HTTP ${res.status}`);
    }

    alert(`Usuário "${nome}" removido com sucesso.`);
    carregarUsuarios();
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    alert('Erro ao remover usuário: ' + err.message);
  }
}

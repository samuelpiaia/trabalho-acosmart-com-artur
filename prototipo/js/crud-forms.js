// crud-forms.js - Funções compartilhadas para formulários de Edição e Criação no AçoSmart

// 1. Inicializa a validação da sessão do operador
document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user') || 'Admin';
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `Operador: ${loggedUser}`;
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('acosmart_user');
      window.location.href = 'login.html';
    });
  }
});

// 2. Extrai parâmetro da URL
function getUrlParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// 3. Helper para carregar dropdowns com dados de outras tabelas
async function popularSelect(selectId, endpoint, valueKey, textKey, selectedValue = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch(`http://localhost:3000${endpoint}`);
    if (res.ok) {
      const items = await res.json();
      select.innerHTML = '<option value="">-- Selecione uma opção --</option>';
      items.forEach((item) => {
        const opt = document.createElement('option');
        opt.value = item[valueKey];
        opt.textContent = typeof textKey === 'function' ? textKey(item) : item[textKey];
        if (selectedValue && String(item[valueKey]) === String(selectedValue)) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn(`Não foi possível carregar opções de ${endpoint}:`, err);
  }
}

// 4. Exibe mensagem de feedback visual
function exibirMensagem(tipo, texto) {
  const container = document.getElementById('msgFeedback');
  if (!container) {
    alert(texto);
    return;
  }

  container.className = tipo === 'sucesso'
    ? 'p-3 rounded text-xs font-mono-tech bg-emerald-950 text-emerald-300 border border-emerald-800 mb-4 flex items-center justify-between'
    : 'p-3 rounded text-xs font-mono-tech bg-red-950 text-red-300 border border-red-800 mb-4 flex items-center justify-between';

  container.innerHTML = `
    <span>${tipo === 'sucesso' ? '✅' : '❌'} ${texto}</span>
    <button type="button" onclick="this.parentElement.classList.add('hidden')" class="text-slate-400 hover:text-white">✕</button>
  `;
  container.classList.remove('hidden');
}

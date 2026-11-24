// form-usuario.js - Edição e Cadastro de Usuários/Colaboradores no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoUsuario');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');
  const senhaHelper = document.getElementById('senhaHelper');
  const inputSenha = document.getElementById('senha');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>👥</span> Editar dados do usuário';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize credenciais de acesso, perfil de permissão e status operacional.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Usuário USR-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `USR-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição do usuário USR-${String(id).padStart(3, '0')}`;
    if (senhaHelper) senhaHelper.textContent = 'Deixe em branco para manter a senha atual.';
    if (inputSenha) inputSenha.required = false;

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`);
      if (res.ok) {
        const u = await res.json();
        document.getElementById('nome').value = u.nome || '';
        document.getElementById('email').value = u.email || '';
        document.getElementById('perfil').value = u.perfil || 'Operador';
        document.getElementById('status').value = u.status || 'Ativo';
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Usuário não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar o usuário do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>👥</span> Cadastrar novo usuário';
    if (pageSubtitle) pageSubtitle.textContent = 'Crie um novo acesso de colaborador ao sistema operacional da fábrica.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Novo Cadastro';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Usuário';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Cadastrar usuário';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo cadastro de colaborador';
    if (senhaHelper) senhaHelper.textContent = 'Defina a senha de acesso inicial do colaborador.';
    if (inputSenha) inputSenha.required = true;
  }

  // Resumo lateral em tempo real
  ['nome', 'email', 'perfil', 'status'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
    document.getElementById(fieldId)?.addEventListener('change', atualizarResumo);
  });

  function atualizarResumo() {
    const nome = document.getElementById('nome')?.value || 'Não informado';
    const email = document.getElementById('email')?.value || 'Não informado';
    const perfil = document.getElementById('perfil')?.value || 'Operador';
    const status = document.getElementById('status')?.value || 'Ativo';

    document.getElementById('resumoNome').textContent = nome;
    document.getElementById('resumoEmail').textContent = email;

    const perfilEl = document.getElementById('resumoPerfilBadge');
    if (perfilEl) {
      perfilEl.textContent = perfil;
      perfilEl.className = perfil.toLowerCase() === 'admin' 
        ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800'
        : 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800';
    }

    const statusEl = document.getElementById('resumoStatusBadge');
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.className = status.toLowerCase() === 'ativo'
        ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800'
        : 'px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800';
    }
  }

  // Submissão do Formulário
  const form = document.getElementById('formUsuario');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const perfil = document.getElementById('perfil').value;
      const status = document.getElementById('status').value;
      const senha = document.getElementById('senha').value.trim();

      if (!nome || !email) {
        exibirMensagem('erro', 'Nome e Email são obrigatórios.');
        return;
      }

      if (!isEdit && !senha) {
        exibirMensagem('erro', 'A senha é obrigatória para novos usuários.');
        return;
      }

      const payload = {
        nome,
        email,
        perfil,
        status
      };

      if (senha) {
        payload.senha = senha;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/usuarios/${id}`
          : 'http://localhost:3000/api/usuarios';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Status HTTP ${res.status}`);
        }

        exibirMensagem('sucesso', isEdit ? 'Usuário atualizado com sucesso no MySQL!' : 'Usuário cadastrado com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'usuarios.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar usuário:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Cadastrar usuário';
      }
    });
  }
});

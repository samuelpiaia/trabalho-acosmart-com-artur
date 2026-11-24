// form-fornecedor.js - Edição e Cadastro de Fornecedores no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoFornecedor');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>🚚</span> Editar dados do fornecedor';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize as informações fiscais, suprimentos e contatos da siderúrgica.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Fornecedor FOR-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `FOR-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição do fornecedor FOR-${String(id).padStart(3, '0')}`;

    try {
      const res = await fetch(`http://localhost:3000/api/fornecedores/${id}`);
      if (res.ok) {
        const f = await res.json();
        document.getElementById('razao_social').value = f.razao_social || '';
        document.getElementById('cnpj').value = f.cnpj || '';
        document.getElementById('email').value = f.email || '';
        document.getElementById('telefone').value = f.telefone || '';
        document.getElementById('cidade').value = f.cidade || '';
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Fornecedor não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar o fornecedor do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>🚚</span> Cadastrar novo fornecedor';
    if (pageSubtitle) pageSubtitle.textContent = 'Cadastre uma nova siderúrgica ou distribuidor de matéria-prima.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Novo Cadastro';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Fornecedor';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Cadastrar fornecedor';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo cadastro de fornecedor';
  }

  // 3. Resumo lateral em tempo real
  ['razao_social', 'cnpj', 'email', 'telefone', 'cidade'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
  });

  function atualizarResumo() {
    const nome = document.getElementById('razao_social')?.value || 'Não informado';
    const doc = document.getElementById('cnpj')?.value || 'Não informado';
    const email = document.getElementById('email')?.value || 'Não informado';
    const tel = document.getElementById('telefone')?.value || '-';
    const cid = document.getElementById('cidade')?.value || '-';

    document.getElementById('resumoNome').textContent = nome;
    document.getElementById('resumoDoc').textContent = doc;
    document.getElementById('resumoEmail').textContent = email;
    document.getElementById('resumoTel').textContent = tel;
    document.getElementById('resumoCidade').textContent = cid;
  }

  // 4. Submissão
  const form = document.getElementById('formFornecedor');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        razao_social: document.getElementById('razao_social').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        cidade: document.getElementById('cidade').value.trim()
      };

      if (!payload.razao_social || !payload.cnpj) {
        exibirMensagem('erro', 'Razão Social e CNPJ são obrigatórios.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/fornecedores/${id}`
          : 'http://localhost:3000/api/fornecedores';
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

        exibirMensagem('sucesso', isEdit ? 'Fornecedor atualizado com sucesso no MySQL!' : 'Fornecedor cadastrado com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'fornecedores.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar fornecedor:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Cadastrar fornecedor';
      }
    });
  }
});

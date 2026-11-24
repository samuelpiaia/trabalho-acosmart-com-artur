// form-cliente.js - Edição e Cadastro de Clientes no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoCliente');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>🏢</span> Editar dados do cliente';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize as informações cadastrais e contatos da indústria parceira.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Cliente CLI-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `CLI-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição do cliente CLI-${String(id).padStart(3, '0')}`;

    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${id}`);
      if (res.ok) {
        const cli = await res.json();
        document.getElementById('nome_razao').value = cli.nome_razao || '';
        document.getElementById('cpf_cnpj').value = cli.cpf_cnpj || '';
        document.getElementById('email').value = cli.email || '';
        document.getElementById('telefone').value = cli.telefone || '';
        document.getElementById('endereco').value = cli.endereco || '';
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Cliente não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar o cliente do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>🏢</span> Cadastrar novo cliente';
    if (pageSubtitle) pageSubtitle.textContent = 'Registre uma nova indústria, caldeiraria ou parceiro comercial.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Novo Cadastro';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Cliente';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Cadastrar cliente';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo cadastro de cliente';
  }

  // 3. Resumo lateral em tempo real
  ['nome_razao', 'cpf_cnpj', 'email', 'telefone', 'endereco'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
  });

  function atualizarResumo() {
    const nome = document.getElementById('nome_razao')?.value || 'Não informado';
    const doc = document.getElementById('cpf_cnpj')?.value || 'Não informado';
    const email = document.getElementById('email')?.value || 'Não informado';
    const tel = document.getElementById('telefone')?.value || '-';
    const end = document.getElementById('endereco')?.value || '-';

    document.getElementById('resumoNome').textContent = nome;
    document.getElementById('resumoDoc').textContent = doc;
    document.getElementById('resumoEmail').textContent = email;
    document.getElementById('resumoTel').textContent = tel;
    document.getElementById('resumoEnd').textContent = end.length > 50 ? end.substring(0, 47) + '...' : end;
  }

  // 4. Submissão
  const form = document.getElementById('formCliente');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        nome_razao: document.getElementById('nome_razao').value.trim(),
        cpf_cnpj: document.getElementById('cpf_cnpj').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        endereco: document.getElementById('endereco').value.trim()
      };

      if (!payload.nome_razao || !payload.cpf_cnpj) {
        exibirMensagem('erro', 'Nome/Razão Social e CPF/CNPJ são obrigatórios.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/clientes/${id}`
          : 'http://localhost:3000/api/clientes';
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

        exibirMensagem('sucesso', isEdit ? 'Cliente atualizado com sucesso no MySQL!' : 'Cliente cadastrado com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'clientes.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar cliente:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Cadastrar cliente';
      }
    });
  }
});

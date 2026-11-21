// form-material.js - Edição e Cadastro de Materiais no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  // 1. Carregar lista de Fornecedores para o select
  await popularSelect('ID_Fornecedor', '/api/fornecedores', 'ID_Fornecedor', (f) => `${f.razao_social} (${f.cnpj})`);

  // 2. Configurar elementos na tela dependendo do modo (Editar ou Novo)
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoMaterial');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>🧱</span> Editar dados do material';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize o cadastro e os parâmetros utilizados nas operações.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Item MAT-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `MAT-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição do material MAT-${String(id).padStart(3, '0')}`;

    // Buscar dados do banco
    try {
      const res = await fetch(`http://localhost:3000/api/materiais/${id}`);
      if (res.ok) {
        const mat = await res.json();
        document.getElementById('nome').value = mat.nome || '';
        document.getElementById('tipo').value = mat.tipo || '';
        document.getElementById('espessura_mm').value = mat.espessura_mm || '';
        document.getElementById('unidade').value = mat.unidade || '';
        document.getElementById('descricao').value = mat.descricao || '';
        if (mat.ID_Fornecedor) {
          document.getElementById('ID_Fornecedor').value = mat.ID_Fornecedor;
        }
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Material não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível conectar ao MySQL para carregar o registro.');
    }
  } else {
    // Modo Novo Cadastro
    if (pageTitle) pageTitle.innerHTML = '<span>🧱</span> Cadastrar novo material';
    if (pageSubtitle) pageSubtitle.textContent = 'Insira as especificações técnicas da nova liga metálica no estoque.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Novo Cadastro';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Item';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Cadastrar material';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo cadastro de material';
  }

  // 3. Atualizar Resumo Lateral em Tempo Real conforme o usuário digita
  ['nome', 'tipo', 'espessura_mm', 'unidade', 'descricao'].forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    if (el) el.addEventListener('input', atualizarResumo);
  });
  document.getElementById('ID_Fornecedor')?.addEventListener('change', atualizarResumo);

  function atualizarResumo() {
    const nome = document.getElementById('nome')?.value || 'Não informado';
    const tipo = document.getElementById('tipo')?.value || 'Não informado';
    const espessura = document.getElementById('espessura_mm')?.value;
    const unidade = document.getElementById('unidade')?.value || 'un';
    const desc = document.getElementById('descricao')?.value || '-';

    document.getElementById('resumoNome').textContent = nome;
    document.getElementById('resumoTipo').textContent = tipo;
    document.getElementById('resumoEspessura').textContent = espessura ? `${espessura} mm` : 'Padrão / Não apl.';
    document.getElementById('resumoUnidade').textContent = unidade;
    document.getElementById('resumoDesc').textContent = desc.length > 50 ? desc.substring(0, 47) + '...' : desc;
  }

  // 4. Submissão do Formulário
  const form = document.getElementById('formMaterial');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        nome: document.getElementById('nome').value.trim(),
        tipo: document.getElementById('tipo').value.trim(),
        espessura_mm: parseFloat(document.getElementById('espessura_mm').value) || null,
        unidade: document.getElementById('unidade').value.trim(),
        ID_Fornecedor: parseInt(document.getElementById('ID_Fornecedor').value) || null,
        descricao: document.getElementById('descricao').value.trim()
      };

      if (!payload.nome) {
        exibirMensagem('erro', 'O nome do material é obrigatório.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/materiais/${id}`
          : 'http://localhost:3000/api/materiais';
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

        exibirMensagem('sucesso', isEdit ? 'Material atualizado com sucesso no MySQL!' : 'Material cadastrado com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'materiais.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar material:', err);
        exibirMensagem('erro', 'Erro ao salvar no banco de dados: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Cadastrar material';
      }
    });
  }
});

// form-maquina.js - Edição e Cadastro de Máquinas Industriais no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  // 1. Carregar lista de Operadores/Usuários para o select de responsável
  await popularSelect('ID_colaborador', '/api/usuarios', 'ID_colaborador', (u) => `${u.nome} (${u.perfil})`);

  // 2. Configurar elementos
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoMaquina');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>⚙️</span> Editar dados da máquina';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize as especificações técnicas, calibragem e status operacional.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Equipamento MAQ-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `MAQ-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição da máquina MAQ-${String(id).padStart(3, '0')}`;

    try {
      const res = await fetch(`http://localhost:3000/api/maquinas/${id}`);
      if (res.ok) {
        const maq = await res.json();
        document.getElementById('nome').value = maq.nome || '';
        document.getElementById('tipo').value = maq.tipo || '';
        document.getElementById('capacidade').value = maq.capacidade || '';
        document.getElementById('status').value = maq.status || 'Operacional';
        if (maq.ID_colaborador) {
          document.getElementById('ID_colaborador').value = maq.ID_colaborador;
        }
        if (maq.ultima_manutencao) {
          document.getElementById('ultima_manutencao').value = maq.ultima_manutencao.split('T')[0];
        }
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Máquina não encontrada no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar o equipamento do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>⚙️</span> Cadastrar nova máquina';
    if (pageSubtitle) pageSubtitle.textContent = 'Insira uma nova estação de usinagem ou corte no parque fabril.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Novo Cadastro';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Nova Estação';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Cadastrar máquina';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo cadastro de equipamento fabril';
  }

  // 3. Resumo lateral em tempo real
  ['nome', 'tipo', 'capacidade', 'status', 'ultima_manutencao'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
    document.getElementById(fieldId)?.addEventListener('change', atualizarResumo);
  });
  document.getElementById('ID_colaborador')?.addEventListener('change', atualizarResumo);

  function atualizarResumo() {
    const nome = document.getElementById('nome')?.value || 'Não informado';
    const tipo = document.getElementById('tipo')?.value || 'Não informado';
    const cap = document.getElementById('capacidade')?.value || 'Não definida';
    const st = document.getElementById('status')?.value || 'Operacional';
    const man = document.getElementById('ultima_manutencao')?.value || 'Não registrada';

    document.getElementById('resumoNome').textContent = nome;
    document.getElementById('resumoTipo').textContent = tipo;
    document.getElementById('resumoCapacidade').textContent = cap;
    document.getElementById('resumoManutencao').textContent = man;

    const badge = document.getElementById('resumoStatusBadge');
    if (badge) {
      badge.textContent = st;
      badge.className = st.toLowerCase().includes('oper')
        ? 'px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800'
        : st.toLowerCase().includes('manut')
        ? 'px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800'
        : 'px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800';
    }
  }

  // 4. Submissão do Formulário
  const form = document.getElementById('formMaquina');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        nome: document.getElementById('nome').value.trim(),
        tipo: document.getElementById('tipo').value.trim(),
        capacidade: document.getElementById('capacidade').value.trim(),
        status: document.getElementById('status').value.trim(),
        ID_colaborador: parseInt(document.getElementById('ID_colaborador').value) || null,
        ultima_manutencao: document.getElementById('ultima_manutencao').value || null
      };

      if (!payload.nome) {
        exibirMensagem('erro', 'O nome do equipamento é obrigatório.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/maquinas/${id}`
          : 'http://localhost:3000/api/maquinas';
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

        exibirMensagem('sucesso', isEdit ? 'Máquina atualizada com sucesso no MySQL!' : 'Máquina cadastrada com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'maquinas.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar máquina:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Cadastrar máquina';
      }
    });
  }
});

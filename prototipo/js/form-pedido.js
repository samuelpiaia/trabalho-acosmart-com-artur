// form-pedido.js - Edição e Cadastro de Pedidos / Ordens de Produção no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  // 1. Carregar lista de Clientes para o select
  await popularSelect('ID_cliente', '/api/clientes', 'ID_cliente', (c) => `${c.nome_razao} (${c.cpf_cnpj})`);

  // 2. Configurar elementos
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoPedido');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>📋</span> Editar ordem de produção';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize os dados do pedido, prazos de entrega e status operacional.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Ordem #ORD-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `#ORD-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição da ordem #ORD-${String(id).padStart(3, '0')}`;

    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}`);
      if (res.ok) {
        const ped = await res.json();
        document.getElementById('ID_cliente').value = ped.ID_cliente || '';
        document.getElementById('valor_total').value = ped.valor_total || '0';
        document.getElementById('status').value = ped.status || 'Aguardando';
        if (ped.prazo_entrega) {
          document.getElementById('prazo_entrega').value = ped.prazo_entrega.split('T')[0];
        }
        if (ped.data_pedido) {
          document.getElementById('data_pedido').value = ped.data_pedido.split('T')[0];
        }
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Pedido não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar a ordem do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>📋</span> Nova Ordem de Produção';
    if (pageSubtitle) pageSubtitle.textContent = 'Cadastre um novo pedido industrial para corte e roteamento da fábrica.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Nova Ordem';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Pedido';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Criar ordem de produção';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Nova ordem de produção';
    // Data de hoje padrão
    document.getElementById('data_pedido').value = new Date().toISOString().split('T')[0];
  }

  // 3. Resumo lateral em tempo real
  ['ID_cliente', 'valor_total', 'prazo_entrega', 'status'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
    document.getElementById(fieldId)?.addEventListener('change', atualizarResumo);
  });

  function atualizarResumo() {
    const selCliente = document.getElementById('ID_cliente');
    const clienteText = selCliente && selCliente.selectedIndex > 0
      ? selCliente.options[selCliente.selectedIndex].text.split('(')[0].trim()
      : 'Não selecionado';
    const valor = parseFloat(document.getElementById('valor_total')?.value) || 0;
    const prazo = document.getElementById('prazo_entrega')?.value || 'Não definido';
    const st = document.getElementById('status')?.value || 'Aguardando';

    document.getElementById('resumoCliente').textContent = clienteText;
    document.getElementById('resumoValor').textContent = `R$ ${valor.toFixed(2)}`;
    document.getElementById('resumoPrazo').textContent = prazo;

    const badge = document.getElementById('resumoStatusBadge');
    if (badge) {
      badge.textContent = st;
      const sLower = st.toLowerCase();
      badge.className = sLower.includes('concl')
        ? 'px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800'
        : sLower.includes('prod') || sLower.includes('andamento')
        ? 'px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-400 border border-blue-800'
        : 'px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800';
    }
  }

  // 4. Submissão do Formulário
  const form = document.getElementById('formPedido');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        ID_cliente: parseInt(document.getElementById('ID_cliente').value),
        data_pedido: document.getElementById('data_pedido').value || new Date(),
        prazo_entrega: document.getElementById('prazo_entrega').value || null,
        valor_total: parseFloat(document.getElementById('valor_total').value) || 0,
        status: document.getElementById('status').value.trim()
      };

      if (!payload.ID_cliente) {
        exibirMensagem('erro', 'Selecione um cliente para vincular à ordem.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/pedidos/${id}`
          : 'http://localhost:3000/api/pedidos';
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

        exibirMensagem('sucesso', isEdit ? 'Ordem atualizada com sucesso no MySQL!' : 'Ordem de produção criada com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'pedidos.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar pedido:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Criar ordem de produção';
      }
    });
  }
});

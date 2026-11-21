// form-alerta.js - Edição e Registro de Alertas no AçoSmart

document.addEventListener('DOMContentLoaded', async () => {
  const id = getUrlParam('id');
  const isEdit = Boolean(id) && !window.location.pathname.includes('novo');

  // 1. Carregar lista de Usuários para o select
  await popularSelect('ID_usuario', '/api/usuarios', 'ID_colaborador', (u) => `${u.nome} (${u.perfil})`);

  // 2. Configurar elementos
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const breadcrumbAction = document.getElementById('breadcrumbAction');
  const breadcrumbItem = document.getElementById('breadcrumbItem');
  const codigoInput = document.getElementById('codigoAlerta');
  const btnSalvar = document.getElementById('btnSalvar');
  const bottomBarTitle = document.getElementById('bottomBarTitle');

  if (isEdit) {
    if (pageTitle) pageTitle.innerHTML = '<span>⚠️</span> Editar alerta / ocorrência';
    if (pageSubtitle) pageSubtitle.textContent = 'Atualize os detalhes, criticidade e status de resolução da ocorrência.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Edição';
    if (breadcrumbItem) breadcrumbItem.textContent = `Alerta ALT-${String(id).padStart(3, '0')}`;
    if (codigoInput) codigoInput.value = `ALT-${String(id).padStart(3, '0')}`;
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (bottomBarTitle) bottomBarTitle.textContent = `Edição do alerta ALT-${String(id).padStart(3, '0')}`;

    try {
      const res = await fetch(`http://localhost:3000/api/alertas/${id}`);
      if (res.ok) {
        const al = await res.json();
        document.getElementById('tipo').value = al.tipo || '';
        document.getElementById('nivel').value = al.nivel || 'Médio';
        document.getElementById('mensagem').value = al.mensagem || '';
        document.getElementById('resolvido').value = (al.resolvido === 1 || al.resolvido === true) ? '1' : '0';
        if (al.ID_usuario) {
          document.getElementById('ID_usuario').value = al.ID_usuario;
        }
        atualizarResumo();
      } else {
        exibirMensagem('erro', 'Alerta não encontrado no banco de dados.');
      }
    } catch (err) {
      console.warn('Erro ao conectar com MySQL:', err);
      exibirMensagem('erro', 'Não foi possível carregar o alerta do MySQL.');
    }
  } else {
    // Modo Novo
    if (pageTitle) pageTitle.innerHTML = '<span>⚠️</span> Registrar novo alerta';
    if (pageSubtitle) pageSubtitle.textContent = 'Notifique anomalias em máquinas, estoque baixo ou desvios de qualidade.';
    if (breadcrumbAction) breadcrumbAction.textContent = 'Nova Ocorrência';
    if (breadcrumbItem) breadcrumbItem.textContent = 'Novo Alerta';
    if (codigoInput) codigoInput.value = '[Automático após salvar]';
    if (btnSalvar) btnSalvar.textContent = '+ Registrar alerta';
    if (bottomBarTitle) bottomBarTitle.textContent = 'Novo registro de ocorrência';
  }

  // 3. Resumo lateral em tempo real
  ['tipo', 'nivel', 'resolvido', 'mensagem'].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener('input', atualizarResumo);
    document.getElementById(fieldId)?.addEventListener('change', atualizarResumo);
  });
  document.getElementById('ID_usuario')?.addEventListener('change', atualizarResumo);

  function atualizarResumo() {
    const tipo = document.getElementById('tipo')?.value || 'Não informado';
    const nivel = document.getElementById('nivel')?.value || 'Médio';
    const resolvido = document.getElementById('resolvido')?.value === '1';
    const msg = document.getElementById('mensagem')?.value || '-';

    document.getElementById('resumoTipo').textContent = tipo;
    document.getElementById('resumoDesc').textContent = msg.length > 60 ? msg.substring(0, 57) + '...' : msg;

    const badgeNivel = document.getElementById('resumoNivelBadge');
    if (badgeNivel) {
      badgeNivel.textContent = `Criticidade: ${nivel}`;
      const nLower = nivel.toLowerCase();
      badgeNivel.className = nLower.includes('alto') || nLower.includes('crit')
        ? 'px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800'
        : nLower.includes('méd') || nLower.includes('med')
        ? 'px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800'
        : 'px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700';
    }

    const badgeStatus = document.getElementById('resumoResolvidoBadge');
    if (badgeStatus) {
      badgeStatus.textContent = resolvido ? 'Resolvido' : 'Pendente / Aberto';
      badgeStatus.className = resolvido
        ? 'px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800'
        : 'px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800';
    }
  }

  // 4. Submissão do Formulário
  const form = document.getElementById('formAlerta');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        ID_usuario: parseInt(document.getElementById('ID_usuario').value) || 1,
        tipo: document.getElementById('tipo').value.trim(),
        nivel: document.getElementById('nivel').value.trim(),
        mensagem: document.getElementById('mensagem').value.trim(),
        resolvido: document.getElementById('resolvido').value === '1'
      };

      if (!payload.mensagem) {
        exibirMensagem('erro', 'A descrição da ocorrência é obrigatória.');
        return;
      }

      btnSalvar.disabled = true;
      btnSalvar.innerHTML = 'Salvando no banco...';

      try {
        const url = isEdit
          ? `http://localhost:3000/api/alertas/${id}`
          : 'http://localhost:3000/api/alertas';
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

        exibirMensagem('sucesso', isEdit ? 'Alerta atualizado com sucesso no MySQL!' : 'Alerta registrado com sucesso no MySQL!');
        setTimeout(() => {
          window.location.href = 'alertas.html';
        }, 1200);
      } catch (err) {
        console.error('Erro ao salvar alerta:', err);
        exibirMensagem('erro', 'Erro ao salvar: ' + err.message);
        btnSalvar.disabled = false;
        btnSalvar.textContent = isEdit ? 'Salvar alterações' : '+ Registrar alerta';
      }
    });
  }
});

// dashboard.js - Integração exclusiva com Banco de Dados MySQL AçoSmart

let rawPedidos = [];
let rawAlertas = [];
let currentFilter = 'este_mes';

document.addEventListener('DOMContentLoaded', () => {
  setupUserSession();
  setupPeriodDropdown();
  setupExportModal();
  setupReloadButton();
  carregarDadosDoBanco();
});

// 1. Sessão do Operador
function setupUserSession() {
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
}

// 2. Botão de Recarregar Dados do Banco
function setupReloadButton() {
  const btnReload = document.getElementById('btnReload');
  if (btnReload) {
    btnReload.addEventListener('click', () => {
      btnReload.classList.add('animate-spin');
      carregarDadosDoBanco().finally(() => {
        setTimeout(() => btnReload.classList.remove('animate-spin'), 600);
      });
    });
  }
}

// 3. Buscar Dados EXCLUSIVAMENTE do Banco de Dados via API Local
async function carregarDadosDoBanco() {
  atualizarStatusConexao('conectando', 'Consultando MySQL...');

  try {
    // Busca dados reais das tabelas 'pedido' e 'Alertas'
    const [resPedidos, resAlertas] = await Promise.all([
      fetch('http://localhost:3000/api/pedidos', { cache: 'no-store' }),
      fetch('http://localhost:3000/api/alertas', { cache: 'no-store' })
    ]);

    if (!resPedidos.ok || !resAlertas.ok) {
      throw new Error(`Erro HTTP ao consultar banco: Pedidos (${resPedidos.status}), Alertas (${resAlertas.status})`);
    }

    const pedidos = await resPedidos.json();
    const alertas = await resAlertas.json();

    rawPedidos = Array.isArray(pedidos) ? pedidos : [];
    rawAlertas = Array.isArray(alertas) ? alertas : [];

    atualizarStatusConexao('conectado', `MySQL Conectado: ${rawPedidos.length} pedidos • ${rawAlertas.length} alertas`);
    processarERenderizarDadosDoBanco();
  } catch (err) {
    console.error('Falha ao conectar com o banco de dados MySQL:', err);
    atualizarStatusConexao('erro', 'MySQL Desconectado (inicie node server.js)');
    exibirErroConexao(err.message);
  }
}

// 4. Atualizar Indicador de Conexão no Cabeçalho
function atualizarStatusConexao(status, mensagem) {
  const badge = document.getElementById('dbBadge');
  const dot = document.getElementById('dbDot');
  const text = document.getElementById('dbText');
  const banner = document.getElementById('bannerText');

  if (!badge || !dot || !text) return;

  if (status === 'conectado') {
    badge.className = 'px-2 py-0.5 rounded text-[11px] font-mono-tech bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
    text.textContent = mensagem;
    if (banner) {
      banner.textContent = `Dados reais carregados do banco MySQL acosmart (Total: ${rawPedidos.length} pedidos e ${rawAlertas.length} alertas).`;
    }
  } else if (status === 'erro') {
    badge.className = 'px-2 py-0.5 rounded text-[11px] font-mono-tech bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-red-400';
    text.textContent = mensagem;
    if (banner) {
      banner.innerHTML = `<span class="text-red-400 font-bold">⚠️ Conexão falhou:</span> Não foi possível comunicar com o servidor MySQL (http://localhost:3000). Certifique-se de executar <code class="bg-[#1b1e26] px-1.5 py-0.5 rounded text-amber-300">node server.js</code> no terminal.`;
    }
  } else {
    badge.className = 'px-2 py-0.5 rounded text-[11px] font-mono-tech bg-[#1a2233] text-blue-400 border border-[#2a364f] flex items-center gap-1.5';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse';
    text.textContent = mensagem;
  }
}

// 5. Exibir Estado de Erro caso o Banco não Responda (SEM DADOS FALSOS)
function exibirErroConexao(erroMsg) {
  document.getElementById('kpiPedidosTotal').textContent = '0';
  document.getElementById('kpiPedidosConcluidos').textContent = '0 concluídos';
  document.getElementById('kpiPedidosAbertoSub').textContent = '0 em aberto';

  document.getElementById('kpiPedidosAberto').textContent = '0';
  document.getElementById('kpiPedidosProducao').textContent = '0 em produção';
  document.getElementById('kpiPedidosFila').textContent = '0 aguardando';

  document.getElementById('kpiAlertasAberto').textContent = '0';
  document.getElementById('kpiAlertasPendentes').textContent = '0 pendentes';
  document.getElementById('kpiAlertasAnalise').textContent = '0 em análise';

  document.getElementById('kpiAlertasCriticos').textContent = '0';
  document.getElementById('subAlertasCriticos').textContent = 'Sem conexão com banco de dados';

  document.getElementById('subChartPedidos').textContent = '0 pedidos no banco de dados';
  document.getElementById('footerChartPedidos').textContent = 'Conecte ao MySQL para calcular a distribuição de pedidos.';

  document.getElementById('subChartAlertas').textContent = '0 alertas no banco de dados';
  document.getElementById('footerChartAlertas').textContent = 'Conecte ao MySQL para calcular a situação dos alertas.';

  renderEmptyChart('svgChartPedidos', 'Sem dados de pedidos no banco');
  renderEmptyChart('svgChartAlertas', 'Sem dados de alertas no banco');

  const legendPedidos = document.getElementById('legendPedidos');
  if (legendPedidos) {
    legendPedidos.innerHTML = `<div class="text-xs text-slate-500 italic p-2 bg-[#1b1e26] rounded border border-[#222631]">Aguardando conexão com a tabela 'pedido'...</div>`;
  }

  const legendAlertas = document.getElementById('legendAlertas');
  if (legendAlertas) {
    legendAlertas.innerHTML = `<div class="text-xs text-slate-500 italic p-2 bg-[#1b1e26] rounded border border-[#222631]">Aguardando conexão com a tabela 'Alertas'...</div>`;
  }

  const tbody = document.getElementById('resumoTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-6 text-center text-slate-400 font-mono-tech">
          <div class="flex flex-col items-center justify-center gap-2">
            <span class="text-xl text-amber-400">🔌</span>
            <span class="font-bold text-slate-200">Não foi possível carregar os dados do banco de dados MySQL.</span>
            <span class="text-xs text-slate-400">Execute <code class="bg-[#1b1e26] text-blue-400 px-2 py-1 rounded">node server.js</code> na pasta do protótipo com o serviço MySQL ativo.</span>
            <button onclick="carregarDadosDoBanco()" class="mt-2 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-xs font-bold">Tentar novamente</button>
          </div>
        </td>
      </tr>
    `;
  }
}

// 6. Processamento Dinâmico Estritamente a Partir dos Registros do MySQL
function processarERenderizarDadosDoBanco() {
  // --- A. PROCESSAR PEDIDOS (Tabela 'pedido') ---
  const totalPedidos = rawPedidos.length;
  let concluidos = 0;
  let emProducao = 0;
  let aguardando = 0;

  rawPedidos.forEach((p) => {
    const s = (p.status || '').toLowerCase().trim();
    if (s.includes('concl') || s.includes('finaliz')) {
      concluidos++;
    } else if (s.includes('prod') || s.includes('andamento') || s.includes('execu')) {
      emProducao++;
    } else {
      aguardando++;
    }
  });

  const pedidosEmAberto = totalPedidos - concluidos;

  // --- B. PROCESSAR ALERTAS (Tabela 'Alertas') ---
  const totalAlertas = rawAlertas.length;
  let alertasResolvidos = 0;
  let alertasPendentes = 0;
  let alertasEmAnalise = 0;
  let alertasCriticos = 0;

  rawAlertas.forEach((a) => {
    const resolvido = a.resolvido === 1 || a.resolvido === true || String(a.resolvido).toLowerCase() === 'true';
    const nivel = (a.nivel || '').toLowerCase().trim();
    const tipo = (a.tipo || '').toLowerCase().trim();

    if (resolvido) {
      alertasResolvidos++;
    } else {
      // Alerta em aberto
      if (nivel.includes('alto') || nivel.includes('crit')) {
        alertasCriticos++;
      }

      if (tipo.includes('analise') || tipo.includes('análise')) {
        alertasEmAnalise++;
      } else {
        alertasPendentes++;
      }
    }
  });

  const alertasEmAberto = totalAlertas - alertasResolvidos;

  // --- C. ATUALIZAR OS 4 CARDS DE KPIS COM DADOS REAIS DO BANCO ---
  document.getElementById('kpiPedidosTotal').textContent = totalPedidos;
  document.getElementById('kpiPedidosConcluidos').textContent = `${concluidos} concluídos`;
  document.getElementById('kpiPedidosAbertoSub').textContent = `${pedidosEmAberto} em aberto`;

  document.getElementById('kpiPedidosAberto').textContent = pedidosEmAberto;
  document.getElementById('kpiPedidosProducao').textContent = `${emProducao} em produção`;
  document.getElementById('kpiPedidosFila').textContent = `${aguardando} aguardando`;

  document.getElementById('kpiAlertasAberto').textContent = alertasEmAberto;
  document.getElementById('kpiAlertasPendentes').textContent = `${alertasPendentes} pendentes`;
  document.getElementById('kpiAlertasAnalise').textContent = `${alertasEmAnalise} em análise`;

  document.getElementById('kpiAlertasCriticos').textContent = alertasCriticos;
  document.getElementById('subAlertasCriticos').textContent = `Prioridade entre os ${alertasEmAberto} em aberto`;

  // --- D. RENDERIZAR GRÁFICO 1: DISTRIBUIÇÃO DOS PEDIDOS DO BANCO ---
  const pctConcl = totalPedidos > 0 ? Math.round((concluidos / totalPedidos) * 100) : 0;
  const pctProd = totalPedidos > 0 ? Math.round((emProducao / totalPedidos) * 100) : 0;
  const pctAg = totalPedidos > 0 ? Math.max(0, 100 - pctConcl - pctProd) : 0;

  document.getElementById('subChartPedidos').textContent = `${totalPedidos} pedidos encontrados no banco`;
  document.getElementById('footerChartPedidos').textContent = totalPedidos > 0
    ? `${pctConcl}% dos pedidos do banco de dados foram concluídos.`
    : 'Nenhum registro encontrado na tabela de pedidos.';

  const slicesPedidos = [
    { label: 'Concluídos', count: concluidos, pct: pctConcl, color: '#10b981' }, // Verde Esmeralda
    { label: 'Em produção', count: emProducao, pct: pctProd, color: '#3b82f6' }, // Azul Tech
    { label: 'Aguardando', count: aguardando, pct: pctAg, color: '#64748b' }    // Cinza Slate
  ];

  if (totalPedidos > 0) {
    renderDonutChart('svgChartPedidos', slicesPedidos, 'pedidos');
    renderLegend('legendPedidos', slicesPedidos, 'pedidos');
  } else {
    renderEmptyChart('svgChartPedidos', 'Tabela vazia');
    document.getElementById('legendPedidos').innerHTML = `<span class="text-xs text-slate-500 italic">Tabela 'pedido' sem registros no MySQL.</span>`;
  }

  // --- E. RENDERIZAR GRÁFICO 2: SITUAÇÃO DOS ALERTAS DO BANCO ---
  const pctPend = totalAlertas > 0 ? Math.round((alertasPendentes / totalAlertas) * 100) : 0;
  const pctAn = totalAlertas > 0 ? Math.round((alertasEmAnalise / totalAlertas) * 100) : 0;
  const pctRes = totalAlertas > 0 ? Math.max(0, 100 - pctPend - pctAn) : 0;

  document.getElementById('subChartAlertas').textContent = `${totalAlertas} alertas encontrados no banco`;
  document.getElementById('footerChartAlertas').textContent = totalAlertas > 0
    ? `${alertasEmAberto} alertas em aberto no banco, sendo ${alertasCriticos} de prioridade crítica.`
    : 'Nenhum registro encontrado na tabela de alertas.';

  const slicesAlertas = [
    { label: 'Pendentes', count: alertasPendentes, pct: pctPend, color: '#f59e0b' }, // Amarelo Amber
    { label: 'Em análise', count: alertasEmAnalise, pct: pctAn, color: '#3b82f6' },  // Azul Tech
    { label: 'Resolvidos', count: alertasResolvidos, pct: pctRes, color: '#10b981' } // Verde Esmeralda
  ];

  if (totalAlertas > 0) {
    renderDonutChart('svgChartAlertas', slicesAlertas, 'alertas');
    renderLegend('legendAlertas', slicesAlertas, 'alertas');
  } else {
    renderEmptyChart('svgChartAlertas', 'Tabela vazia');
    document.getElementById('legendAlertas').innerHTML = `<span class="text-xs text-slate-500 italic">Tabela 'Alertas' sem registros no MySQL.</span>`;
  }

  // --- F. RENDERIZAR TABELA DE RESUMO COM BASE NOS REGISTROS DO BANCO ---
  const resumoRows = [
    {
      grupo: 'Pedidos em produção',
      situacao: `${emProducao} pedidos em andamento no banco`,
      acao: 'Acompanhar prazos no PCP e oficina',
      badge: `${emProducao} ativos`,
      link: 'pedidos.html'
    },
    {
      grupo: 'Pedidos aguardando',
      situacao: `${aguardando} pedidos na fila no banco`,
      acao: 'Revisar programação de corte e máquinas',
      badge: `${aguardando} na fila`,
      link: 'pedidos.html'
    },
    {
      grupo: 'Alertas em aberto',
      situacao: `${alertasPendentes} pendentes • ${alertasEmAnalise} em análise no banco`,
      acao: `Priorizar os ${alertasCriticos} alertas críticos`,
      badge: `${alertasCriticos} críticos`,
      link: 'alertas.html'
    }
  ];

  renderResumoTable(resumoRows);
}

// 7. Gráfico Donut em SVG com Dados Reais
function renderDonutChart(svgId, slices, type) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  svg.innerHTML = '';
  const cx = 100;
  const cy = 100;
  const outerRadius = 80;
  const innerRadius = 48;
  const total = slices.reduce((acc, s) => acc + s.pct, 0);

  if (total === 0) {
    renderEmptyChart(svgId, '0 registros');
    return;
  }

  let currentAngle = -90;

  slices.forEach((slice) => {
    if (slice.pct <= 0) return;

    const sliceAngle = (slice.pct / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const pathD = describeDonutArc(cx, cy, innerRadius, outerRadius, startAngle, endAngle - 1.5);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('d', pathD);
    path.setAttribute('fill', slice.color);
    path.setAttribute('class', 'donut-slice');
    path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))';

    path.addEventListener('mouseenter', (e) => showTooltip(e, slice, type));
    path.addEventListener('mousemove', moveTooltip);
    path.addEventListener('mouseleave', hideTooltip);

    svg.appendChild(path);
  });
}

// Gráfico Vazio
function renderEmptyChart(svgId, label) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = `
    <circle cx="100" cy="100" r="64" fill="none" stroke="#222631" stroke-width="26" />
    <text x="100" y="104" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">${label}</text>
  `;
}

// Coordenadas Polares
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Caminho do Arco
function describeDonutArc(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, startAngle);
  const endInner = polarToCartesian(cx, cy, rInner, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', rInner, rInner, 0, largeArcFlag, 1, endInner.x, endInner.y,
    'Z'
  ].join(' ');
}

// 8. Legenda Dinâmica dos Gráficos
function renderLegend(containerId, slices, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  slices.forEach((slice) => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between text-xs py-1 border-b border-[#222631]/50 last:border-0';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-2';

    const colorBox = document.createElement('span');
    colorBox.className = 'w-3 h-3 rounded-sm shrink-0';
    colorBox.style.backgroundColor = slice.color;

    const label = document.createElement('span');
    label.className = 'text-slate-200 font-medium';
    label.textContent = slice.label;

    left.appendChild(colorBox);
    left.appendChild(label);

    const right = document.createElement('span');
    right.className = 'text-slate-400 font-mono-tech text-[11px]';
    right.textContent = `${slice.count} ${type} • ${slice.pct}%`;

    item.appendChild(left);
    item.appendChild(right);
    container.appendChild(item);
  });
}

// 9. Renderização da Tabela de Resumo com Dados Reais
function renderResumoTable(rows) {
  const tbody = document.getElementById('resumoTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-[#1a1e26] transition-all cursor-pointer';
    tr.onclick = () => window.location.href = row.link;

    tr.innerHTML = `
      <td class="p-3.5 font-bold text-slate-100 flex items-center gap-2">
        <span>⚙️</span>
        <span>${row.grupo}</span>
      </td>
      <td class="p-3.5 text-slate-300">
        <span class="px-2 py-0.5 rounded text-[11px] bg-[#1b1e26] border border-[#2a2e39] text-slate-300">
          ${row.situacao}
        </span>
      </td>
      <td class="p-3.5 text-slate-300">
        <span class="text-slate-200">${row.acao}</span>
      </td>
      <td class="p-3.5 text-right">
        <a href="${row.link}" class="px-2.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-[11px] font-bold inline-block shadow">
          Acessar →
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 10. Tooltip Interativo
const tooltip = document.getElementById('chart-tooltip');

function showTooltip(e, slice, unit) {
  if (!tooltip) return;
  tooltip.textContent = `${slice.label}: ${slice.count} ${unit} (${slice.pct}%)`;
  tooltip.style.display = 'block';
  moveTooltip(e);
}

function moveTooltip(e) {
  if (!tooltip) return;
  tooltip.style.left = e.pageX + 12 + 'px';
  tooltip.style.top = e.pageY + 12 + 'px';
}

function hideTooltip() {
  if (!tooltip) return;
  tooltip.style.display = 'none';
}

// 11. Seletor de Período
function setupPeriodDropdown() {
  const btn = document.getElementById('btnPeriodSelector');
  const menu = document.getElementById('periodDropdownMenu');

  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }
  });

  document.querySelectorAll('.period-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      const p = opt.getAttribute('data-period');
      currentFilter = p;
      const label = opt.textContent;
      btn.innerHTML = `<span>${label}</span> <span class="text-[10px]">▼</span>`;
      menu.classList.add('hidden');
      processarERenderizarDadosDoBanco();
    });
  });
}

// 12. Modal de Exportação do Relatório do Banco
function setupExportModal() {
  const btnExport = document.getElementById('btnExportarResumo');
  const modal = document.getElementById('exportModal');
  const btnClose = document.getElementById('btnCloseExportModal');
  const btnPrint = document.getElementById('btnModalPrint');
  const btnCsv = document.getElementById('btnModalCsv');

  if (!btnExport || !modal) return;

  btnExport.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      exportarParaCSV();
    });
  }
}

// 13. Exportação para CSV baseada nos Registros Reais do Banco
function exportarParaCSV() {
  let csv = 'Origem,Total_Registros,Data_Extracao\n';
  csv += `"Banco MySQL acosmart",${rawPedidos.length + rawAlertas.length},"${new Date().toISOString()}"\n\n`;

  csv += 'TABELA_PEDIDOS\n';
  csv += 'ID_Pedido,Cliente_ID,Data_Pedido,Prazo_Entrega,Valor_Total,Status\n';
  rawPedidos.forEach((p) => {
    csv += `${p.ID_pedido},${p.ID_cliente || ''},"${p.data_pedido || ''}","${p.prazo_entrega || ''}",${p.valor_total || 0},"${p.status || ''}"\n`;
  });

  csv += '\nTABELA_ALERTAS\n';
  csv += 'ID_Alerta,Usuario_ID,Tipo,Nivel,Mensagem,Resolvido,Data\n';
  rawAlertas.forEach((a) => {
    csv += `${a.ID_alerta},${a.ID_usuario || ''},"${a.tipo || ''}","${a.nivel || ''}","${(a.mensagem || '').replace(/"/g, '""')}",${a.resolvido},"${a.data || ''}"\n`;
  });

  const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  const link = document.createElement('a');
  link.setAttribute('href', uri);
  link.setAttribute('download', `acosmart_banco_dados_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

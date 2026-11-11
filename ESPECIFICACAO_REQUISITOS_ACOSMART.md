# Documento de Engenharia de Requisitos e Regras de Negócio (SRS)

**Sistema:** AçoSmart — Plataforma de Gestão Industrial, Ordens de Produção e Usinagem de Chapas  
**Versão:** 1.0.0  
**Data:** Novembro de 2026  
**Status:** Aprovado para Referência Técnica  

---

## 1. Visão Geral do Sistema

O **AçoSmart** é um sistema web integrado desenvolvido para a gestão de chão de fábrica e planejamento e controle da produção (PCP) em indústrias metalmecânicas e centros de usinagem e corte de chapas metálicas. 

A plataforma conecta a retaguarda corporativa (gestão de clientes, fornecedores de ligas metálicas, colaboradores e pedidos de venda) à operação industrial direta (parque de máquinas, simulação interativa de corte em 2D com síntese sonora em tempo real, monitoramento de aproveitamento de chapas metálicas, gestão de retalhos e central de alertas operacionais).

### 1.1 Arquitetura Tecnológica
- **Camada de Apresentação (Frontend):** HTML5 Semântico, Tailwind CSS, Canvas 2D nativo, Web Audio API (síntese sonora para maquinário) e JavaScript Vanilla modular.
- **Camada de Serviços (Backend API):** Node.js com Express e CORS, servindo endpoints REST em formato JSON.
- **Camada de Persistência (Banco de Dados):** MySQL Relacional com integridade referencial rígida (chaves estrangeiras com ações `ON DELETE RESTRICT`, `CASCADE` e `SET NULL`).

---

## 2. Requisitos Funcionais (RF)

Os requisitos funcionais detalham as operações, comportamentos e serviços que o sistema AçoSmart oferece aos seus utilizadores.

### 2.1 Módulo de Autenticação e Controle de Sessão
- **RF01 - Autenticação de Operadores e Colaboradores:** O sistema deve fornecer uma interface de login onde o usuário informa seu e-mail e senha. As credenciais devem ser validadas via requisição `POST /api/login` no banco de dados (`colaborador`).
- **RF02 - Manutenção de Sessão no Cliente:** Ao autenticar com sucesso, o sistema deve registrar a identidade do colaborador no `localStorage` sob a chave `acosmart_user` e conceder acesso aos módulos operacionais.
- **RF03 - Proteção de Rotas e Telas Restritas:** Todas as páginas internas do sistema (`alertas.html`, `pedidos.html`, `materiais.html`, `maquinas.html`, `usuarios.html`, `fornecedores.html`, `clientes.html`, `oficina.html`) devem validar no carregamento (`DOMContentLoaded`) a existência da sessão ativa. Caso não exista, o usuário deve ser redirecionado imediatamente para a tela de login (`login.html`).
- **RF04 - Identificação Visual do Operador:** O sistema deve exibir na barra de topo (*header*) de todas as páginas o nome ou e-mail do operador logado (`userDisplay`) e disponibilizar a ação de encerramento de sessão (*logout*), que remove a sessão e redireciona para `login.html`.

### 2.2 Módulo de Gestão de Colaboradores e Acesso
- **RF05 - Consulta de Colaboradores:** O sistema deve permitir listar todos os colaboradores cadastrados no banco de dados através da rota `GET /api/usuarios`.
- **RF06 - Exibição de Dados do Colaborador:** A tabela de colaboradores deve exibir: Nome Completo, E-mail corporativo, Perfil de Acesso (ex.: `admin`, `operador`) e Status (ex.: `ativo`, `inativo`).
- **RF07 - Destaque Visual por Nível de Perfil e Status:** Colaboradores com perfil `admin` devem receber destaque em cor específica (âmbar), enquanto status `ativo` deve ser indicado em verde e `inativo` em vermelho.
- **RF08 - Ocultação de Senhas na Camada de Visualização e API:** A rota de consulta de usuários não deve expor o campo de hash/senha para a camada cliente aberta, garantindo privacidade de credenciais.

### 2.3 Módulo de Gestão de Clientes
- **RF09 - Consulta de Clientes:** O sistema deve listar todos os clientes cadastrados por meio da rota `GET /api/clientes`.
- **RF10 - Apresentação Cadastral Completa:** O sistema deve exibir Nome/Razão Social, CPF/CNPJ, Telefone de contato, E-mail e Endereço comercial/de entrega.
- **RF11 - Tratamento de Dados Nulos:** O sistema deve formatar graciosamente com hífen (`-`) qualquer campo opcional não preenchido.

### 2.4 Módulo de Gestão de Fornecedores de Insumos
- **RF12 - Consulta de Fornecedores:** O sistema deve listar os fornecedores de aço e ligas industriais via `GET /api/fornecedores`.
- **RF13 - Apresentação de Fornecedores:** A tabela deve exibir Razão Social, CNPJ, Telefone, E-mail e Cidade sede do fornecedor.
- **RF14 - Vinculação Fornecedor-Material:** O banco de dados deve manter o relacionamento entre matérias-primas e seus respectivos fornecedores através das entidades `Materiais` e `Materiais_fornecedores`.

### 2.5 Módulo de Catálogo de Matérias-Primas e Ligas
- **RF15 - Consulta de Materiais:** O sistema deve listar as matérias-primas industriais cadastradas via `GET /api/materiais`.
- **RF16 - Exibição de Especificações Físicas:** A interface deve apresentar o Nome da Liga/Material, Tipo (ex.: chapa, barra, perfil), Espessura nominal em milímetros (`espessura_mm`), Unidade de medida (ex.: mm, kg, chapa) e Descrição técnica de aplicação.
- **RF17 - Tratamento e Formatação Numérica:** A espessura em milímetros deve ser formatada com precisão decimal, diferenciando valores nulos de valores zerados.
- **RF18 - Associação de Materiais a Máquinas:** O sistema deve suportar em banco a relação de quais materiais são compatíveis com quais máquinas operacionais (`Materiais_maquinas`).

### 2.6 Módulo de Gestão do Parque de Máquinas
- **RF19 - Consulta de Máquinas Industriais:** O sistema deve exibir todos os centros de usinagem e estações de corte através da rota `GET /api/maquinas`.
- **RF20 - Detalhamento do Equipamento:** A tabela de máquinas deve exibir: Nome do Equipamento, Tipo/Tecnologia (ex.: Cortador a Laser CO2, Guilhotina, Prensa Mecânica, Dobradeira CNC), Capacidade operacional nominal e Status atual.
- **RF21 - Indicador Semântico de Estado da Máquina:** O status da máquina deve ser codificado por cores no painel: verde para `operacional`, vermelho para `parada` e âmbar para estados transitórios/manutenção.
- **RF22 - Registro de Manutenções:** A entidade de máquinas deve armazenar a data da última manutenção preventiva/corretiva (`ultima_manutencao`) e o operador/colaborador responsável (`ID_colaborador`).

### 2.7 Módulo de Pedidos e Ordens de Produção (PCP)
- **RF23 - Consulta da Fila de Ordens:** O sistema deve listar todas as ordens de fabricação através da rota `GET /api/pedidos`.
- **RF24 - Identificação Industrial da Ordem:** Cada pedido deve ser exibido com identificador padronizado no formato `#ORD-{ID_pedido}`.
- **RF25 - Formatação Financeira e Temporal:** O sistema deve formatar as datas de emissão (`data_pedido`) e entrega (`prazo_entrega`) no padrão brasileiro (`dd/mm/aaaa`), e o montante financeiro (`valor_total`) como moeda corrente (`R$ 0.000,00`).
- **RF26 - Roteamento da Ordem para Execução:** A interface de pedidos deve conter para cada ordem o botão de ação rápida "Executar", que redireciona o operador diretamente para o módulo de usinagem e corte (`oficina.html`).
- **RF27 - Abertura de Nova Ordem de Produção:** O botão "+ NOVA ORDEM DE PRODUÇÃO" deve permitir ao operador iniciar o ciclo de roteamento e envio do trabalho fabril.

### 2.8 Módulo de Oficina Interativa e Simulação de Usinagem (Canvas 2D)
- **RF28 - Renderização Interativa do Chão de Fábrica:** O sistema deve prover um canvas interativo que desenha as bancadas de trabalho e estações industriais (Prensa Mecânica, Guilhotina, Laser CO2, Plasma, Serra Industrial, Serra Fita, Prensa Hidráulica e Dobradeira CNC).
- **RF29 - Seleção Paramétrica de Materiais:** O operador deve poder escolher interativamente entre 7 ligas metálicas com texturas visuais diferenciadas:
  1. Aço Carbono (*Carbon Steel*)
  2. Aço Inox (*Stainless Steel*)
  3. Alumínio (*Aluminum*)
  4. Aço ARBL (*HSLA Steel*)
  5. Cobre (*Copper*)
  6. Latão (*Brass*)
  7. Aço Galvanizado (*Galvanized Steel*)
- **RF30 - Seleção de Formatos e Produtos a Fabricar:** O operador deve poder escolher a geometria da peça a ser usinada:
  1. Engrenagem (*Gear*)
  2. Painel Perfurado (*Perforated Sheet*)
  3. Cano/Tubo Cilíndrico (*Cylinder Pipe*)
  4. Suporte Angular (*Angular Bracket*)
- **RF31 - Cálculo de Aproveitamento da Chapa Metálica:** A interface deve monitorar o preenchimento de uma chapa metálica de 6 slots de corte. Uma barra de progresso e um contador numérico ("Slot X de 6") devem exibir a taxa de aproveitamento da chapa em tempo real.
- **RF32 - Execução e Animação de Corte/Usinagem:** Ao acionar "EXECUTAR USINAGEM E CORTE", a máquina compatível deve executar uma rotina animada de processamento mecânico, destacando o cabeçote de corte ativo na bancada.
- **RF33 - Síntese Acústica em Tempo Real (Web Audio API):** Durante o ciclo de trabalho da máquina, o sistema deve gerar via sintetizador de áudio nativo oscilações sonoras industriais (frequências de corte, impacto de prensa mecânica ou serra) sem depender de arquivos de áudio externos pré-gravados.
- **RF34 - Manipulação Física (Drag and Drop):** O operador deve poder arrastar livremente chapas usinadas e produtos acabados pelo canvas, destinando-os às zonas funcionais de estoque ou reciclagem.
- **RF35 - Separação Logística em Zonas de Fábrica:** O canvas deve demarcar duas áreas no topo:
  - *Estoque de Produtos Acabados*: armazenamento de itens finalizados segregados por tipo/formato.
  - *Área de Descarte / Reciclagem*: área para deposição de retalhos metálicos e cavacos.

### 2.9 Módulo de Central de Alertas e Ocorrências
- **RF36 - Consulta de Alertas Operacionais:** O sistema deve listar notificações e incidentes de fábrica via `GET /api/alertas`.
- **RF37 - Classificação de Risco e Criticidade:** Cada alerta deve apresentar seu Tipo de Ocorrência, Mensagem descritiva, Nível de Criticidade (`Alto` destacado em vermelho, `Médio` em amarelo, `Baixo` em cinza/azul), Data do evento e Status de Resolução (`Sim`/`Não`).
- **RF38 - Reconhecimento Coletivo de Alertas:** A tela deve prover o botão "Marcar Todos como Lidos", permitindo acusar recebimento e arquivamento em lote das notificações ativas.

### 2.10 Módulo de Rastreabilidade e Gestão de Retalhos
- **RF39 - Histórico de Log de Cortes:** O sistema deve registrar e fornecer histórico de cortes efetuados (`Log_cortes`) com identificação da máquina, operador responsável, status e data/hora de início e término (`GET /api/oficina`).
- **RF40 - Cadastro e Reaproveitamento de Retalhos:** O banco de dados deve registrar sobras úteis de chapas metálicas na entidade `Retalhos`, mantendo dimensões físicas remanescentes (espessura, comprimento e largura em mm) e quantidade para reaproveitamento em ordens futuras.

---

## 3. Requisitos Não-Funcionais (RNF)

Os requisitos não-funcionais determinam os critérios de qualidade, desempenho, restrições arquiteturais e diretrizes de confiabilidade do sistema.

### 3.1 Desempenho e Eficiência (RNF-DES)
- **RNF01 - Taxa de Quadros da Simulação Gráfica:** A renderização interativa do chão de fábrica no Canvas 2D deve manter taxa de atualização estável de até 60 FPS (*frames per second*) utilizando `window.requestAnimationFrame`.
- **RNF02 - Tempo de Resposta da Camada de API:** As requisições REST às rotas do Express (`/api/*`) em ambiente local devem responder em tempo inferior a 200 ms em condições nominais de carga.
- **RNF03 - Otimização de Renderização Offscreen:** A renderização das perfurações e gradientes metálicos das chapas deve utilizar buffers secundários (*offscreen canvas*) para evitar cálculos repetitivos de gradiente vetorial a cada ciclo de render.
- **RNF04 - Síntese de Áudio com Latência Mínima:** A geração de efeitos sonoros deve usar a `AudioContext` nativa do navegador, operando com latência imperceptível (< 50 ms) e sem consumo de banda de rede para download de arquivos de áudio.

### 3.2 Segurança e Proteção de Dados (RNF-SEG)
- **RNF05 - Sanitização contra SQL Injection:** Todas as operações com entrada de dados dinâmica (como a consulta de login) devem utilizar parâmetros nomeados ou placeholders (`?`) com *prepared statements* da biblioteca `mysql2`.
- **RNF06 - Não Exposição de Senhas em Rotas de Consulta:** A rota `GET /api/usuarios` deve selecionar explicitamente apenas colunas seguras (`ID_colaborador, perfil, nome, email, status`), suprimindo o campo confidencial `senha`.
- **RNF07 - Controle de Origem de Requisições (CORS):** O servidor Node.js deve utilizar o middleware `cors` para controlar e liberar acessos entre a origem da aplicação cliente e os endpoints da API.
- **RNF08 - Bloqueio de Acesso por Redirecionamento de Sessão:** Qualquer acesso direto à interface via URL sem presença do token `acosmart_user` no `localStorage` deve abortar o processamento da página e forçar o redirecionamento.

### 3.3 Usabilidade e Identidade Visual Industrial (RNF-USA)
- **RNF09 - Padrão Visual Dark Industrial:** A interface deve seguir padrão estético escuro (*dark mode industrial*, paleta `#0d0f12`, `#14171d`, `#1b1e26`), reduzindo fadiga visual em ambientes de controle de chão de fábrica.
- **RNF10 - Tipografia Técnica / Monospace:** Textos técnicos, códigos de ordens `#ORD-X`, cabeçalhos de tabela e identificadores de máquinas devem adotar tipografia com apelo monoespaçado técnico (`font-mono-tech`).
- **RNF11 - Realismo Físico das Ligas Metálicas:** Cada liga metálica simulada deve ser identificada por gradientes cromáticos específicos que emulem as propriedades reflexivas do material real (ex.: cobre avermelhado, latão dourado, inox prateado, aço carbono escuro).

### 3.4 Arquitetura, Portabilidade e Compatibilidade (RNF-ARC)
- **RNF12 - Compatibilidade Multi-Navegador:** O frontend deve ser compatível com os principais navegadores modernos (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) com suporte a ECMAScript 6+ e Canvas API HTML5.
- **RNF13 - Portabilidade da Camada de Servidor:** O backend em Node.js e banco MySQL deve ser executável em ambientes Windows, Linux ou macOS sem alteração de código-fonte.
- **RNF14 - Zero Dependência de Frameworks Pesados de UI:** O frontend não deve exigir etapas obrigatórias de *build* ou *transpilação* para rodar (SPA pesada), funcionando nativamente no navegador com scripts Vanilla JS e Tailwind via CDN.

### 3.5 Confiabilidade, Integridade e Persistência (RNF-CON)
- **RNF15 - Integridade Referencial Estrita:** O banco de dados MySQL deve garantir consistência relacional através do motor InnoDB, aplicando restrições de chave estrangeira com ações `ON DELETE RESTRICT`, `CASCADE` e `SET NULL` conforme a sensibilidade do dado.
- **RNF16 - Precisão Monetária e Dimensional:** Os dados numéricos de espessura, comprimento e largura devem usar tipos decimais de precisão fixa (`DECIMAL(8,2)`), e valores monetários devem usar `DECIMAL(10,2)` para prevenir erros de arredondamento inerentes a ponto flutuante.

---

## 4. Regras de Negócio (RN)

As regras de negócio descrevem as políticas, diretrizes industriais e restrições operacionais que governam o comportamento do sistema.

### RN01 - Sessão Ativa Mandatória para Navegação Operacional
Nenhum operador pode navegar pelas telas de gestão e produção sem estar previamente autenticado.
- **Gatilho:** Abertura ou recarregamento de qualquer página que não seja `login.html`.
- **Comportamento:** Se `localStorage.getItem('acosmart_user')` for nulo, a página cancela imediatamente o fluxo e redireciona o navegador para `login.html`.

### RN02 - Unicidade Cadastral de Credenciais e Documentos
Não é permitida a duplicidade de identificadores únicos no sistema:
- O campo `email` na tabela `colaborador` deve ser estritamente único (`UNIQUE`).
- O campo `cpf_cnpj` de clientes e o campo `cnpj` de fornecedores devem identificar univocamente a entidade jurídica ou física no banco de dados.

### RN03 - Matriz de Compatibilidade Mecânica (Material x Produto x Máquina)
Nem todo produto ou material pode ser processado em qualquer máquina. O sistema industrial impõe a seguinte matriz restritiva de compatibilidade:
1. **Peças do tipo Cano / Tubo (`CYLINDER_PIPE`):** Podem ser processadas **exclusivamente** em *Serra Fita* (`BAND_SAW`) ou *Serra Industrial* (`INDUSTRIAL_SAW`).
2. **Peças do tipo Painel Perfurado (`PERFORATED_SHEET`):** Podem ser usinadas **apenas** em *Cortador a Laser CO2* (`LASER`) ou *Cortador a Plasma* (`PLASMA`).
3. **Peças do tipo Suporte Angular (`ANGULAR_BRACKET`):** Exigem dobra/estampagem, sendo executáveis **apenas** em *Dobradeira CNC* (`BENDER`) ou *Prensa Mecânica* (`PRESS`).
4. **Ligas Nobres Maleáveis (Cobre `COPPER` e Latão `BRASS`):** Devem ser conformadas em *Prensa Hidráulica* (`HYDRAULIC_PRESS`) ou *Prensa Mecânica* (`PRESS`).
5. **Aço de Alta Resistência ARBL (`HSLA_STEEL`):** Exige alta potência de corte, restringindo-se à *Serra Industrial* (`INDUSTRIAL_SAW`) ou *Cortador a Plasma* (`PLASMA`).
6. **Demais ligas e produtos padrão:** Podem transitar entre *Cortador a Laser*, *Prensa Mecânica*, *Guilhotina* e *Dobradeira CNC*.

### RN04 - Capacidade Máxima e Fator de Ocupação da Chapa (Limite de Slots)
Cada chapa metálica padrão colocada na esteira de usinagem possui capacidade dimensional calculada para acomodar **exatamente 6 slots de peças** (2 linhas x 3 colunas).
- Enquanto o número de slots ocupados for inferior a 6, o operador pode continuar recortando peças na mesma chapa.
- Ao atingir 6 slots ocupados (100% de ocupação útil), a chapa é considerada totalmente desbastada e deve ser enviada para a área de retalhos/reciclagem para que uma nova chapa seja carregada.

### RN05 - Destinação Obrigatória de Sobras e Geração de Retalhos
Toda chapa que passe por processo de corte deve gerar ou um retalho reaproveitável ou descarte:
- Se houver área metálica remanescente útil, o material residual deve ser registrado na tabela `Retalhos` com suas dimensões (`espessura_mm`, `comprimento_mm`, `largura_mm`) associadas à máquina que efetuou a operação.
- Sobras sem viabilidade de reaproveitamento devem ser arrastadas para a *Área de Descarte / Reciclagem* demarcada no chão de fábrica.

### RN06 - Roteamento Rápido de Ordem de Produção para Execução
Ao selecionar a ação "Executar" em uma ordem de produção na tabela de pedidos (`pedidos.html`), o sistema deve redirecionar o operador diretamente para o ambiente da oficina (`oficina.html`), carregando o contexto do lote a ser usinado.

### RN07 - Proteção de Exclusão de Clientes com Histórico de Pedidos
Um cliente que possua ao menos um pedido de produção registrado no histórico não pode ser excluído do banco de dados.
- **Implementação:** A chave estrangeira `fk_pedido_cliente` na tabela `pedido` possui a regra `ON DELETE RESTRICT`. A tentativa de exclusão do cliente causará erro de integridade referencial, preservando o histórico fiscal e produtivo.

### RN08 - Preservação de Histórico de Equipamentos na Demissão de Colaborador
Caso um operador ou colaborador responsável por uma máquina (`Maquinas.ID_colaborador`) seja desligado ou excluído da base:
- A máquina **não** é excluída.
- O campo `ID_colaborador` da máquina afetada é automaticamente redefinido para `NULL` (`ON DELETE SET NULL`), permitindo a posterior reatribuição a um novo responsável sem perda do cadastro do ativo fabril.

### RN09 - Exclusão em Cascata para Alertas e Ordens Vinculadas
Registros que representam eventos dependentes de um cadastro principal são limpos automaticamente:
- A exclusão de um colaborador remove automaticamente todos os seus alertas pendentes (`Alertas` -> `ON DELETE CASCADE`).
- A exclusão de um pedido remove automaticamente as associações de colaboradores na tabela intermediária `colaborador_pedidos` (`ON DELETE CASCADE`).
- A exclusão de uma máquina remove automaticamente os logs de corte e retalhos vinculados (`ON DELETE CASCADE`).

### RN10 - Categorização e Destaque de Severidade de Alertas
Alertas operacionais do sistema devem ser rigorosamente classificados em três níveis:
- **Alto:** Riscos iminentes de colisão de máquina, parada de produção ou quebra de ferramentas. Destaque em texto vermelho (`text-red-400`).
- **Médio:** Desgaste prematuro de lâminas, estoque baixo de matéria-prima ou atraso potencial de prazo de entrega. Destaque em texto âmbar (`text-amber-400`).
- **Baixo:** Informativos operacionais e manutenções preventivas programadas. Destaque em cor neutra/ardósia (`text-slate-400`).

### RN11 - Validação e Resolução Coletiva de Notificações
O acionamento do botão "Marcar Todos como Lidos" altera o estado das pendências para resolvidas (`resolvido = TRUE` ou `1`), atualizando a sinalização visual do badge na interface de vermelho para verde (*Sim*).

### RN12 - Status Operacional de Máquinas para Alocação de Trabalho
Uma máquina cadastrada pode assumir três estados no chão de fábrica:
- `operacional`: apta a receber novas ordens de serviço.
- `manutencao`: temporariamente indisponível para ajustes de ferramental.
- `parada`: inoperante por falha ou intervenção corretiva. O sistema deve impedir o agendamento de novas ordens em equipamentos com status diferente de `operacional`.

---

## 5. Matriz de Rastreabilidade (Requisitos x Regras x Banco de Dados)

| Módulo do Sistema | Requisitos Funcionais (RF) | Regras de Negócio (RN) | Entidades / Tabelas do Banco |
| :--- | :--- | :--- | :--- |
| **Autenticação e Sessão** | RF01, RF02, RF03, RF04 | RN01, RN02 | `colaborador` |
| **Colaboradores e Equipe** | RF05, RF06, RF07, RF08 | RN02, RN08, RN09 | `colaborador`, `colaborador_pedidos` |
| **Clientes** | RF09, RF10, RF11 | RN02, RN07 | `clientes`, `pedido` |
| **Fornecedores** | RF12, RF13, RF14 | RN02 | `Fornecedores`, `Materiais_fornecedores` |
| **Matérias-Primas e Ligas** | RF15, RF16, RF17, RF18 | RN03, RN04 | `Materiais`, `Materiais_maquinas`, `Materiais_fornecedores` |
| **Parque Fabril e Máquinas** | RF19, RF20, RF21, RF22 | RN03, RN08, RN09, RN12 | `Maquinas`, `Materiais_maquinas`, `colaborador` |
| **Ordens e Pedidos (PCP)** | RF23, RF24, RF25, RF26, RF27 | RN06, RN07, RN09 | `pedido`, `clientes`, `colaborador_pedidos` |
| **Oficina, Usinagem e Canvas** | RF28, RF29, RF30, RF31, RF32, RF33, RF34, RF35 | RN03, RN04, RN05, RN06 | `Maquinas`, `Materiais`, `Log_cortes`, `Retalhos` |
| **Central de Alertas** | RF36, RF37, RF38 | RN09, RN10, RN11 | `Alertas`, `colaborador` |
| **Logs de Cortes e Retalhos** | RF39, RF40 | RN05, RN09 | `Log_cortes`, `Retalhos`, `Maquinas` |

---

## 6. Conclusão e Próximos Passos Recomendados

O sistema **AçoSmart** apresenta um modelo arquitetural bem estruturado, com banco relacional normalizado (respeitando chaves primárias, estrangeiras e restrições de integridade) e uma camada de simulação fabril interativa com Canvas e áudio sintetizado.

Como evolução recomendada para as próximas versões, sugere-se:
1. Implementação de autenticação com tokens criptografados (JWT) e hash de senha com `bcrypt` no backend.
2. Endpoints completos de persistência para as ações da oficina (`POST /api/cortes` e `POST /api/retalhos`), gravando em tempo real as peças cortadas no banco de dados.
3. Criação de formulários modais de cadastro completo para as entidades de Clientes, Fornecedores, Pedidos e Materiais.


const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Ajuste com o seu usuário do MySQL
  password: 'senai',      // Ajuste com a sua senha do MySQL
  database: 'acosmart'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});

// ==========================================
// 1. ALERTAS
// ==========================================
app.get('/api/alertas', (req, res) => {
  db.query('SELECT * FROM Alertas ORDER BY ID_alerta DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/alertas/:id', (req, res) => {
  db.query('SELECT * FROM Alertas WHERE ID_alerta = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Alerta não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/alertas', (req, res) => {
  const { ID_usuario, mensagem, nivel, tipo, resolvido } = req.body;
  const sql = 'INSERT INTO Alertas (ID_usuario, mensagem, nivel, tipo, resolvido) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [ID_usuario || 1, mensagem, nivel || 'Médio', tipo || 'Geral', resolvido ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Alerta criado com sucesso', id: result.insertId });
  });
});

app.put('/api/alertas/:id', (req, res) => {
  const { ID_usuario, mensagem, nivel, tipo, resolvido } = req.body;
  const sql = 'UPDATE Alertas SET ID_usuario = ?, mensagem = ?, nivel = ?, tipo = ?, resolvido = ? WHERE ID_alerta = ?';
  db.query(sql, [ID_usuario || 1, mensagem, nivel, tipo, resolvido ? 1 : 0, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Alerta atualizado com sucesso' });
  });
});

app.delete('/api/alertas/:id', (req, res) => {
  db.query('DELETE FROM Alertas WHERE ID_alerta = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Alerta removido com sucesso' });
  });
});

// ==========================================
// 2. CLIENTES
// ==========================================
app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM clientes ORDER BY ID_cliente DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/clientes/:id', (req, res) => {
  db.query('SELECT * FROM clientes WHERE ID_cliente = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/clientes', (req, res) => {
  const { cpf_cnpj, nome_razao, email, telefone, endereco } = req.body;
  const sql = 'INSERT INTO clientes (cpf_cnpj, nome_razao, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [cpf_cnpj, nome_razao, email, telefone, endereco], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente cadastrado com sucesso', id: result.insertId });
  });
});

app.put('/api/clientes/:id', (req, res) => {
  const { cpf_cnpj, nome_razao, email, telefone, endereco } = req.body;
  const sql = 'UPDATE clientes SET cpf_cnpj = ?, nome_razao = ?, email = ?, telefone = ?, endereco = ? WHERE ID_cliente = ?';
  db.query(sql, [cpf_cnpj, nome_razao, email, telefone, endereco, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente atualizado com sucesso' });
  });
});

app.delete('/api/clientes/:id', (req, res) => {
  db.query('DELETE FROM clientes WHERE ID_cliente = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente removido com sucesso' });
  });
});

// ==========================================
// 3. FORNECEDORES
// ==========================================
app.get('/api/fornecedores', (req, res) => {
  db.query('SELECT * FROM Fornecedores ORDER BY ID_Fornecedor DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/fornecedores/:id', (req, res) => {
  db.query('SELECT * FROM Fornecedores WHERE ID_Fornecedor = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/fornecedores', (req, res) => {
  const { cnpj, email, cidade, razao_social, telefone } = req.body;
  const sql = 'INSERT INTO Fornecedores (cnpj, email, cidade, razao_social, telefone) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [cnpj, email, cidade, razao_social, telefone], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Fornecedor cadastrado com sucesso', id: result.insertId });
  });
});

app.put('/api/fornecedores/:id', (req, res) => {
  const { cnpj, email, cidade, razao_social, telefone } = req.body;
  const sql = 'UPDATE Fornecedores SET cnpj = ?, email = ?, cidade = ?, razao_social = ?, telefone = ? WHERE ID_Fornecedor = ?';
  db.query(sql, [cnpj, email, cidade, razao_social, telefone, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Fornecedor atualizado com sucesso' });
  });
});

app.delete('/api/fornecedores/:id', (req, res) => {
  db.query('DELETE FROM Fornecedores WHERE ID_Fornecedor = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Fornecedor removido com sucesso' });
  });
});

// ==========================================
// 4. PEDIDOS
// ==========================================
app.get('/api/pedidos', (req, res) => {
  const sql = `
    SELECT p.*, c.nome_razao as cliente 
    FROM pedido p 
    LEFT JOIN clientes c ON p.ID_cliente = c.ID_cliente 
    ORDER BY p.ID_pedido DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/pedidos/:id', (req, res) => {
  const sql = `
    SELECT p.*, c.nome_razao as cliente 
    FROM pedido p 
    LEFT JOIN clientes c ON p.ID_cliente = c.ID_cliente 
    WHERE p.ID_pedido = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/pedidos', (req, res) => {
  const { ID_cliente, data_pedido, prazo_entrega, valor_total, status } = req.body;
  const sql = 'INSERT INTO pedido (ID_cliente, data_pedido, prazo_entrega, valor_total, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [ID_cliente, data_pedido || new Date(), prazo_entrega, valor_total || 0, status || 'Aguardando'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido criado com sucesso', id: result.insertId });
  });
});

app.put('/api/pedidos/:id', (req, res) => {
  const { ID_cliente, prazo_entrega, valor_total, status } = req.body;
  const sql = 'UPDATE pedido SET ID_cliente = ?, prazo_entrega = ?, valor_total = ?, status = ? WHERE ID_pedido = ?';
  db.query(sql, [ID_cliente, prazo_entrega, valor_total, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido atualizado com sucesso' });
  });
});

app.delete('/api/pedidos/:id', (req, res) => {
  db.query('DELETE FROM pedido WHERE ID_pedido = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido cancelado/removido com sucesso' });
  });
});

// ==========================================
// 5. MATERIAIS
// ==========================================
app.get('/api/materiais', (req, res) => {
  const sql = `
    SELECT m.*, f.razao_social as fornecedor_nome 
    FROM Materiais m 
    LEFT JOIN Fornecedores f ON m.ID_Fornecedor = f.ID_Fornecedor 
    ORDER BY m.ID_Material DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/materiais/:id', (req, res) => {
  const sql = `
    SELECT m.*, f.razao_social as fornecedor_nome 
    FROM Materiais m 
    LEFT JOIN Fornecedores f ON m.ID_Fornecedor = f.ID_Fornecedor 
    WHERE m.ID_Material = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Material não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/materiais', (req, res) => {
  const { ID_Fornecedor, nome, tipo, unidade, espessura_mm, descricao } = req.body;
  const sql = 'INSERT INTO Materiais (ID_Fornecedor, nome, tipo, unidade, espessura_mm, descricao) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [ID_Fornecedor || null, nome, tipo, unidade, espessura_mm || null, descricao], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Material cadastrado com sucesso', id: result.insertId });
  });
});

app.put('/api/materiais/:id', (req, res) => {
  const { ID_Fornecedor, nome, tipo, unidade, espessura_mm, descricao } = req.body;
  const sql = 'UPDATE Materiais SET ID_Fornecedor = ?, nome = ?, tipo = ?, unidade = ?, espessura_mm = ?, descricao = ? WHERE ID_Material = ?';
  db.query(sql, [ID_Fornecedor || null, nome, tipo, unidade, espessura_mm || null, descricao, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Material atualizado com sucesso' });
  });
});

app.delete('/api/materiais/:id', (req, res) => {
  db.query('DELETE FROM Materiais WHERE ID_Material = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Material removido com sucesso' });
  });
});

// ==========================================
// 6. MÁQUINAS
// ==========================================
app.get('/api/maquinas', (req, res) => {
  const sql = `
    SELECT m.*, c.nome as responsavel 
    FROM Maquinas m 
    LEFT JOIN colaborador c ON m.ID_colaborador = c.ID_colaborador 
    ORDER BY m.ID_maquina DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/maquinas/:id', (req, res) => {
  const sql = `
    SELECT m.*, c.nome as responsavel 
    FROM Maquinas m 
    LEFT JOIN colaborador c ON m.ID_colaborador = c.ID_colaborador 
    WHERE m.ID_maquina = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Máquina não encontrada' });
    res.json(results[0]);
  });
});

app.post('/api/maquinas', (req, res) => {
  const { ID_colaborador, tipo, nome, status, capacidade, ultima_manutencao } = req.body;
  const sql = 'INSERT INTO Maquinas (ID_colaborador, tipo, nome, status, capacidade, ultima_manutencao) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [ID_colaborador || null, tipo, nome, status || 'Operacional', capacidade, ultima_manutencao || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Máquina cadastrada com sucesso', id: result.insertId });
  });
});

app.put('/api/maquinas/:id', (req, res) => {
  const { ID_colaborador, tipo, nome, status, capacidade, ultima_manutencao } = req.body;
  const sql = 'UPDATE Maquinas SET ID_colaborador = ?, tipo = ?, nome = ?, status = ?, capacidade = ?, ultima_manutencao = ? WHERE ID_maquina = ?';
  db.query(sql, [ID_colaborador || null, tipo, nome, status, capacidade, ultima_manutencao || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Máquina atualizada com sucesso' });
  });
});

app.delete('/api/maquinas/:id', (req, res) => {
  db.query('DELETE FROM Maquinas WHERE ID_maquina = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Máquina removida com sucesso' });
  });
});

// ==========================================
// 7. USUÁRIOS (COLABORADOR)
// ==========================================
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT ID_colaborador, perfil, nome, email, senha, status FROM colaborador ORDER BY ID_colaborador DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/usuarios/:id', (req, res) => {
  db.query('SELECT ID_colaborador, perfil, nome, email, senha, status FROM colaborador WHERE ID_colaborador = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(results[0]);
  });
});

app.post('/api/usuarios', (req, res) => {
  const { perfil, nome, email, senha, status } = req.body;
  const sql = 'INSERT INTO colaborador (perfil, nome, email, senha, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [perfil || 'Operador', nome, email, senha || '123456', status || 'Ativo'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuário cadastrado com sucesso', id: result.insertId });
  });
});

app.put('/api/usuarios/:id', (req, res) => {
  const { perfil, nome, email, senha, status } = req.body;
  let sql, params;
  if (senha && senha.trim() !== '') {
    sql = 'UPDATE colaborador SET perfil = ?, nome = ?, email = ?, senha = ?, status = ? WHERE ID_colaborador = ?';
    params = [perfil, nome, email, senha, status, req.params.id];
  } else {
    sql = 'UPDATE colaborador SET perfil = ?, nome = ?, email = ?, status = ? WHERE ID_colaborador = ?';
    params = [perfil, nome, email, status, req.params.id];
  }
  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuário atualizado com sucesso' });
  });
});

app.delete('/api/usuarios/:id', (req, res) => {
  db.query('DELETE FROM colaborador WHERE ID_colaborador = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuário removido com sucesso' });
  });
});

// ==========================================
// 8. OFICINA (LOG DE CORTES)
// ==========================================
app.get('/api/oficina', (req, res) => {
  db.query('SELECT * FROM Log_cortes ORDER BY ID_corte DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ==========================================
// 9. LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  db.query('SELECT ID_colaborador, perfil, nome, email, status FROM colaborador WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ message: 'Sucesso', usuario: results[0] });
    } else {
      res.status(401).json({ error: 'Email ou senha incorretos' });
    }
  });
});

// ==========================================
// 10. DASHBOARD STATS
// ==========================================
app.get('/api/dashboard/stats', (req, res) => {
  const queryPedidos = 'SELECT * FROM pedido';
  const queryAlertas = 'SELECT * FROM Alertas';

  db.query(queryPedidos, (errPedidos, pedidos = []) => {
    if (errPedidos) {
      return res.status(500).json({ error: errPedidos.message });
    }

    db.query(queryAlertas, (errAlertas, alertas = []) => {
      if (errAlertas) {
        return res.status(500).json({ error: errAlertas.message });
      }

      const totalPedidos = pedidos.length;
      let pedidosConcluidos = 0;
      let pedidosEmProducao = 0;
      let pedidosAguardando = 0;

      pedidos.forEach(p => {
        const s = (p.status || '').toLowerCase().trim();
        if (s.includes('concl') || s.includes('finaliz')) {
          pedidosConcluidos++;
        } else if (s.includes('prod') || s.includes('andamento') || s.includes('execu')) {
          pedidosEmProducao++;
        } else {
          pedidosAguardando++;
        }
      });
      const pedidosEmAberto = totalPedidos - pedidosConcluidos;

      const totalAlertas = alertas.length;
      let alertasResolvidos = 0;
      let alertasPendentes = 0;
      let alertasEmAnalise = 0;
      let alertasCriticos = 0;

      alertas.forEach(a => {
        const resolvido = a.resolvido === 1 || a.resolvido === true || String(a.resolvido).toLowerCase() === 'true';
        const nivel = (a.nivel || '').toLowerCase().trim();
        const tipo = (a.tipo || '').toLowerCase().trim();

        if (nivel.includes('alto') || nivel.includes('crit')) {
          alertasCriticos++;
        }

        if (resolvido) {
          alertasResolvidos++;
        } else {
          if (tipo.includes('analise') || tipo.includes('análise')) {
            alertasEmAnalise++;
          } else {
            alertasPendentes++;
          }
        }
      });
      const alertasEmAberto = totalAlertas - alertasResolvidos;

      res.json({
        success: true,
        totalPedidos,
        pedidosConcluidos,
        pedidosEmProducao,
        pedidosAguardando,
        pedidosEmAberto,
        totalAlertas,
        alertasResolvidos,
        alertasPendentes,
        alertasEmAnalise,
        alertasEmAberto,
        alertasCriticos,
        pedidos,
        alertas
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Servidor AçoSmart rodando em http://localhost:3000');
});

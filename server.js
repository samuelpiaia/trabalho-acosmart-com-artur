const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

// 1. Alertas
app.get('/api/alertas', (req, res) => {
  db.query('SELECT * FROM Alertas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. Clientes
app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3. Fornecedores
app.get('/api/fornecedores', (req, res) => {
  db.query('SELECT * FROM Fornecedores', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 4. Pedidos
app.get('/api/pedidos', (req, res) => {
  db.query('SELECT * FROM pedido', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 5. Materiais
app.get('/api/materiais', (req, res) => {
  db.query('SELECT * FROM Materiais', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 6. Máquinas
app.get('/api/maquinas', (req, res) => {
  db.query('SELECT * FROM Maquinas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 7. Usuários (Colaboradores)
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT ID_colaborador, perfil, nome, email, status FROM colaborador', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 8. Oficina (Log de cortes)
app.get('/api/oficina', (req, res) => {
  db.query('SELECT * FROM Log_cortes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 9. Login
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

app.listen(3000, () => {
  console.log('Servidor AçoSmart rodando em http://localhost:3000');
});
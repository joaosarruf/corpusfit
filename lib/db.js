const sqlite3 = require('sqlite3').verbose();

// Abrir/criar o banco de dados 'database.sqlite'
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conexão com o banco de dados SQLite estabelecida.');
  }
});

// Criar tabela 'users' (para alunos e professores) com o campo 'login'
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('aluno', 'professor', 'admin')) NOT NULL
  )
`);

// Criar tabela 'treinos' (para armazenar os treinos)
db.run(`
  CREATE TABLE IF NOT EXISTS treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    category TEXT CHECK(category IN ('PLANOS', 'AVISOS', 'AULAS')) NOT NULL
);
`);



module.exports = db;

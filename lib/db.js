const sqlite3 = require('sqlite3').verbose();

// Define o banco de dados com base no ambiente
const dbFile = process.env.NODE_ENV === 'production' 
  ? './database.sqlite' // Banco de produção
  : './database-dev.sqlite'; // Banco de desenvolvimento

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log(`Conexão com o banco de dados (${process.env.NODE_ENV}) estabelecida.`);
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

// Criar tabela 'exercicios' (para armazenar os exercícios de cada treino)
db.run(`
  CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    carga INTEGER NOT NULL,
    repeticoes INTEGER NOT NULL,
    FOREIGN KEY (treino_id) REFERENCES treinos(id)
  )
`);

// Criar tabela 'treino_sessions' (para registrar as sessões de treino dos alunos)
db.run(`
  CREATE TABLE IF NOT EXISTS treino_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    treino_id INTEGER NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES users(id),
    FOREIGN KEY (treino_id) REFERENCES treinos(id)
  )
`);

// Criar tabela 'cards' (para armazenar os cards)
db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    category TEXT CHECK(category IN ('PLANOS', 'AVISOS', 'AULAS')) NOT NULL
  )
`);

module.exports = db;

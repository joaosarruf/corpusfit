// Importar módulos necessários
const db = require('./lib/db');
const bcrypt = require('bcrypt');

// Função para gerar senhas hasheadas
async function createUser(name, login, role) {
  const password = await bcrypt.hash('senha123', 10); // Defina uma senha segura aqui
  db.run(
    `INSERT INTO users (name, login, password, role) VALUES (?, ?, ?, ?)`,
    [name, login, password, role],
    (err) => {
      if (err) {
        console.error(`Erro ao criar usuário ${name}:`, err.message);
      } else {
        console.log(`Usuário "${name}" criado com sucesso!`);
      }
    }
  );
}

// Conexão com o banco e criação dos usuários
db.serialize(async () => {
  console.log("Conexão com o banco de dados SQLite estabelecida.");

  // Criar novos usuários
  await createUser("ADMIN", "admin@corpusfit", "admin");
  await createUser("AlunoTeste", "aluno@corpusfit", "aluno");
  await createUser("Professor1", "professor1@corpusfit", "professor");
  await createUser("Professor2", "professor2@corpusfit", "professor");

  console.log("Conexão com o banco de dados encerrada.");
  db.close();
});

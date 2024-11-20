const db = require('./lib/db');

// Função para converter datas de "DD/MM/AAAA" ou "DD/MM/AA" para "YYYY-MM-DD"
const formatDate = (date) => {
  const parts = date.split('/');
  
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];

    // Verificar se o ano está no formato de 2 dígitos e convertê-lo para 4 dígitos
    if (year.length === 2) {
      year = `20${year}`;
    }

    return `${year}-${month}-${day}`;
  }

  return date; // Retorna a data original caso não esteja no formato esperado
};

// Função para atualizar as datas no banco de dados
const updateDates = () => {
  db.all("SELECT id, birth_date FROM users WHERE birth_date NOT LIKE '____-__-__'", (err, rows) => {
    if (err) {
      console.error("Erro ao buscar datas:", err);
      return;
    }

    rows.forEach((user) => {
      const formattedDate = formatDate(user.birth_date);

      // Atualiza a data formatada no banco de dados
      db.run(
        "UPDATE users SET birth_date = ? WHERE id = ?",
        [formattedDate, user.id],
        (updateErr) => {
          if (updateErr) {
            console.error(`Erro ao atualizar a data para o usuário com ID ${user.id}:`, updateErr);
          } else {
            console.log(`Data de nascimento do usuário com ID ${user.id} atualizada para: ${formattedDate}`);
          }
        }
      );
    });

    // Fechar a conexão com o banco de dados ao terminar
    db.close(() => {
      console.log("Conexão com o banco de dados encerrada.");
    });
  });
};

// Executar a função
updateDates();

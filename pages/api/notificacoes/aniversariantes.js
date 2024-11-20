// pages/api/notificacoes/aniversariantes.js

const db = require('../../../lib/db');

const handler = (req, res) => {
  if (req.method === 'GET') {
    const currentMonth = new Date().getMonth() + 1;
    const monthString = String(currentMonth).padStart(2, '0');

    db.all(
      'SELECT id, name, birth_date, cpf FROM users WHERE role = "aluno" AND birth_date IS NOT NULL AND strftime("%m", birth_date) = ?',
      [monthString],
      (err, rows) => {
        if (err) {
          console.error('Erro ao buscar aniversariantes:', err);
          return res.status(500).json({ error: 'Erro ao buscar aniversariantes' });
        }
        return res.status(200).json(rows);
      }
    );
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
export default handler;
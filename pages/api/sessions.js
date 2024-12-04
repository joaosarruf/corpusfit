// pages/api/sessions.js

import db from '../../lib/db';

const handler = (req, res) => {
  if (req.method === 'POST') {
    const { login, treino_id, data } = req.body;

    if (!login || !treino_id || !data) {
      return res.status(400).json({ error: 'Dados incompletos. Verifique os campos enviados.' });
    }

    // Buscar aluno_id com base no login
    db.get('SELECT id FROM users WHERE login = ?', [login], (err, aluno) => {
      if (err) {
        console.error('Erro ao buscar aluno:', err);
        return res.status(500).json({ error: 'Erro ao buscar aluno' });
      }

      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      const aluno_id = aluno.id;

      // Inserir a sessão de treino
      db.run(
        'INSERT INTO treino_sessions (aluno_id, treino_id, data) VALUES (?, ?, ?)',
        [aluno_id, treino_id, data],
        function (err) {
          if (err) {
            console.error('Erro ao registrar sessão de treino:', err);
            return res.status(500).json({ error: 'Erro ao registrar sessão de treino' });
          }
          res.status(201).json({ message: 'Sessão de treino registrada com sucesso!' });
        }
      );
    });
  } else if (req.method === 'GET') {
    const { aluno_id } = req.query;

    if (!aluno_id) {
      return res.status(400).json({ error: 'ID do aluno é necessário' });
    }

    // Recuperar as sessões de treino do aluno, incluindo detalhes do treino
    const query = `
      SELECT ts.*, t.descricao AS treino_descricao
      FROM treino_sessions ts
      INNER JOIN treinos t ON ts.treino_id = t.id
      WHERE ts.aluno_id = ?
    `;

    db.all(query, [aluno_id], (err, sessions) => {
      if (err) {
        console.error('Erro ao buscar sessões:', err);
        return res.status(500).json({ error: 'Erro ao buscar sessões' });
      }

      res.status(200).json(sessions);
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};

export default handler;

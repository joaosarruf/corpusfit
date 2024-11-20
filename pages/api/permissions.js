const db = require('../../lib/db');

const handler = (req, res) => {
  const { id } = req.query; // Obtenha o ID do usuário para verificar permissões

  if (req.method === 'GET') {
    if (id) {
      // Se um ID for fornecido, buscar as permissões do usuário
      db.all('SELECT * FROM permissions WHERE user_id = ?', [id], (err, rows) => {
        if (err) {
          console.error('Erro ao buscar permissões:', err);
          return res.status(500).json({ error: 'Erro ao buscar permissões' });
        }
        
        // Se não houver permissões, retornar um array vazio
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Nenhuma permissão encontrada para este usuário' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(rows);
      });
    } else {
      res.status(400).json({ error: 'ID do professor não fornecido' });
    }
  }  else if (req.method === 'POST') {
    // Extract userId and role from the request body
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId e role são obrigatórios' });
    }

    // Insert the new permission into the database
    db.run(
      'INSERT INTO permissions (user_id, role) VALUES (?, ?)',
      [userId, role],
      function (err) {
        if (err) {
          console.error('Erro ao adicionar permissão:', err);
          return res.status(500).json({ error: 'Erro ao adicionar permissão' });
        }

        res.status(200).json({ message: 'Permissão adicionada com sucesso' });
      }
    );
  } else if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'ID do professor não fornecido' });
    }

    // Remover a permissão 'can_manage_posts' do professor
    db.run('DELETE FROM permissions WHERE user_id = ? AND role = "can_manage_posts"', [id], function (err) {
      if (err) {
        console.error('Erro ao remover permissão do professor:', err);
        return res.status(500).json({ error: 'Erro ao remover permissão do professor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Permissão não encontrada para o professor' });
      }

      res.status(200).json({ message: 'Permissão removida com sucesso' });
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
export default handler;
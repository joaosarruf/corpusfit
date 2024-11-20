const db = require('../../lib/db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; // Número de rounds de salting (ajusta a segurança)

const handler =(req, res) => {
  const { id } = req.query; // Obtenha o ID do usuário para verificações específicas

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

        res.status(200).json(rows);
      });
    } else {
      // Se não houver ID, retornar todos os professores
      db.all('SELECT * FROM users WHERE role = "professor"', [], (err, rows) => {
        if (err) {
          console.error('Erro ao buscar professores:', err);
          return res.status(500).json({ error: 'Erro ao buscar professores' });
        }
        const professores = rows.map(({ password, ...professor }) => professor);
        res.status(200).json(professores || []);
      });
    }
  } else if (req.method === 'POST') {
    const { name, login, password } = req.body;

    if (!name || !login || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }
     // Criptografar a senha antes de salvar
     bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
      if (err) {
        console.error('Erro ao criptografar senha:', err);
        return res.status(500).json({ error: 'Erro ao criptografar senha' });
      }

    db.run(
      'INSERT INTO users (name, login, password, role) VALUES (?, ?, ?, "professor")',
        [name, login, hashedPassword], // Salvar o hash no lugar da senha
        function (err) {
        if (err) {
          console.error('Erro ao criar aluno:', err);
          return res.status(500).json({ error: 'Erro ao criar aluno' });
        }
        res.status(201).json({ id: this.lastID, name, login, role: 'aluno' });
      }
    );
  });
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do professor não fornecido' });
    }

    db.run('DELETE FROM users WHERE id = ? AND role = "professor"', [id], function (err) {
      if (err) {
        console.error('Erro ao deletar professor:', err);
        return res.status(500).json({ error: 'Erro ao deletar professor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      // Remover as permissões associadas ao professor
      db.run('DELETE FROM permissions WHERE user_id = ?', [id], function (err) {
        if (err) {
          console.error('Erro ao deletar permissões do professor:', err);
        }
      });

      res.status(200).json({ message: 'Professor e permissões deletados com sucesso' });
    });
  } else if (req.method === 'PATCH') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do professor não fornecido' });
    }

    
    // Verificar se o professor já tem a permissão
    db.get('SELECT * FROM permissions WHERE user_id = ? AND role = "can_manage_posts"', [id], (err, row) => {
        if (err) {
          console.error('Erro ao buscar permissões do professor:', err);
          return res.status(500).json({ error: 'Erro ao buscar permissões do professor' });
        }
  
        // Se o professor já tem a permissão, retornar sucesso
        if (row) {
          return res.status(200).json({ message: 'O professor já possui a permissão' });
        }
  
        // Se não tiver, adicionar a permissão
        db.run('INSERT INTO permissions (user_id, role) VALUES (?, "can_manage_posts")', [id], function (err) {
          if (err) {
            console.error('Erro ao adicionar permissão ao professor:', err);
            return res.status(500).json({ error: 'Erro ao adicionar permissão ao professor' });
          }
  
          res.status(200).json({ message: 'Permissão concedida com sucesso' });
        });
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
  
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

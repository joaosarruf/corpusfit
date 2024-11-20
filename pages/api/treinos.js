const db = require('../../lib/db'); // Importar a conexão com o banco de dados

const handler = (req, res) => {
  if (req.method === 'POST') {
    const { aluno_id, descricao, exercicios, data } = req.body;

    if (!aluno_id || !descricao || !exercicios || !data) {
      return res.status(400).json({ error: 'Dados incompletos. Verifique os campos enviados.' });
    }

    const tipoTreino = descricao;

    db.get('SELECT * FROM treinos WHERE aluno_id = ? AND descricao = ?', [aluno_id, tipoTreino], (err, existingTreino) => {
      if (err) {
        console.error('Erro ao verificar treino existente:', err);
        return res.status(500).json({ error: 'Erro ao verificar treino existente' });
      }

      if (existingTreino) {
        // Se o treino já existir, atualizá-lo
        db.run(
          'UPDATE treinos SET data = ? WHERE id = ?',
          [data, existingTreino.id],
          function (updateErr) {
            if (updateErr) {
              console.error('Erro ao atualizar treino:', updateErr);
              return res.status(500).json({ error: 'Erro ao atualizar treino' });
            }

            const treino_id = existingTreino.id;
            db.run('DELETE FROM exercicios WHERE treino_id = ?', [treino_id], (deleteErr) => {
              if (deleteErr) {
                console.error('Erro ao apagar exercícios antigos:', deleteErr);
                return res.status(500).json({ error: 'Erro ao apagar exercícios antigos' });
              }

              const stmt = db.prepare('INSERT INTO exercicios (treino_id, name, carga, repeticoes) VALUES (?, ?, ?, ?)');
              exercicios.forEach((exercicio) => {
                stmt.run(treino_id, exercicio.name, exercicio.carga, exercicio.repeticoes);
              });
              stmt.finalize((finalErr) => {
                if (finalErr) {
                  console.error('Erro ao adicionar novos exercícios:', finalErr);
                  return res.status(500).json({ error: 'Erro ao adicionar novos exercícios' });
                }
                res.status(200).json({ message: 'Treino atualizado com sucesso!' });
              });
            });
          }
        );
      } else {
        db.run(
          'INSERT INTO treinos (aluno_id, descricao, data) VALUES (?, ?, ?)',
          [aluno_id, descricao, data],
          function (err) {
            if (err) {
              console.error('Erro ao criar treino:', err);
              return res.status(500).json({ error: 'Erro ao criar treino' });
            }

            const treino_id = this.lastID; // Pegar o ID do treino recém-criado
            const stmt = db.prepare('INSERT INTO exercicios (treino_id, name, carga, repeticoes) VALUES (?, ?, ?, ?)');
            exercicios.forEach((exercicio) => {
              stmt.run(treino_id, exercicio.name, exercicio.carga, exercicio.repeticoes);
            });
            stmt.finalize((finalErr) => {
              if (finalErr) {
                console.error('Erro ao adicionar exercícios:', finalErr);
                return res.status(500).json({ error: 'Erro ao adicionar exercícios' });
              }
              res.status(201).json({ message: 'Treino e exercícios adicionados com sucesso!' });
            });
          }
        );
      }
    });
  } else if (req.method === 'GET') {
    const { aluno_id, treino_id } = req.query;
    
    if (!aluno_id) {
      return res.status(400).json({ error: 'ID do aluno é necessário' });
    }

    if (treino_id) {
      // Buscar detalhes específicos de um treino
      db.get('SELECT * FROM treinos WHERE id = ? AND aluno_id = ?', [treino_id, aluno_id], (err, treino) => {
        if (err) {
          console.error('Erro ao buscar treino específico:', err);
          return res.status(500).json({ error: 'Erro ao buscar treino específico' });
        }

        if (!treino) {
          return res.status(404).json({ message: 'Treino não encontrado' });
        }

        // Buscar os exercícios associados ao treino
        db.all('SELECT * FROM exercicios WHERE treino_id = ?', [treino.id], (err, exercicios) => {
          if (err) {
            console.error('Erro ao buscar exercícios do treino:', err);
            return res.status(500).json({ error: 'Erro ao buscar exercícios do treino' });
          }

          // Retornar o treino com os exercícios
          return res.status(200).json({
            ...treino,
            exercicios: exercicios || [], // Retorna os exercícios ou um array vazio
          });
        });
      });
    } else {
      // Se nenhum treino_id for passado, buscar todos os treinos do aluno
      db.all('SELECT * FROM treinos WHERE aluno_id = ?', [aluno_id], (err, treinos) => {
        if (err) {
          console.error('Erro ao buscar treinos:', err);
          return res.status(500).json({ error: 'Erro ao buscar treinos' });
        }

        // Para cada treino, buscar os exercícios relacionados
        const treinosComExercicios = [];

        const fetchExerciciosParaTreino = (treino, callback) => {
          db.all('SELECT * FROM exercicios WHERE treino_id = ?', [treino.id], (err, exercicios) => {
            if (err) {
              return callback(err);
            }
            treinosComExercicios.push({
              ...treino,
              exercicios: exercicios || [], // Inclui os exercícios no treino
            });
            callback(null);
          });
        };

        let index = 0;
        const processarProximoTreino = () => {
          if (index < treinos.length) {
            fetchExerciciosParaTreino(treinos[index], (err) => {
              if (err) {
                console.error('Erro ao buscar exercícios:', err);
                return res.status(500).json({ error: 'Erro ao buscar exercícios' });
              }
              index++;
              processarProximoTreino();
            });
          } else {
            res.status(200).json(treinosComExercicios); // Retornar os treinos com os exercícios
          }
        };

        processarProximoTreino();
      });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
export default handler;
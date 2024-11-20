import db from '../../lib/db';

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { category } = req.query;
      if (category) {
        db.all('SELECT * FROM cards WHERE category = ?', [category], (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ cards: rows });
          }
        });
      } else {
        db.all('SELECT * FROM cards', (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ cards: rows });
          }
        });
      }
      break;

    case 'POST':
      const { title, description, image_path, category: newCategory, zoom_pc, zoom_mobile, position_pc, position_mobile } = req.body;

      if (!title || !description || !image_path || !newCategory) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
      }

      db.run(
        `INSERT INTO cards (title, description, image_path, category, zoom_pc, zoom_mobile, position_pc, position_mobile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          image_path,
          newCategory,
          zoom_pc,
          zoom_mobile,
          JSON.stringify(position_pc),  // Certifica-se de salvar como string JSON
          JSON.stringify(position_mobile) // Certifica-se de salvar como string JSON
        ],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(201).json({ id: this.lastID });
          }
        }
      );
      break;

    case 'PUT':
      const { id, updatedTitle, updatedDescription, updatedImagePath, updatedCategory, updatedZoomPC, updatedZoomMobile, updatedPositionPC, updatedPositionMobile } = req.body;

      if (!id || !updatedTitle || !updatedDescription || !updatedImagePath || !updatedCategory) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
      }

      db.run(
        `UPDATE cards SET title = ?, description = ?, image_path = ?, category = ?, zoom_pc = ?, zoom_mobile = ?, position_pc = ?, position_mobile = ? WHERE id = ?`,
        [updatedTitle, updatedDescription, updatedImagePath, updatedCategory, updatedZoomPC, updatedZoomMobile, JSON.stringify(updatedPositionPC), JSON.stringify(updatedPositionMobile), id],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else if (this.changes === 0) {
            res.status(404).json({ error: 'Card não encontrado' });
          } else {
            res.status(200).json({ message: 'Card atualizado com sucesso' });
          }
        }
      );
      break;

    case 'DELETE':
      const { id: deleteId } = req.query;

      if (!deleteId) {
        res.status(400).json({ error: 'ID do card é necessário' });
        return;
      }

      db.run('DELETE FROM cards WHERE id = ?', [deleteId], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Card não encontrado' });
        } else {
          res.status(200).json({ message: 'Card deletado com sucesso' });
        }
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const bcrypt = require('bcrypt');
const db = require('../../lib/db');

export default async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e senha são obrigatórios.' });

  db.get('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?', [token, Date.now()], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Token inválido ou expirado.' });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Erro ao criptografar senha.' });

      db.run(
        'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        [hashedPassword, user.id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao atualizar senha.' });

          res.status(200).json({ message: 'Senha redefinida com sucesso.' });
        }
      );
    });
  });
};

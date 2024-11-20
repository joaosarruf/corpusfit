const bcrypt = require('bcrypt');
const db = require('../../lib/db');

const handler = (req, res) => {
  const { login, password } = req.body;

  db.get('SELECT * FROM users WHERE login = ?', [login], (err, user) => {
    if (err) {
      console.error('Erro no banco de dados:', err);
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar a senha usando bcrypt
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Erro ao comparar senha:', err);
        return res.status(500).json({ error: 'Erro ao comparar senha' });
      }

      if (result) {
        // Remover a senha antes de retornar o usuário
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword });
      } else {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
    });
  });
};
export default handler;
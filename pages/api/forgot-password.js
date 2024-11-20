const crypto = require('crypto');
const db = require('../../lib/db');
const nodemailer = require('nodemailer');

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // ou o provedor de e-mail (SMTP customizado)
    auth: {
        user: 'joaopsarruf@gmail.com', // substitua pelo seu e-mail
        pass: 'drzv wxtw imuu gvpu', // substitua pela senha do seu e-mail
    },
});

export default async (req, res) => {
    const { login, email } = req.body;

    // Verifica se o usuário existe pelo login
    db.get('SELECT * FROM users WHERE login = ?', [login], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no banco de dados' });
        }

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Gerar um token aleatório
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 3600000; // 1 hora de validade

        // Armazena o token e a data de expiração no banco de dados
        db.run(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE login = ?',
            [token, expiration, login],
            async (err) => {
                if (err) {
                    console.error('Erro ao salvar o token:', err.message);
                    return res.status(500).json({ error: 'Erro ao salvar o token' });
                }

                // Configura e envia o e-mail de recuperação
                const mailOptions = {
                    from: 'joaopsarruf@gmail.com', // Seu e-mail
                    to: email, // E-mail fornecido pelo usuário
                    subject: 'Recuperação de senha',
                    text: `Clique no link para redefinir sua senha: http://corpusfit.pagekite.me/reset-password?token=${token}`, // Usando 'token'
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Erro ao enviar e-mail:', error);
                        return res.status(500).json({ error: 'Erro ao enviar e-mail' });
                    } else {
                        console.log('E-mail enviado:', info.response);
                        return res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso' });
                    }
                });
            }
        );
    });
};

// pages/api/alunos.js

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import db from '../../lib/db';
import { IncomingForm } from 'formidable';

const SALT_ROUNDS = 10;

// Configuração para desativar o body parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função para processar o formulário com Formidable
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: false,
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'alunos'),
      keepExtensions: true,
      allowEmptyFiles: true, // Permitir arquivos vazios
      filename: (name, ext, part) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${name}-${uniqueSuffix}${ext}`;
      },
    });

    // Cria o diretório se não existir
    fs.mkdirSync(path.join(process.cwd(), 'public', 'uploads', 'alunos'), { recursive: true });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// Promisify db.get e db.run
const dbGet = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const createPhotosTableIfNeeded = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      photo_path TEXT NOT NULL,
      FOREIGN KEY (aluno_id) REFERENCES users(id)
    )
  `;
  
  await dbRun(createTableSQL, []);
};

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { login, checkLogin } = req.query;

    if (checkLogin) {
      try {
        const user = await dbGet('SELECT * FROM users WHERE login = ?', [checkLogin]);
        res.status(200).json({ available: !user });
      } catch (err) {
        console.error('Erro ao verificar login:', err);
        res.status(500).json({ error: 'Erro ao verificar login' });
      }
    } else if (login) {
      try {
        const aluno = await dbGet('SELECT * FROM users WHERE login = ?', [login]);
        if (!aluno) {
          return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const foto = await dbGet('SELECT photo_path FROM photos WHERE aluno_id = ?', [aluno.id]);
        const treinos = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM treinos WHERE aluno_id = ?', [aluno.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        res.status(200).json({
          aluno: {
            id: aluno.id, // Adicione esta linha
            name: aluno.name,
            login: aluno.login,
            photo_path: foto ? foto.photo_path : null, // Foto separada
          },
          treinos: treinos || [],
        });
      } catch (err) {
        console.error('Erro ao buscar aluno ou treinos:', err);
        res.status(500).json({ error: 'Erro ao buscar aluno ou treinos' });
      }
    } else {
      try {
        const rows = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM users WHERE role = "aluno"', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        const alunos = rows.map(({ password, ...aluno }) => aluno);
        res.status(200).json(alunos || []);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
      }
    }
  } else if (req.method === 'POST') {
    try {
      await createPhotosTableIfNeeded();
      const { fields, files } = await parseForm(req);

      console.log('Campos recebidos:', fields);
      console.log('Arquivos recebidos:', files);

      // Acessando diretamente os valores dos campos para garantir que sejam strings
      const { name, login, password, birth_date, cpf, email, telefone } = fields;
      const alunoName = name && name[0];  // Acessando o primeiro valor do array 'name'
      const alunoLogin = login && login[0];  // Acessando o primeiro valor do array 'login'

      // Verificar se os campos obrigatórios estão presentes
      if (!alunoName || !alunoLogin || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
      }

      // Verificar se o login já existe
      const existingUser = await dbGet('SELECT * FROM users WHERE login = ?', [alunoLogin]);
      if (existingUser) {
        return res.status(400).json({ error: 'Login já está em uso' });
      }

      // Garantir que a senha é uma string
      let passwordStr = password[0]; // A senha está no primeiro elemento do array
      if (typeof passwordStr !== 'string') {
        console.error('Tipo de Password inválido:', typeof passwordStr);
        return res.status(400).json({ error: 'Senha inválida' });
      }

      console.log('Password recebido no backend:', passwordStr);

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(passwordStr, SALT_ROUNDS);

      // Caminho da foto, se houver
      let photoPath = null;
      if (files.photo && files.photo[0]) {
        const filePath = files.photo[0].filepath || files.photo[0].path;
        if (filePath) {
          photoPath = `/uploads/alunos/${path.basename(filePath)}`;
        }
      }

      // Inserir o novo aluno no banco de dados
      const result = await dbRun(
        'INSERT INTO users (name, login, password, role, birth_date, cpf, email, telefone, photo_path) VALUES (?, ?, ?, "aluno", ?, ?, ?, ?, ?)',
        [
          alunoName,  // Acessando o valor correto
          alunoLogin, // Acessando o valor correto
          hashedPassword, 
          birth_date || null, 
          cpf || null, 
          email || null, 
          telefone || null, 
          photoPath, 
        ]
      );

      // Se foto foi enviada, armazena na tabela 'photos'
      if (photoPath) {
        await dbRun('INSERT INTO photos (aluno_id, photo_path) VALUES (?, ?)', [result.lastID, photoPath]);
      }

      // Retornar os dados do aluno criado
      res.status(201).json({
        id: result.lastID,
        name: alunoName,  // Acessando o valor correto
        login: alunoLogin, // Acessando o valor correto
        role: 'aluno',
        photo_path: photoPath,
      });
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      res.status(500).json({ error: 'Erro ao criar aluno' });
    }
  } else if (req.method === 'PUT') {
    try {
      const contentType = req.headers['content-type'] || '';
      let updatedData = {};
      let files = {};

      if (contentType.includes('application/json')) {
        // Parse JSON
        const body = await new Promise<string>((resolve, reject) => {
          let data = '';
          req.on('data', chunk => {
            data += chunk;
          });
          req.on('end', () => resolve(data));
          req.on('error', err => reject(err));
        });
        updatedData = JSON.parse(body);
        console.log('Dados JSON recebidos para atualização:', updatedData);
      } else if (contentType.includes('multipart/form-data')) {
        // Parse form data
        const parsed = await parseForm(req);
        updatedData = parsed.fields;
        files = parsed.files;
        console.log('Campos recebidos para atualização:', updatedData);
        console.log('Arquivos recebidos para atualização:', files);
      } else {
        return res.status(415).json({ error: 'Unsupported Media Type' });
      }

      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do aluno é necessário' });
      }

      const { cpf, birth_date, email, telefone } = updatedData;

      // Construir a query dinamicamente com os campos fornecidos
      const fieldsToUpdate = [];
      const values = [];

      if (cpf) {
        if (typeof cpf !== 'string') {
          console.error('Tipo de CPF inválido:', typeof cpf);
          return res.status(400).json({ error: 'CPF inválido' });
        }
        fieldsToUpdate.push('cpf = ?');
        values.push(cpf);
      }

      if (birth_date) {
        if (typeof birth_date !== 'string') {
          console.error('Tipo de Data de Nascimento inválido:', typeof birth_date);
          return res.status(400).json({ error: 'Data de Nascimento inválida' });
        }
        fieldsToUpdate.push('birth_date = ?');
        values.push(birth_date);
      }

      if (email) {
        if (typeof email !== 'string') {
          console.error('Tipo de Email inválido:', typeof email);
          return res.status(400).json({ error: 'Email inválido' });
        }
        fieldsToUpdate.push('email = ?');
        values.push(email);
      }

      if (telefone) {
        if (typeof telefone !== 'string') {
          console.error('Tipo de Telefone inválido:', typeof telefone);
          return res.status(400).json({ error: 'Telefone inválido' });
        }
        fieldsToUpdate.push('telefone = ?');
        values.push(telefone);
      }

      // Atualizar o aluno no banco de dados
      const setClause = fieldsToUpdate.join(', ');
      const updateQuery = `UPDATE users SET ${setClause} WHERE id = ?`;
      values.push(id);

      await dbRun(updateQuery, values);
      
      // Se houver foto para atualizar, faça isso também
      if (files.photo) {
        const filePath = files.photo.filepath || files.photo.path;
        if (filePath) {
          const newPhotoPath = `/uploads/alunos/${path.basename(filePath)}`;

          // Atualizar foto do aluno
          await dbRun('UPDATE photos SET photo_path = ? WHERE aluno_id = ?', [newPhotoPath, id]);
          
          // Atualizar foto no aluno
          await dbRun('UPDATE users SET photo_path = ? WHERE id = ?', [newPhotoPath, id]);
        }
      }
      
      res.status(200).json({ message: 'Aluno atualizado com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar aluno:', err);
      res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).json({ error: 'ID do aluno é necessário' });
    }
  
    try {
      // Excluir o aluno da tabela 'users'
      await dbRun('DELETE FROM users WHERE id = ?', [id]);
  
      // Excluir registros relacionados, se necessário
      await dbRun('DELETE FROM photos WHERE aluno_id = ?', [id]);
      await dbRun('DELETE FROM treinos WHERE aluno_id = ?', [id]);
      await dbRun('DELETE FROM treino_sessions WHERE aluno_id = ?', [id]);
      // Se houver exercícios relacionados aos treinos, você pode precisar excluí-los também
  
      res.status(200).json({ message: 'Aluno excluído com sucesso.' });
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      res.status(500).json({ error: 'Erro ao excluir aluno.' });
    }
  }
};

export default handler;

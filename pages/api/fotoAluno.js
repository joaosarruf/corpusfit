const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./database.db');

// Configuração de upload de arquivos usando multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `photo_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });

// Função para criar a tabela de fotos dos alunos caso não exista
const createPhotoTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS fotos_alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      photo_path TEXT NOT NULL,
      FOREIGN KEY (aluno_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de fotos:', err);
    } else {
      console.log('Tabela fotos_alunos criada ou já existente.');
    }
  });
};

// Função para inserir a foto de um aluno no banco de dados
const insertPhoto = (alunoId, photoPath) => {
  const insertQuery = 'INSERT INTO fotos_alunos (aluno_id, photo_path) VALUES (?, ?)';
  db.run(insertQuery, [alunoId, photoPath], function (err) {
    if (err) {
      console.error('Erro ao inserir foto:', err);
    } else {
      console.log('Foto inserida com sucesso. ID:', this.lastID);
    }
  });
};

// Função para recuperar as fotos de um aluno
const getPhotosByAlunoId = (alunoId, callback) => {
  const selectQuery = 'SELECT * FROM fotos_alunos WHERE aluno_id = ?';
  db.all(selectQuery, [alunoId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar fotos:', err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

// Endpoint para fazer upload da foto de um aluno
app.post('/upload-foto', upload.single('foto'), (req, res) => {
  const alunoId = req.body.aluno_id;
  const photoPath = req.file ? req.file.path : null;

  if (!alunoId || !photoPath) {
    return res.status(400).json({ message: 'Aluno ID e foto são obrigatórios.' });
  }

  insertPhoto(alunoId, photoPath);
  res.status(200).json({ message: 'Foto de aluno carregada com sucesso!', path: photoPath });
});

// Endpoint para obter todas as fotos de um aluno
app.get('/fotos/:alunoId', (req, res) => {
  const alunoId = req.params.alunoId;

  getPhotosByAlunoId(alunoId, (err, photos) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar fotos do aluno.' });
    }

    if (photos.length === 0) {
      return res.status(404).json({ message: 'Nenhuma foto encontrada para esse aluno.' });
    }

    res.status(200).json({ photos });
  });
});

// Inicia o servidor e cria a tabela de fotos se necessário
const startServer = () => {
  createPhotoTable();
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
};

startServer();

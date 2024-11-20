import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), 'uploads', filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', 'image/jpeg'); // ajuste para o tipo correto de imagem
    res.send(data);
  });
}

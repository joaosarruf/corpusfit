import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configurar o Multer para armazenar as imagens na pasta 'public/uploads'
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads'); // pasta raiz 'uploads'
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Desativar o bodyParser padrão para que o Multer possa lidar com o upload
  },
};

// Função para lidar com o upload
export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('image')(req, res, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }
      // Retornar o caminho da imagem após o upload
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({ imageUrl });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

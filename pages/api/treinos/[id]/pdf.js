// pages/api/treinos/[id]/pdf.js

import PDFDocument from 'pdfkit';
import db from '../../../../lib/db';

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id } = req.query;

  try {
    // Obter o treino pelo ID
    const treino = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM treinos WHERE id = ?', [id], (err, treinoRow) => {
        if (err) {
          console.error('Erro ao buscar treino:', err);
          return reject(err);
        }
        if (!treinoRow) {
          return reject(new Error('Treino não encontrado'));
        }

        // Obter os exercícios associados ao treino
        db.all('SELECT * FROM exercicios WHERE treino_id = ?', [id], (err, exerciciosRows) => {
          if (err) {
            console.error('Erro ao buscar exercícios do treino:', err);
            return reject(err);
          }
          treinoRow.exercicios = exerciciosRows || [];
          resolve(treinoRow);
        });
      });
    });

    // Criar o PDF
    const doc = new PDFDocument();

    // Configurar o response para enviar um PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=treino_${id}.pdf`);

    // Iniciar o pipe do documento para a resposta HTTP
    doc.pipe(res);

    // Escrever conteúdo no PDF
    doc.fontSize(20).text(`Treino ${treino.descricao}`, { align: 'center' });
    doc.moveDown();

    treino.exercicios.forEach((exercicio, index) => {
      doc.fontSize(14).text(
        `${index + 1}. ${exercicio.name} - ${exercicio.carga} kg - ${exercicio.repeticoes} repetições`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};

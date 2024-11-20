import React from 'react';

const TreinoList: React.FC = () => {
  const treinos = [
    { aluno: 'Aluno 1', treino: 'Treino A' },
    { aluno: 'Aluno 2', treino: 'Treino B' },
  ];

  return (
    <div>
      <h2>Lista de Treinos</h2>
      <ul>
        {treinos.map((treino, index) => (
          <li key={index}>
            {treino.aluno} - {treino.treino}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TreinoList;

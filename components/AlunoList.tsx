import React from 'react';

// Definindo a interface Aluno
interface Aluno {
  id: string;
  name: string;
  login: string;
}

// Definindo as props para o AlunoList
interface AlunoListProps {
  alunos: Aluno[]; // Lista de alunos
  onAlunoClick: (aluno: Aluno) => void; // Função a ser chamada ao clicar no aluno
}

const AlunoList: React.FC<AlunoListProps> = ({ alunos, onAlunoClick }) => {
  return (
    <div>
      <h2>Lista de Alunos</h2>
      <ul>
        {alunos.map((aluno) => (
          <li key={aluno.id} onClick={() => onAlunoClick(aluno)}>
            {aluno.name} - {aluno.login}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlunoList;

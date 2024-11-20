import React, { useState } from 'react';

const TreinoForm: React.FC = () => {
  const [newTreino, setNewTreino] = useState({
    aluno_id: '', // Ajustado para aluno_id
    descricao: '', // Ajustado para descrição do treino
    exercicios: [{ name: '', carga: 0, repeticoes: 0 }], // Exemplo de lista de exercícios
  });

  // Função para adicionar um novo exercício
  const addExercicio = () => {
    setNewTreino({
      ...newTreino,
      exercicios: [...newTreino.exercicios, { name: '', carga: 0, repeticoes: 0 }],
    });
  };

  // Função para alterar o valor de um exercício
  const handleExercicioChange = (index: number, field: string, value: string | number) => {
    const updatedExercicios = newTreino.exercicios.map((exercicio, i) => 
      i === index ? { ...exercicio, [field]: value } : exercicio
    );
    setNewTreino({ ...newTreino, exercicios: updatedExercicios });
  };

  const addTreino = async () => {
    // Lógica para adicionar treino
    console.log(newTreino);

    // Enviar treino para a API
    const response = await fetch('/api/treinos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aluno_id: newTreino.aluno_id,
        descricao: newTreino.descricao,
        exercicios: newTreino.exercicios, // Enviar os exercícios como parte do treino
        data: new Date().toISOString(), // Data atual
      }),
    });

    if (response.ok) {
      console.log('Treino adicionado com sucesso!');
      setNewTreino({
        aluno_id: '',
        descricao: '',
        exercicios: [{ name: '', carga: 0, repeticoes: 0 }],
      }); // Limpa o formulário após sucesso
    } else {
      const error = await response.json();
      console.error('Erro ao adicionar treino:', error);
    }
  };

  return (
    <div>
      <h2>Adicionar Treino</h2>
      <label htmlFor="aluno">Aluno ID:</label>
      <input
        id="aluno"
        type="text"
        placeholder="ID do Aluno"
        value={newTreino.aluno_id}
        onChange={(e) => setNewTreino({ ...newTreino, aluno_id: e.target.value })}
      />

      <label htmlFor="descricao">Descrição do Treino:</label>
      <input
        id="descricao"
        type="text"
        placeholder="Descrição"
        value={newTreino.descricao}
        onChange={(e) => setNewTreino({ ...newTreino, descricao: e.target.value })}
      />

      <h3>Exercícios:</h3>
      {newTreino.exercicios.map((exercicio, index) => (
        <div key={index}>
          <label>Exercício:</label>
          <input
            type="text"
            placeholder="Nome do Exercício"
            value={exercicio.name}
            onChange={(e) => handleExercicioChange(index, 'name', e.target.value)}
          />
          <label>Carga (kg):</label>
          <input
            type="number"
            placeholder="Carga"
            value={exercicio.carga}
            onChange={(e) => handleExercicioChange(index, 'carga', parseFloat(e.target.value))}
          />
          <label>Repetições:</label>
          <input
            type="number"
            placeholder="Repetições"
            value={exercicio.repeticoes}
            onChange={(e) => handleExercicioChange(index, 'repeticoes', parseFloat(e.target.value))}
          />
        </div>
      ))}

      <button type="button" onClick={addExercicio}>Adicionar Exercício</button>
      <button type="button" onClick={addTreino}>Adicionar Treino</button>
    </div>
  );
};

export default TreinoForm;

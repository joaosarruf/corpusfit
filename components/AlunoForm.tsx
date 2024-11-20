import React, { useState } from 'react';

const AlunoForm: React.FC = () => {
  const [newStudent, setNewStudent] = useState({
    name: '',
    login: '',
    password: '',
    treino: '',
  });

  const addStudent = () => {
    // Lógica para adicionar aluno
    console.log(newStudent);
    setNewStudent({ name: '', login: '', password: '', treino: '' }); // Limpa o formulário
  };

  return (
    <div>
      <h2>Adicionar Aluno</h2>
      <label htmlFor="name">Nome:</label>
      <input
        id="name"
        type="text"
        placeholder="Nome"
        value={newStudent.name}
        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
      />
      <label htmlFor="login">Login:</label>
      <input
        id="login"
        type="text"
        placeholder="Login"
        value={newStudent.login}
        onChange={(e) => setNewStudent({ ...newStudent, login: e.target.value })}
      />
      <label htmlFor="password">Senha:</label>
      <input
        id="password"
        type="password"
        placeholder="Senha"
        value={newStudent.password}
        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
      />
      <label htmlFor="treino">Treino:</label>
      <input
        id="treino"
        type="text"
        placeholder="Treino"
        value={newStudent.treino}
        onChange={(e) => setNewStudent({ ...newStudent, treino: e.target.value })}
      />
      <button type="button" onClick={addStudent}>Adicionar Aluno</button>
    </div>
  );
};

export default AlunoForm;

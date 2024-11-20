import React, { useEffect, useState } from 'react';
import AlunoList from '../../components/AlunoList';
import AlunoForm from '../../components/AlunoForm';
import Optionsbar from '../../components/OptionsBar';
import styles from '../../styles/Professor.module.css';

// Definindo o tipo dos alunos
interface Aluno {
  id: string;
  name: string;
  login: string;
}

const Alunos: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]); // Estado para armazenar os alunos
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento

  // Função para buscar os alunos da API
  useEffect(() => {
    async function fetchAlunos() {
      try {
        setLoading(true); // Iniciando carregamento
        const response = await fetch('/api/alunos'); // URL da API (ajuste conforme necessário)
        const data = await response.json();
        setAlunos(data); // Atualizando o estado com os alunos da API
        setLoading(false); // Finalizando carregamento
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setLoading(false); // Finalizando carregamento em caso de erro
      }
    }

    fetchAlunos(); // Chamando a função ao montar o componente
  }, []);

  // Função que será chamada ao clicar em um aluno
  const handleAlunoClick = (aluno: Aluno) => {
    console.log('Aluno clicado:', aluno);
    // Aqui você pode adicionar a lógica que deseja executar ao clicar no aluno
  };

  return (
    <div className={styles.container}>
      <Optionsbar />
      <div className={styles.content}>
        <h1>Gerenciar Alunos</h1>
        <AlunoForm />
        {/* Exibir "Carregando..." até que os dados sejam carregados */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <AlunoList alunos={alunos} onAlunoClick={handleAlunoClick} />
        )}
      </div>
    </div>
  );
};

export default Alunos;

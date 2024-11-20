import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Admin.module.css';
import ImageUploader from '../components/ImageUploader';
import { FaBell } from 'react-icons/fa';
import Image from 'next/image';
// Definição dos tipos usados no componente
interface Aluno {
  id: number;
  name: string;
  login: string;
  birth_date?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
}

interface Professor {
  id: string;
  name: string;
  login: string;
  roles: string[];
}

interface Exercise {
  name: string;
  carga: number;
  repeticoes: number;
}

interface Treino {
  id?: number; // Torna o id opcional
  tipo: string;
  descricao: string; // Adiciona a descrição que contém o tipo do treino
  exercicios: Exercise[];
}

interface Position {
  x: number;
  y: number;
}

interface Card {
  id?: number; // Identificador único do card
  title: string;
  description: string;
  image_path: string;
  category: string;
  zoom_pc?: number;
  zoom_mobile?: number;
  position_pc?: { x: number; y: number };
  position_mobile?: { x: number; y: number };
}

// Função para buscar alunos da API
const fetchAlunos = async (): Promise<Aluno[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/alunos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar alunos');
  }

  const data = await response.json();

  // Assegurar que o ID seja um número
  return data.map((aluno: any) => ({
    ...aluno,
    id: Number(aluno.id),
  }));
};

// Função para buscar professores da API
const fetchProfessores = async (): Promise<Professor[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/professores', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar professores');
  }

  return response.json();
};

// Função para buscar treinos de um aluno da API
const fetchTreinos = async (aluno_id: number): Promise<Treino[]> => {
  console.log('Buscando treinos para aluno:', aluno_id); // Adiciona um log para verificar o aluno_id
  const response = await fetch(`/api/treinos?aluno_id=${aluno_id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    console.error('Erro ao buscar treinos:', response.statusText);
    throw new Error('Erro ao buscar treinos');
  }

  const data: Treino[] = await response.json();
  console.log('Treinos recebidos:', data); // Log para verificar os dados recebidos
  return data;
};

const Administrador: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const createLoginSuggestions = async (name: string) => {
    if (!name) return;
    const [firstName, lastName] = name.split(' ');
    const formats = [
      // PrimeiroNome_Sobrenome@corpusfit (com underline se houver sobrenome)
      `${firstName}${lastName ? `_${lastName}` : ''}@corpusfit`,
      // InicialDoPrimeiroNomeSobrenome@corpusfit (primeira letra do nome e sobrenome completo)
      `${firstName[0]}${lastName ? lastName : ''}@corpusfit`,
      // PrimeiroNome.Sobrenome@corpusfit (com ponto se houver sobrenome)
      `${firstName}${lastName ? `.${lastName}` : ''}@corpusfit`,
    ];

    const availableSuggestions = [];
    for (let login of formats) {
      const response = await fetch(`/api/alunos?checkLogin=${login}&t=${Date.now()}`);
      const { available } = await response.json();
      if (available) availableSuggestions.push(login);
    }

    console.log('Available suggestions:', availableSuggestions); // Verifique o conteúdo de availableSuggestions
    setSuggestions(availableSuggestions);
  };

  const [aniversariantes, setAniversariantes] = useState<Aluno[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAlunoDetails, setSelectedAlunoDetails] = useState<Aluno | null>(null);

  const fetchAniversariantes = async () => {
    try {
      const response = await fetch('/api/notificacoes/aniversariantes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar aniversariantes');
      }
      const data = await response.json();
      setAniversariantes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAniversariantes();
  }, []);

  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  const handleViewAlunoDetails = (aluno: Aluno) => {
    setSelectedAlunoDetails(aluno);
  };

  const verificarDadosCompletos = (aluno: Aluno) => {
    const camposPessoais = ['cpf', 'birth_date', 'email', 'telefone'];
    return camposPessoais.every((campo) => aluno[campo as keyof Aluno]);
  };

  const [alunoParaAlterar, setAlunoParaAlterar] = useState<Aluno | null>(null);
  const [showAlterarDados, setShowAlterarDados] = useState(false);
  const [alunoDadosAlterados, setAlunoDadosAlterados] = useState<Partial<Aluno>>({
    cpf: '',
    birth_date: '',
    email: '',
    telefone: '',
  });

  useEffect(() => {
    if (alunoParaAlterar) {
      setAlunoDadosAlterados({
        cpf: alunoParaAlterar.cpf || '',
        birth_date: alunoParaAlterar.birth_date || '',
        email: alunoParaAlterar.email || '',
        telefone: alunoParaAlterar.telefone || '',
      });
    } else {
      // Se nenhum aluno for selecionado, resetar os dados
      setAlunoDadosAlterados({
        cpf: '',
        birth_date: '',
        email: '',
        telefone: '',
      });
    }
  }, [alunoParaAlterar]);

  const handleAlterarDadosAluno = (aluno: Aluno) => {
    setAlunoParaAlterar(aluno);
    setShowAlterarDados(true);
  };

  const handleAlterarDadosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoParaAlterar) return;
  
    try {
      const response = await fetch(`/api/alunos/${alunoParaAlterar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(alunoDadosAlterados),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar dados do aluno');
      }
  
      // Atualizar a lista de alunos com os novos dados
      setAlunos(
        alunos.map((aluno) =>
          aluno.id === alunoParaAlterar.id ? { ...aluno, ...alunoDadosAlterados } : aluno
        )
      );
  
      setShowAlterarDados(false);
      setAlunoDadosAlterados({});
    } catch (error) {
      console.error(error);
    }
  };

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isCheckedMap, setIsCheckedMap] = useState<{ [key: string]: boolean }>({}); // Controla o estado de cada botão ON/OFF por professor
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [treinoError, setTreinoError] = useState<string | null>(null);
  const [showAddAluno, setShowAddAluno] = useState(false);
  const [newAlunoName, setNewAlunoName] = useState('');
  const [newAlunoLogin, setNewAlunoLogin] = useState('');
  const [newAlunoPassword, setNewAlunoPassword] = useState('');
  const [isExpandedAlunos, setIsExpandedAlunos] = useState(false); // Controla a expansão da lista de alunos
  const [isExpandedProfessores, setIsExpandedProfessores] = useState(false); // Controla a expansão da lista de professores
  const [currentPageAlunos, setCurrentPageAlunos] = useState(1);
  const [currentPageProfessores, setCurrentPageProfessores] = useState(1);
  const alunosPorPagina = 5; // Quantos alunos serão exibidos por página
  const professoresPorPagina = 5; // Quantos professores serão exibidos por página
  const [showAddUser, setShowAddUser] = useState(false); // Controla a exibição do formulário
  const [newUserType, setNewUserType] = useState('aluno'); // Controla se o usuário será aluno ou professor
  const [newUserName, setNewUserName] = useState('');
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [searchTermAlunos, setSearchTermAlunos] = useState(''); // Termo de busca para alunos
  const [newAlunoBirthDate, setNewAlunoBirthDate] = useState('');
  const [newAlunoCPF, setNewAlunoCPF] = useState('');
  const [newAlunoEmail, setNewAlunoEmail] = useState('');
  const [newAlunoTelefone, setNewAlunoTelefone] = useState('');
  const [searchTermProfessores, setSearchTermProfessores] = useState(''); // Termo de busca para professores

  // Lógica para filtrar os alunos de acordo com a busca
  const filteredAlunos = alunos.filter((aluno) =>
    aluno.name.toLowerCase().includes(searchTermAlunos.toLowerCase())
  );


  // Lógica para filtrar os professores de acordo com a busca
  const filteredProfessores = professores.filter((professor) =>
    professor.name.toLowerCase().includes(searchTermProfessores.toLowerCase())
  );

  // Paginação após o filtro
  const indexOfLastAluno = currentPageAlunos * alunosPorPagina;
  const indexOfFirstAluno = indexOfLastAluno - alunosPorPagina;
  const currentAlunos = filteredAlunos.slice(indexOfFirstAluno, indexOfLastAluno);

  const indexOfLastProfessor = currentPageProfessores * professoresPorPagina;
  const indexOfFirstProfessor = indexOfLastProfessor - professoresPorPagina;
  const currentProfessores = filteredProfessores.slice(indexOfFirstProfessor, indexOfLastProfessor);

  const paginateAlunos = (pageNumber: number) => {
    setCurrentPageAlunos(pageNumber);
  };

  const paginateProfessores = (pageNumber: number) => {
    setCurrentPageProfessores(pageNumber);
  };

  const [showCreateTreino, setShowCreateTreino] = useState(false);
  const [newTreino, setNewTreino] = useState<Treino>({
    tipo: '',
    descricao: '',
    exercicios: [],
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState<Card>({
    title: '',
    description: '',
    image_path: '',
    category: 'PLANOS',
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Padrões da academia para exercícios, cargas e repetições
  const exerciciosPadroes = {
    peito: ['Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo com Halteres'],
    triceps: ['Tríceps Pulley', 'Tríceps Testa', 'Mergulho entre Bancos'],
    costas: ['Puxada Frontal', 'Puxada Atrás da Nuca', 'Remada Curvada'],
    biceps: ['Rosca Direta', 'Rosca Alternada', 'Rosca Martelo'],
    pernas: {
      quadriceps: ['Agachamento Livre', 'Leg Press 45°', 'Hack Machine'],
      posterior: ['Cadeira Flexora', 'Mesa Flexora', 'Stiff'],
      gluteos: ['Elevação Pélvica', 'Extensão de Quadril', 'Glúteo no Cabo'],
    },
    ombros: ['Desenvolvimento Militar', 'Desenvolvimento Arnold', 'Elevação Lateral'],
    abdominais: ['Abdominal Crunch', 'Abdominal Infra', 'Prancha Abdominal'],
  };

  const cargasPadroes = [10, 20, 30, 40, 50, 60];
  const repeticoesPadroes = [6, 8, 10, 12, 15];

  const router = useRouter();

  // Função para buscar os cards
  const fetchCards = async (): Promise<void> => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Erro ao buscar cards');
      }
      const data = await response.json();
      setCards(data.cards);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const [zoomPC, setZoomPC] = useState<number>(1);
  const [zoomMobile, setZoomMobile] = useState<number>(1);
  const [positionPC, setPositionPC] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [positionMobile, setPositionMobile] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Função para lidar com o upload de imagem e salvar o caminho da imagem
  const handleImageUpload = (imagePath: string) => {
    setNewCard({
      ...newCard,
      image_path: imagePath,
      zoom_pc: zoomPC,
      zoom_mobile: zoomMobile,
      position_pc: positionPC,
      position_mobile: positionMobile,
    });
  };

  // Função para criar ou atualizar um card
  const handleCreateOrUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newCard.title || !newCard.description || !newCard.image_path || !newCard.category) {
      alert('Preencha todos os campos e faça o upload de uma imagem.');
      return;
    }
  
    const method = isEditing ? 'PUT' : 'POST';
    const response = await fetch('/api/cards', {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newCard,
        zoom_pc: newCard.zoom_pc,
        zoom_mobile: newCard.zoom_mobile,
        position_pc: newCard.position_pc,
        position_mobile: newCard.position_mobile
      }),
    });
  
    if (!response.ok) {
      console.error('Erro ao salvar card.');
    } else {
      setNewCard({ title: '', description: '', image_path: '', category: 'PLANOS', zoom_pc: 1, zoom_mobile: 1, position_pc: { x: 0, y: 0 }, position_mobile: { x: 0, y: 0 } });
      fetchCards();
      setIsEditing(false);
    }
  };

  // Função para carregar as informações de um card para edição
  const handleEditCard = (card: Card) => {
    setNewCard(card);
    setIsEditing(true);
  };

  // Função para deletar um card
  const handleDeleteCard = async (cardId: number | undefined) => {
    const confirmDelete = confirm('Tem certeza de que deseja deletar este card?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/cards?id=${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar card.');
      }

      // Atualiza a lista de cards após a deleção
      setCards(cards.filter((card) => card.id !== cardId));
    } catch (error) {
      console.error('Erro ao deletar o card:', error);
    }
  };

  // Fetch para obter a lista de alunos
  useEffect(() => {
    const loadAlunos = async () => {
      try {
        const alunosData = await fetchAlunos();
        setAlunos(alunosData);
      } catch (error) {
        console.error(error);
        setAlunos([]);
      }
    };

    loadAlunos();
  }, []);

  // Fetch para obter a lista de professores
  useEffect(() => {
    const loadProfessores = async () => {
      try {
        const professoresData = await fetchProfessores();
        setProfessores(professoresData);
      } catch (error) {
        console.error(error);
        setProfessores([]);
      }
    };

    loadProfessores();
  }, []);

  // Fetch para buscar os treinos de um aluno
  const handleViewTreinos = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setTreinos([]);
    setTreinoError(null);

    try {
      const treinosData = await fetchTreinos(aluno.id);
      if (treinosData.length === 0) {
        setTreinoError('Nenhum treino encontrado para este aluno.');
      } else {
        setTreinos(treinosData);
      }
    } catch (error) {
      console.error(error);
      setTreinoError('Erro ao buscar treinos, tente novamente.');
    }
  };

  const handleOpenCreateTreino = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowCreateTreino(true);
  };

  const handleCreateTreino = async () => {
    if (!selectedAluno || !newTreino.tipo || newTreino.exercicios.length === 0) {
      setTreinoError('Preencha todos os campos antes de salvar o treino.');
      return;
    }

    try {
      const response = await fetch('/api/treinos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')} `,
        },
        body: JSON.stringify({
          aluno_id: selectedAluno.id,
          descricao: `Treino ${newTreino.tipo}`, // Descrição do treino
          exercicios: newTreino.exercicios, // Lista de exercícios
          data: new Date().toISOString(), // Data atual
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar treino');
      }

      setShowCreateTreino(false);
      setNewTreino({
        id: 0,
        tipo: '',
        descricao: '',
        exercicios: [],
      });
      await handleViewTreinos(selectedAluno);
    } catch (error) {
      console.error(error);
      setTreinoError('Erro ao criar treino, tente novamente.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = newUserType === 'aluno' ? '/api/alunos' : '/api/professores'; 
  
    // Crie o objeto body com base no tipo de usuário
    const body = newUserType === 'aluno'
      ? {
          name: newUserName,
          login: newUserLogin,
          password: newUserPassword,
          cpf: newAlunoCPF || undefined,
          birth_date: newAlunoBirthDate || undefined,
          email: newAlunoEmail || undefined,
          telefone: newAlunoTelefone || undefined,
        }
      : {
          name: newUserName,
          login: newUserLogin,
          password: newUserPassword,
          // Adicione os campos necessários para o professor aqui, se houver
        };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body), // Use o objeto body que foi criado
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar usuário');
      }
  
      const userAdded = await response.json();
      console.log(`${newUserType} adicionado:`, userAdded);
      
      // Atualize o estado com base no tipo de usuário
      if (newUserType === 'aluno') {
        setAlunos([...alunos, { ...userAdded, id: Number(userAdded.id) }]);
      } else {
        setProfessores([...professores, { ...userAdded, id: Number(userAdded.id) }]);
      }
  
      // Fechar o formulário e limpar campos
      setShowAddUser(false);
      setNewUserName('');
      setNewUserLogin('');
      setNewUserPassword('');
      // Limpe também os campos de aluno se estiver adicionando um aluno
      if (newUserType === 'aluno') {
        setNewAlunoCPF('');
        setNewAlunoBirthDate('');
        setNewAlunoEmail('');
        setNewAlunoTelefone('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProfessor = async (professorId: number) => {
    const confirmDelete = confirm('Tem certeza de que deseja deletar este professor?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/professores?id=${professorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar professor.');
      }

      // Atualizar a lista de professores após a deleção
      setProfessores(professores.filter((professor) => Number(professor.id) !== professorId));
    } catch (error) {
      console.error('Erro ao deletar o professor:', error);
    }
  };

  // Função para verificar se o professor tem a permissão ao carregar a página
  const checkProfessorRole = async (professorId: number) => {
    try {
      const response = await fetch(`/api/permissions?id=${professorId}`);
  
      if (response.status === 404) {
        // No permissions found
        return false;
      }
  
      if (!response.ok) {
        console.error('Error fetching permissions:', response.statusText);
        return false;
      }
  
      const permissoesData = await response.json();
  
      console.log('permissoesData:', permissoesData);
      console.log('Type of permissoesData:', typeof permissoesData);
      console.log('Is permissoesData an array?', Array.isArray(permissoesData));
  
      if (Array.isArray(permissoesData)) {
        // Check if any permission has the desired role
        return permissoesData.some(
          (permission: any) => permission.role === 'can_manage_posts'
        );
      } else if (permissoesData && permissoesData.error) {
        // Handle the error object
        console.error('API Error:', permissoesData.error);
        return false;
      } else {
        console.error('Unexpected permissoesData format:', permissoesData);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar permissão do professor:', error);
      return false;
    }
  };
  

  // Atualizar o estado inicial dos toggles ao carregar a página
  useEffect(() => {
    const loadPermissions = async () => {
      const checkedMap: { [key: string]: boolean } = {};
      for (const professor of professores) {
        const hasPermission = await checkProfessorRole(Number(professor.id));
        checkedMap[professor.id] = hasPermission;
      }
      setIsCheckedMap(checkedMap);
    };
  
    if (professores.length > 0) {
      loadPermissions();
    }
  }, [professores]); // Executa sempre que a lista de professores mudar

  // Função para alternar o estado do botão de um professor (adicionar/remover permissão)
  const handleToggle = async (professorId: string) => {
    const hasPermission = isCheckedMap[professorId] || false;
  
    if (hasPermission) {
      // Remove permission
      const confirmRemoveRole = confirm('Deseja remover a permissão de gerenciar posts deste professor?');
      if (!confirmRemoveRole) return;
  
      try {
        const response = await fetch(`/api/permissions?id=${professorId}`, {
          method: 'DELETE', // Use DELETE to remove the permission
        });
  
        if (!response.ok) {
          throw new Error('Erro ao remover role');
        }
  
        alert('Permissão removida com sucesso!');
      } catch (error) {
        console.error('Erro ao remover role do professor:', error);
      }
    } else {
      // Add permission
      const confirmAddRole = confirm('Deseja permitir que este professor gerencie posts?');
    if (!confirmAddRole) return;
  
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(professorId), // Make sure to send 'userId' and not 'id'
          role: 'can_manage_posts',
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding role:', response.status, response.statusText, errorText);
        throw new Error('Erro ao adicionar role');
      }
  
        alert('Permissão concedida com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar role ao professor:', error);
      }
    }
  
    // Update the state of the checkbox after adding/removing permission
    setIsCheckedMap((prevState) => ({
      ...prevState,
      [professorId]: !hasPermission, // Invert the current state
    }));
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header com o botão de Logout */}
      <header className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Painel de Administração</h2>
        <div className={styles.headerIcons}>
          <div className={styles.notificationIcon} onClick={toggleNotificationDropdown}>
            <FaBell className={styles.bellIcon} />
            {aniversariantes.length > 0 && (
              <span className={styles.notificationBadge}>{aniversariantes.length}</span>
            )}
          </div>
        </div>
        <button onClick={() => router.push('/login')} className={styles.logoutButton}>
          Logout
        </button>
      </header>
  
      {showNotifications && (
        <div className={styles.notificationDropdown}>
          <h3>Aniversariantes do Mês</h3>
          <ul>
            {aniversariantes.map((aluno) => (
              <li key={aluno.id} onClick={() => handleViewAlunoDetails(aluno)}>
                {aluno.name}
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {/* Botões de Ação */}
      <button className={styles.addButton} onClick={() => setShowAddUser(true)}>
        Adicionar Usuário
      </button>
  
      {/* Formulário para adicionar usuário (aluno ou professor) */}
      {showAddUser && (
        <form className={styles.searchContainer} onSubmit={handleAddUser}>
          <label>Tipo de Usuário</label>
          <select
            value={newUserType}
            onChange={(e) => setNewUserType(e.target.value)}
            className={styles.inputField}
          >
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>
  
          {/* Campos Comuns */}
          <input
            type="text"
            placeholder="Nome *Obrigatorio"
            value={newUserName}
            onChange={(e) => {
              setNewUserName(e.target.value);
              createLoginSuggestions(e.target.value); // Gera sugestões ao digitar o nome
            }}
            className={styles.inputField}
            required
            autoComplete="off"
          />
  
          <input
            type="text"
            placeholder="Login *Obrigatorio"
            value={newUserLogin}
            onChange={(e) => setNewUserLogin(e.target.value)}
            className={styles.inputField}
            required
            autoComplete="off"
          />
  
          {/* Exibir sugestões de login */}
          <div className={`${styles.suggestionsContainer} ${suggestions.length > 0 ? 'active' : ''}`}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={() => {
                  setNewUserLogin(suggestion); // Preenche o campo de login
                  setSuggestions([]); // Limpa as sugestões
                }}
                onTouchStart={() => {
                  setNewUserLogin(suggestion); // Preenche o campo de login
                  setSuggestions([]); // Limpa as sugestões
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
  
          <input
            type="password"
            placeholder="Senha *Obrigatorio"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            className={styles.inputField}
            required
          />
  
          {/* Campos Específicos para Aluno */}
          {newUserType === 'aluno' && (
            <>
              <input
                type="text"
                placeholder="CPF"
                value={newAlunoCPF}
                onChange={(e) => setNewAlunoCPF(e.target.value)}
                className={styles.inputField}
              />
              <input
                type="date"
                placeholder="Data de Nascimento"
                value={newAlunoBirthDate}
                onChange={(e) => setNewAlunoBirthDate(e.target.value)}
                className={styles.inputField}
              />
              <input
                type="email"
                placeholder="Email"
                value={newAlunoEmail}
                onChange={(e) => setNewAlunoEmail(e.target.value)}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Telefone"
                value={newAlunoTelefone}
                onChange={(e) => setNewAlunoTelefone(e.target.value)}
                className={styles.inputField}
              />
            </>
          )}
  
          {/* Campos Específicos para Professor */}
          {newUserType === 'professor' && (
            <>
              {/* Aqui você pode adicionar campos específicos para o professor, se necessário */}
              {/* Exemplo: <input type="text" placeholder="Especialidade" value={newProfessorSpecialty} onChange={(e) => setNewProfessorSpecialty(e.target.value)} className={styles.inputField} /> */}
            </>
          )}
  
          <button type="submit" className={styles.submitButton}>
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setShowAddUser(false)}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Formulário de Alteração de Dados do Aluno */}
      {showAlterarDados && (
        <form className={styles.alterarDadosForm} onSubmit={handleAlterarDadosSubmit}>
          <h3>Alterar Dados do Aluno</h3>
          <select
            className={styles.inputField}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const aluno = alunos.find((a) => a.id === selectedId);
              setAlunoParaAlterar(aluno || null);
            }}
            value={alunoParaAlterar ? alunoParaAlterar.id : ''}
          >
             <option value="">Selecione um aluno</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.name}
              </option>
            ))}
          </select>

          {alunoParaAlterar && (
            <>
              <input
                type="text"
                placeholder="CPF"
                value={alunoDadosAlterados.cpf || ''}
                onChange={(e) =>
                  setAlunoDadosAlterados({ ...alunoDadosAlterados, cpf: e.target.value })
                }
                className={styles.inputField}
              />
              <input
                type="date"
                placeholder="Data de Nascimento"
                value={alunoDadosAlterados.birth_date || ''}
                onChange={(e) =>
                  setAlunoDadosAlterados({ ...alunoDadosAlterados, birth_date: e.target.value })
                }
                className={styles.inputField}
              />
              <input
                type="email"
                placeholder="Email"
                value={alunoDadosAlterados.email || ''}
                onChange={(e) =>
                  setAlunoDadosAlterados({ ...alunoDadosAlterados, email: e.target.value })
                }
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Telefone"
                value={alunoDadosAlterados.telefone || ''}
                onChange={(e) =>
                  setAlunoDadosAlterados({ ...alunoDadosAlterados, telefone: e.target.value })
                }
                className={styles.inputField}
              />
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setShowAlterarDados(false)}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </form>
      )}

       {/* Expandir/Colapsar Alunos */}
    <header className={styles.dashboardHeader}>
      <h2 className={styles.dashboardTitle} onClick={() => setIsExpandedAlunos(!isExpandedAlunos)}>
        ALUNOS
        <span className={styles.arrow}>
          {isExpandedAlunos ? '▲' : '▼'}
        </span>
      </h2>
    </header>

    {isExpandedAlunos && (
      <>
        {/* Campo de Busca */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar aluno pelo nome..."
            value={searchTermAlunos}
            onChange={(e) => setSearchTermAlunos(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Tabela de alunos */}
        <section className={styles.projectsInner}>
          <table className={styles.projectsTable}>
            <thead>
              <tr>
                <th>Nome do Aluno</th>
                <th>Login</th>
                <th>Dados</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentAlunos.length > 0 ? (
                currentAlunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.name}</td>
                    <td>{aluno.login}</td>
                    <td className={styles.status} onClick={() => handleAlterarDadosAluno(aluno)}>
                      {verificarDadosCompletos(aluno) ? '✅' : '❗'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => handleViewTreinos(aluno)}>Ver Treinos</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Nenhum aluno encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
              {/* Paginação */}
            <div className={styles.pagination}>
              <button
                onClick={() => paginateAlunos(currentPageAlunos - 1)}
                disabled={currentPageAlunos === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {currentPageAlunos} de{' '}
                {Math.ceil(filteredAlunos.length / alunosPorPagina)}
              </span>
              <button
                onClick={() => paginateAlunos(currentPageAlunos + 1)}
                disabled={
                  currentPageAlunos === Math.ceil(filteredAlunos.length / alunosPorPagina)
                }
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
        </section>
      </>
    )}
    
    {selectedAluno && (
      <div className={styles.treinosContainer}>
        <h3>Treinos de {selectedAluno.name}</h3>

        {/* Botão para criar novo treino */}
        <button className={styles.createTreinoButton} onClick={() => handleOpenCreateTreino(selectedAluno)}>
          Criar Treino
        </button>

        {/* Exibir mensagem de erro se houver */}
        {treinoError && <p>{treinoError}</p>}

        {/* Exibir os treinos */}
        {treinos.length > 0 ? (
          treinos.map((treino) => (
            <div key={treino.id} className={styles.treinoCard}>
              <h4>{treino.descricao}</h4>
              <ul>
                {treino.exercicios.map((exercicio, index) => (
                  <li key={index}>
                    <span className={styles.treinoNumero}>{index + 1}</span> -{exercicio.name} - {exercicio.carga} kg - {exercicio.repeticoes} repetições
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Crie o Treino Inicial para o Aluno.</p>
        )}
      </div>
    )}


      {/* Modal de criação de treino */}
      {showCreateTreino && selectedAluno && (
      <div className={styles.modal}>
        <h3>Criar Treino para {selectedAluno.name}</h3>
        <label htmlFor="tipoTreino">Tipo de Treino:</label>
        <select  id="tipoTreino"
          value={newTreino.tipo}
          onChange={(e) => setNewTreino({ ...newTreino, tipo: e.target.value })}
          className={styles.inputField}
        >
          <option value="">Selecione o Tipo de Treino</option>
          <option value="A">Treino A</option>
          <option value="B">Treino B</option>
          <option value="C">Treino C</option>
          <option value="D">Treino D</option>
        </select>
          
        {/* Área de conteúdo rolável */}
        <div className={styles.exerciseContainer}>
          {newTreino.exercicios.map((exercise, index) => (
            <div key={index} className={styles.exerciseItem}>
              <label>Exercício:</label>
              <select
                value={exercise.name}
                onChange={(e) =>
                  setNewTreino({
                    ...newTreino,
                    exercicios: newTreino.exercicios.map((ex, i) =>
                      i === index ? { ...ex, name: e.target.value } : ex
                    ),
                  })
                }
                className={styles.inputField}
              >
                <option value="">Selecione o Exercício</option>
                  {Object.keys(exerciciosPadroes).map((categoria) => {
                  const grupoExercicios = exerciciosPadroes[categoria as keyof typeof exerciciosPadroes];

                  if (Array.isArray(grupoExercicios)) {
                    return (
                      <optgroup key={categoria} label={`Exercícios para ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`}>
                        {grupoExercicios.map((exercicio: string, idx: number) => (
                          <option key={idx} value={exercicio}>
                            {exercicio}
                          </option>
                        ))}
                      </optgroup>
                    );
                  } else {
                    return Object.keys(grupoExercicios).map((subcategoria) => (
                      <optgroup key={subcategoria} label={`Exercícios para ${subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1)}`}>
                        {grupoExercicios[subcategoria as keyof typeof grupoExercicios].map((exercicio: string, idx: number) => (
                          <option key={idx} value={exercicio}>
                            {exercicio}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  }
                })}
              </select>

              <label>Carga (kg):</label>
              <select
                value={exercise.carga}
                onChange={(e) =>
                  setNewTreino({
                    ...newTreino,
                    exercicios: newTreino.exercicios.map((ex, i) =>
                      i === index ? { ...ex, carga: parseFloat(e.target.value) } : ex
                    ),
                  })
                }
                className={styles.inputField}
              >
                <option value="">Selecione a Carga</option>
                {cargasPadroes.map((carga, idx) => (
                <option key={idx} value={carga}>
                  {carga} kg
                </option>
              ))}
              </select>

              <label>Repetições:</label>
              <select
                value={exercise.repeticoes}
                onChange={(e) =>
                  setNewTreino({
                    ...newTreino,
                    exercicios: newTreino.exercicios.map((ex, i) =>
                      i === index ? { ...ex, repeticoes: parseFloat(e.target.value) } : ex
                    ),
                  })
                }
                className={styles.inputField}
              >
                <option value="">Selecione as Repetições</option>
                {repeticoesPadroes.map((reps, idx) => (
                <option key={idx} value={reps}>
                  {reps} repetições
                </option>
              ))}
              </select>
              </div>
            ))}
          </div>
          
            {/* Botões de ação fixos na parte inferior */}
          <div className={styles.modalActions}>
            <button
              onClick={() =>
                setNewTreino({
                  ...newTreino,
                  exercicios: [...newTreino.exercicios, { name: '', carga: 0, repeticoes: 0 }],
                })
              }
            >
              Adicionar Exercício
            </button>
            <button onClick={handleCreateTreino}>Salvar Treino</button>
            <button onClick={() => setShowCreateTreino(false)}>Cancelar</button>
          </div>
        </div>
      )}
            

      {/* Expandir/Colapsar Professores */}
      <header className={styles.dashboardHeader}>
        <h2
          className={styles.dashboardTitle}
          onClick={() => setIsExpandedProfessores(!isExpandedProfessores)}
        >
          PROFESSORES
          <span className={styles.arrow}>
            {isExpandedProfessores ? '▲' : '▼'} {/* Mostra a seta para abrir/fechar */}
          </span>
        </h2>
      </header>

      {isExpandedProfessores && (
        <>
          {/* Campo de Busca */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar professor pelo nome..."
              value={searchTermProfessores}
              onChange={(e) => setSearchTermProfessores(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Tabela de professores */}
          <section className={styles.projectsInner}>
            <table className={styles.projectsTable}>
              <thead>
                <tr>
                  <th>Nome do Professor</th>
                  <th>Login</th>
                  <th>Posts</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentProfessores.length > 0 ? (
                  currentProfessores.map((professor) => (
                    <tr key={professor.id}>
                      <td>{professor.name}</td>
                      <td>{professor.login}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          {/* Aqui está o botão ON/OFF */}
                          <div className={styles.toggle}>
                            <input
                              type="checkbox"
                              id={`toggle-${professor.id}`}
                              className={styles.toggleCheckbox} // Classe local para o checkbox
                              checked={isCheckedMap[professor.id] || false} // Controle do estado baseado no professor.id
                              onChange={() => handleToggle(professor.id)} // Chama a função para alternar o estado
                            />
                            <label
                              htmlFor={`toggle-${professor.id}`}
                              className={styles.toggleLabel}
                            >
                              <span className={styles.thumb}></span>
                            </label>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteProfessor(Number(professor.id))}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Nenhum professor encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginação */}
            <div className={styles.pagination}>
              <button
                onClick={() => paginateProfessores(currentPageProfessores - 1)}
                disabled={currentPageProfessores === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {currentPageProfessores} de{' '}
                {Math.ceil(filteredProfessores.length / professoresPorPagina)}
              </span>
              <button
                onClick={() => paginateProfessores(currentPageProfessores + 1)}
                disabled={
                  currentPageProfessores ===
                  Math.ceil(filteredProfessores.length / professoresPorPagina)
                }
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
          </section>
        </>
      )}

      {/* Formulário para criar/editar card */}
      <section className={styles.formContainer}>
            <div className={styles.card}>
              <ImageUploader onUploadComplete={fetchCards} />
            </div>
          </section>

      {/* Tabela de cards criados */}
      <section className={styles.projectsInner}>
        <header className={styles.projectsHeader}>
          <div className={styles.title}>Posts Criados</div>
          <div className={styles.count}>| {cards.length} Cards</div>
        </header>

        <table className={styles.projectsTable}>
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Título</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(cards) && cards.length > 0 ? (
              cards.map((card) => (
                <tr key={card.id}>
                  {/* Exibindo a imagem do card */}
                  <td>
                  <img
                    src={`/uploads/${card.image_path.split('/').pop()}`} // Extrai o nome do arquivo do caminho
                    alt={card.title}
                    className={styles.cardImage}
                  />
                  </td>
                  {/* Exibindo o título, descrição e categoria */}
                  <td>{card.title}</td>
                  <td>{card.description}</td>
                  <td>{card.category}</td>
                  <td>
                    {/* Ações de deletar */}
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Nenhum card encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {/* Modal de detalhes do aluno, aparece ao clicar em um aniversariante */}
      {selectedAlunoDetails && (
          <div className={styles.modalOverlay} onClick={() => setSelectedAlunoDetails(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2>{selectedAlunoDetails.name}</h2>
              <p><strong>CPF:</strong> {selectedAlunoDetails.cpf}</p>
              <p>Data de Nascimento: {selectedAlunoDetails.birth_date}</p>
              {/* Adicione a foto se disponível */}
              {/* {selectedAlunoDetails.photo && (
              <img src={selectedAlunoDetails.photo} alt={selectedAlunoDetails.name} className={styles.alunoPhoto} />
            )} */}
              <button onClick={() => setSelectedAlunoDetails(null)}>Fechar</button>
            </div>
          </div>
        )}

      {/* Adicionar Footer */}
      <div className={styles.footer}>
        <p>© 2024 Sua Empresa. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Administrador;
``

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Professor.module.css';
import ImageUploader from '../components/ImageUploader';
import { FaBell } from 'react-icons/fa';
import Image from 'next/image';
interface Professor {
  id: number;
  name: string;
  login: string;
  roles: string[]; 
}

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

interface Exercise {
  name: string;
  carga: number;
  repeticoes: number;
}

interface Treino {
  id: number; 
  tipo: string;
  descricao: string; // Adiciona a descrição que contém o tipo do treino
  exercicios: Exercise[];
}

interface Position {
  x: number;
  y: number;
}

interface Card {
  id?: number;
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


const ProfessorDashboard: React.FC = () => {

  // {Aniversariante do mes}
  const [aniversariantes, setAniversariantes] = useState<Aluno[]>([]);

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

  const [selectedAlunoDetails, setSelectedAlunoDetails] = useState<Aluno | null>(null);

  const handleViewAlunoDetails = (aluno: Aluno) => {
    setSelectedAlunoDetails(aluno);
  };
  
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
  };
  // {Expansão da lista de alunos}
  const [isExpandedAlunos, setIsExpandedAlunos] = useState(false); // Controla a expansão da lista de alunos  
  const [searchTermAlunos, setSearchTermAlunos] = useState(''); // Termo de busca para alunos
  const [newAlunoBirthDate, setNewAlunoBirthDate] = useState('');
  const [newAlunoCPF, setNewAlunoCPF] = useState('');
  const [newAlunoEmail, setNewAlunoEmail] = useState('');
  const [newAlunoTelefone, setNewAlunoTelefone] = useState('');

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
      `${firstName}${lastName ? `.${lastName}` : ''}@corpusfit`
    ];
  
    const availableSuggestions = [];
    for (let login of formats) {
      const response = await fetch(`/api/alunos?checkLogin=${login}&t=${Date.now()}`);
      const { available } = await response.json();
      if (available) availableSuggestions.push(login);
    }
  
    console.log("Available suggestions:", availableSuggestions); // Verifique o conteúdo de availableSuggestions
    setSuggestions(availableSuggestions);
  };
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [canManagePosts, setCanManagePosts] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState<Card>({
    title: '',
    description: '',
    image_path: '',
    category: 'PLANOS',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const loginProfessorLogado = localStorage.getItem('login'); // Obtenha o login do localStorage
  
        if (!loginProfessorLogado) {
          console.error('Login do professor não encontrado.');
          return;
        }
  
        // Faz a chamada para buscar todos os professores
        const response = await fetch('/api/professores');
        if (!response.ok) {
          throw new Error('Erro ao buscar professores');
        }
        const professoresData = await response.json();
  
        // Encontramos o professor logado na lista de professores
        const professorLogado = professoresData.find(
          (professor: Professor) => professor.login === loginProfessorLogado
        );
        console.log('Professor logado encontrado:', professorLogado);
  
        if (!professorLogado) {
          console.error('Professor logado não encontrado na lista.');
          return;
        }
  
        setProfessor(professorLogado);
  
        // Verifica se o professor possui o role 'can_manage_posts'
        const responsePermissoes = await fetch(`/api/permissions?id=${professorLogado.id}`);
        if (!responsePermissoes.ok) {
          if (responsePermissoes.status === 404) {
            // Professor does not have permissions
            setCanManagePosts(false);
          } else {
            throw new Error('Erro ao buscar permissões do professor');
          }
        } else {
          const permissoesData = await responsePermissoes.json();
          if (
            Array.isArray(permissoesData) &&
            permissoesData.some((permission: any) => permission.role === 'can_manage_posts')
          ) {
            setCanManagePosts(true);
          } else {
            setCanManagePosts(false);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar o professor logado:', error);
      }
    };
  
    fetchProfessor();
  }, []);
  
  

  // Função para buscar os cards criados
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
    if (canManagePosts) {
      fetchCards();
    }
  }, [canManagePosts]);

    const [zoomPC, setZoomPC] = useState<number>(1);
    const [zoomMobile, setZoomMobile] = useState<number>(1);
    const [positionPC, setPositionPC] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [positionMobile, setPositionMobile] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    // Função para lidar com o upload de imagem e salvar o caminho da imagem
    const handleImageUpload = (data: {
      imagePath: string;
      zoomPC: number;
      zoomMobile: number;
      positionPC: { x: number; y: number };
      positionMobile: { x: number; y: number };
    }) => {
      setNewCard({
        ...newCard,
        image_path: data.imagePath,
        zoom_pc: data.zoomPC,
        zoom_mobile: data.zoomMobile,
        position_pc: data.positionPC,
        position_mobile: data.positionMobile,
      });
    };

  // Função para criar ou atualizar um card/post
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
   // Função para lidar com a conclusão do upload
   const handleUploadComplete = (imagePath: string) => {
    // Após o upload ser concluído, atualiza a lista de cards
    fetchCards();
  };
  // Função para deletar um card/post
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

  const handleEditCard = (card: Card) => {
    setNewCard(card);
    setIsEditing(true);
  };


  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [treinoError, setTreinoError] = useState<string | null>(null);
  const [showCadastroOptions, setShowCadastroOptions] = useState(false);
  const [showAlterarDados, setShowAlterarDados] = useState(false);
  const [alunoParaAlterar, setAlunoParaAlterar] = useState<Aluno | null>(null);
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

  const [newAlunoName, setNewAlunoName] = useState('');
  const [newAlunoLogin, setNewAlunoLogin] = useState('');
  const [newAlunoPassword, setNewAlunoPassword] = useState('');
  const [showAddAluno, setShowAddAluno] = useState(false); // Adicionei este estado
  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo de busca
  const [showCreateTreino, setShowCreateTreino] = useState(false);
  const [newTreino, setNewTreino] = useState<Treino>({
    id: 0,                // Adiciona um id vazio
    tipo: '',              // Tipo do treino
    descricao: '',         // Descrição inicial vazia
    exercicios: [],        // Lista de exercícios
  });

  // Lógica para filtrar os alunos de acordo com a busca
  const filteredAlunos = alunos.filter((aluno) =>
    aluno.name.toLowerCase().includes(searchTermAlunos.toLowerCase())
  );
  // {Limite de alunos por pagina}
  
  const [currentPageAlunos, setCurrentPageAlunos] = useState(1);
  const alunosPorPagina = 5; // Quantos alunos serão exibidos por página
  const indexOfLastAluno = currentPageAlunos * alunosPorPagina;
  const indexOfFirstAluno = indexOfLastAluno - alunosPorPagina;
  const currentAlunos = filteredAlunos.slice(indexOfFirstAluno, indexOfLastAluno);

  const paginateAlunos = (pageNumber: number) => {
    setCurrentPageAlunos(pageNumber);
  };

  

  // Padrões da academia para exercícios, cargas e repetições
  const exerciciosPadroes = {
    peito: [
        'Supino Reto', 
        'Supino Inclinado', 
        'Supino Declinado', 
        'Crucifixo com Halteres', 
        'Crucifixo Inclinado', 
        'Voador na Máquina', 
        'Pull-over', 
        'Flexão de Braços', 
        'Crossover na Polia (Cross Over)', 
        'Peck Deck'
    ],
    triceps: [
        'Tríceps Pulley (Corda, Barra Reta ou V)', 
        'Tríceps Testa (Skull Crusher)', 
        'Mergulho entre Bancos (Bench Dips)', 
        'Tríceps Coice (Kickback) com Halteres', 
        'Extensão de Tríceps Unilateral', 
        'Tríceps Francês', 
        'Extensão de Tríceps Acima da Cabeça com Halteres', 
        'Fundo nas Paralelas (Dips)'
    ],
    costas: [
        'Puxada Frontal na Polia', 
        'Puxada Atrás da Nuca', 
        'Remada Curvada com Barra', 
        'Remada Unilateral com Halteres', 
        'Remada Baixa Sentado', 
        'Remada Cavalinho (T-Bar Row)', 
        'Levantamento Terra', 
        'Barra Fixa (Pegada Pronada e Supinada)', 
        'Pull-over na Polia', 
        'Remada Alta', 
        'Encolhimento de Ombros (para trapézio)'
    ],
    biceps: [
        'Rosca Direta com Barra Reta', 
        'Rosca Alternada com Halteres', 
        'Rosca Martelo', 
        'Rosca Concentrada', 
        'Rosca Scott na Máquina ou Banco', 
        'Rosca Inversa com Barra', 
        'Rosca 21', 
        'Rosca no Cabo', 
        'Rosca Spider (Aranha)', 
        'Rosca em Polia Alta'
    ],
    pernas: {
        quadriceps: [
            'Agachamento Livre', 
            'Leg Press 45°', 
            'Hack Machine', 
            'Cadeira Extensora', 
            'Agachamento no Smith', 
            'Passada com Halteres', 
            'Afundo (Lunges)', 
            'Agachamento Búlgaro', 
            'Agachamento Sumô'
        ],
        posterior: [
            'Cadeira Flexora', 
            'Mesa Flexora', 
            'Stiff com Barra ou Halteres', 
            'Levantamento Terra Romeno', 
            'Good Morning', 
            'Flexão Nórdica'
        ],
        gluteos: [
            'Elevação Pélvica (Hip Thrust)', 
            'Extensão de Quadril na Máquina', 
            'Glúteo em 4 Apoios', 
            'Abdução de Quadril na Máquina', 
            'Glúteo no Cabo'
        ],
        panturrilhas: [
            'Elevação de Panturrilha em Pé', 
            'Elevação de Panturrilha Sentado', 
            'Elevação de Panturrilha na Leg Press', 
            'Donkey Calf Raise (Panturrilha Burro)', 
            'Elevação de Panturrilha no Smith Machine'
        ]
    },
    ombros: [
        'Desenvolvimento Militar com Barra', 
        'Desenvolvimento com Halteres', 
        'Desenvolvimento Arnold', 
        'Elevação Lateral com Halteres', 
        'Elevação Frontal com Halteres ou Barra', 
        'Elevação Posterior Inclinada (Reverse Fly)', 
        'Remada Alta com Barra ou Halteres', 
        'Encolhimento de Ombros com Barra ou Halteres (para trapézio)', 
        'Elevação Lateral na Polia', 
        'Face Pull na Polia'
    ],
    abdominais: [
        'Abdominal Crunch', 
        'Abdominal Infra na Paralela', 
        'Abdominal Oblíquo no Solo', 
        'Prancha Abdominal', 
        'Prancha Lateral', 
        'Abdominal na Máquina', 
        'Abdominal na Bola Suíça (Bola de Estabilidade)', 
        'Elevação de Pernas Suspenso', 
        'Abdominal Bicicleta', 
        'Abdominal Remador', 
        'Abdominal Canivete (V-Up)', 
        'Russian Twist', 
        'Mountain Climbers', 
        'Rollout com Roda Abdominal', 
        'Crunch Reverso', 
        'Abdominal Supra na Polia', 
        'Sit-Up'
    ]
};

  const cargasPadroes = [10, 20, 30, 40, 50, 60];
  const repeticoesPadroes = [6, 8, 10, 12, 15];

  const router = useRouter();

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

  // Fetch para buscar os treinos de um aluno
  const handleViewTreinos = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setTreinos([]);
    setTreinoError(null);

    try {
      const treinosData = await fetchTreinos(aluno.id);  // Usar aluno.id em vez de login
      console.log('Treinos recebidos:', treinosData); // Log dos treinos recebidos
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

  // Criar treino
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          aluno_id: selectedAluno.id,
          descricao: `Treino ${newTreino.tipo}`,  // Descrição do treino
          exercicios: newTreino.exercicios,       // Lista de exercícios
          data: new Date().toISOString(),         // Data atual
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

  // Função para deslogar
  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   router.push('/login');
  // };
 
  // Adicionar aluno
  const handleAddAluno = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    try {
      // Criar um objeto FormData
      const formData = new FormData();
      formData.append('name', newAlunoName);
      formData.append('login', newAlunoLogin);
      formData.append('password', newAlunoPassword);
      if (newAlunoCPF) formData.append('cpf', newAlunoCPF);
      if (newAlunoBirthDate) formData.append('birth_date', newAlunoBirthDate);
      if (newAlunoEmail) formData.append('email', newAlunoEmail);
      if (newAlunoTelefone) formData.append('telefone', newAlunoTelefone);
  
      // Obter o arquivo da foto
      const photoInput = e.currentTarget.querySelector('input[name="photo"]') as HTMLInputElement;
      if (photoInput && photoInput.files && photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
      }
  
      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: {
          // Remover 'Content-Type' para permitir que o navegador defina corretamente
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar aluno');
      }
  
      const alunoAdicionado = await response.json();
      setAlunos([...alunos, { ...alunoAdicionado, id: Number(alunoAdicionado.id) }]);
      setShowAddAluno(false);
      setNewAlunoName('');
      setNewAlunoLogin('');
      setNewAlunoPassword('');
      setNewAlunoCPF('');
      setNewAlunoBirthDate('');
      setNewAlunoEmail('');
      setNewAlunoTelefone('');
      alert('Aluno cadastrado com sucesso!');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao adicionar aluno');
    }
  };

  const handleAlterarDadosAluno = (aluno: Aluno) => {
    setAlunoParaAlterar(aluno);
    setShowAlterarDados(true);
  };

  const verificarDadosCompletos = (aluno: Aluno) => {
    const camposPessoais = ['cpf', 'birth_date', 'email', 'telefone'] as const;
    return camposPessoais.every((campo) => {
      const valor = aluno[campo];
      return typeof valor === 'string' && valor.trim() !== '';
    });
  };
  
  

  const handleAlterarDadosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoParaAlterar) return;
  
    // Remove empty strings from alunoDadosAlterados
    const updatedData = Object.fromEntries(
      Object.entries(alunoDadosAlterados).filter(
        ([_, value]) => value !== ''
      )
    );
  
    try {
      const response = await fetch(`/api/alunos/${alunoParaAlterar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar dados do aluno');
      }
  
      // Fetch updated student data from the server
      const updatedAlunoResponse = await fetch(`/api/alunos/${alunoParaAlterar.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedAluno = await updatedAlunoResponse.json();
  
      // Update the alunos state with the updated data
      setAlunos(
        alunos.map((aluno) =>
          aluno.id === alunoParaAlterar.id ? { ...aluno, ...updatedAluno } : aluno
        )
      );
  
      setShowAlterarDados(false);
      setAlunoDadosAlterados({});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header com o botão de Logout */}
      <header className={styles.dashboardHeader}>
      <h2 className={styles.dashboardTitle}>Painel do Professor</h2>
      
      <div className={styles.headerIcons}>
        <div className={styles.notificationIcon} onClick={toggleNotificationDropdown}>
          <FaBell className={styles.bellIcon} />
          {aniversariantes.length > 0 && (
            <span className={styles.notificationBadge}>{aniversariantes.length}</span>
          )}
        </div>
      </div>
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

<button className={styles.addButton} onClick={() => setShowCadastroOptions(true)}>
        Cadastro
      </button>
      {showCadastroOptions && (
        <div className={styles.cadastroOptions}>
          <button onClick={() => { setShowAddAluno(true); setShowCadastroOptions(false); }}>
            Criar Aluno
          </button>
          <button onClick={() => { setShowAlterarDados(true); setShowCadastroOptions(false); }}>
            Alterar Dados Aluno
          </button>
          <button onClick={() => setShowCadastroOptions(false)} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      )}

      {showAddAluno && (
        <form className={styles.addAlunoForm} onSubmit={handleAddAluno}>
          <h3>Criar Aluno</h3>
          <input
            type="text"
            placeholder="Nome"
            value={newAlunoName}
            onChange={(e) => {
              setNewAlunoName(e.target.value);
              createLoginSuggestions(e.target.value); // Gera sugestões ao digitar o nome
            }}
            className={styles.inputField}
            required
            autoComplete="off"
          />
          
          <input
            type="text"
            placeholder="Login"
            value={newAlunoLogin}
            onChange={(e) => setNewAlunoLogin(e.target.value)}
            className={styles.inputField}
            required
            autoComplete="off"
          />
          
          {/* Exibir sugestões de login */}
          <div className={`${styles.suggestionsContainer}
           ${suggestions.length > 0 ? 'active' : ''}`}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={() => {
                  setNewAlunoLogin(suggestion); // Preenche o campo de login
                  setSuggestions([]); // Limpa as sugestões
                }}
                onTouchStart={() => {
                  setNewAlunoLogin(suggestion); // Preenche o campo de login
                  setSuggestions([]); // Limpa as sugestões
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        
          <input
            type="password"
            placeholder="Senha"
            value={newAlunoPassword}
            onChange={(e) => setNewAlunoPassword(e.target.value)}
            className={styles.inputField}
            required
          />

          {/* campo CPF */}
          <input
            type="text"
            placeholder="CPF"
            value={newAlunoCPF}
            onChange={(e) => setNewAlunoCPF(e.target.value)}
            className={styles.inputField}
          />

          {/* campo Data de Nascimento */}
          <input
            type="date"
            placeholder="Data de Nascimento"
            value={newAlunoBirthDate}
            onChange={(e) => setNewAlunoBirthDate(e.target.value)}
            className={styles.inputField}
          />

          {/* campo Email */}
          <input
            type="email"
            placeholder="Email"
            value={newAlunoEmail}
            onChange={(e) => setNewAlunoEmail(e.target.value)}
            className={styles.inputField}
          />

          {/* campo Telefone */}
          <input
            type="text"
            placeholder="Telefone"
            value={newAlunoTelefone}
            onChange={(e) => setNewAlunoTelefone(e.target.value)}
            className={styles.inputField}
          />

           {/* Campo de Upload de Foto */}
           <input
            type="file"
            accept="image/*"
            name="photo"
            className={styles.inputField}
          />
          
          <button type="submit" className={styles.submitButton}>
            Salvar
          </button>
          
          <button type="button" onClick={() => setShowAddAluno(false)} className={styles.cancelButton}>
            Cancelar
          </button>
        </form>
      )}{showAlterarDados && (
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
            {isExpandedAlunos ? '▲' : '▼'} {/* Mostra a seta para abrir/fechar */}
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
                Página {currentPageAlunos} de {Math.ceil(alunos.length / alunosPorPagina)}
              </span>
              <button
                onClick={() => paginateAlunos(currentPageAlunos + 1)}
                disabled={currentPageAlunos === Math.ceil(alunos.length / alunosPorPagina)}
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
                      {exercicio.name} - {exercicio.carga} kg - {exercicio.repeticoes} repetições
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
            <label>Tipo de Treino:</label>
            <select
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
  
            {newTreino.exercicios.map((exercise, index) => (
              <div key={index}>
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
        )}
  
        {/* Exibir gerenciamento de posts se o professor tiver permissão */}
        {canManagePosts && (
          <>
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
                        <td>
                        <img
                          src={`/uploads/${card.image_path.split('/').pop()}`} // Extrai o nome do arquivo do caminho
                          alt={card.title}
                          className={styles.cardImage}
                        />
                      </td>
                        <td>{card.title}</td>
                        <td>{card.description}</td>
                        <td>{card.category}</td>
                        <td>
                          <button className={styles.deleteButton} onClick={() => handleDeleteCard(card.id)}>
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
          </>
        )}
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
  </div>
  );  
}
export default ProfessorDashboard;

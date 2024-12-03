// AlunoDashboard.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/AlunoDashboard.module.css';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MdAddTask } from 'react-icons/md';
import Image from 'next/image';
import { MdCheckCircle } from 'react-icons/md';

interface AlunoData {
  name: string;
  id: string;
  login: string;
  photo_path?: string;
}

interface Exercicio {
  name: string;
  carga: number;
  repeticoes: number;
}

interface Treino {
  id: string;
  aluno_id: string;
  descricao: string;
  data: string;
  exercicios?: Exercicio[];
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  treino: Treino;
  isRecurring?: boolean; // Add this property
}

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const AlunoDashboard = () => {
  const [alunoData, setAlunoData] = useState<AlunoData | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTreinoId, setSelectedTreinoId] = useState<string>('');
  const [expandedTreinos, setExpandedTreinos] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const login = localStorage.getItem('login');
    if (!login) {
      router.push('/login');
    } else {
      const fetchAlunoData = async () => {
        try {
          const response = await fetch(`/api/alunos?login=${login}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Dados do aluno:', data.aluno); // Adicione este log
            setAlunoData(data.aluno);

            // Fetch detailed treinos with exercises
            const treinosData = data.treinos || [];
            const detailedTreinos = await Promise.all(
              treinosData.map(async (treino: Treino) => {
                const treinoResponse = await fetch(
                  `/api/treinos?aluno_id=${treino.aluno_id}&treino_id=${treino.id}`
                );
                if (treinoResponse.ok) {
                  const treinoDetalhado = await treinoResponse.json();
                  return { ...treino, exercicios: treinoDetalhado.exercicios };
                } else {
                  console.error('Erro ao buscar detalhes do treino');
                  return treino;
                }
              })
            );
            setTreinos(detailedTreinos);

            // Fetch registered treinos
            if (data.aluno && data.aluno.id) {
              await fetchRegisteredTreinos(data.aluno.id, detailedTreinos);
            }
          } else {
            console.error('Erro ao buscar dados do aluno');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do aluno', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAlunoData();
    }
  }, [router]);

  const fetchRegisteredTreinos = async (
    alunoId: string,
    treinosList: Treino[]
  ) => {
    try {
      const response = await fetch(`/api/sessions?aluno_id=${alunoId}`);
      if (response.ok) {
        const data = await response.json();
  
        const registeredEvents = data.map((registro: any) => {
          // Adiciona o horário ao string de data para evitar problemas de fuso horário
          const dateString = `${registro.data}T12:00:00`;
  
          // Cria a data corretamente
          const eventDate = new Date(dateString);
  
          // Encontra o treino correspondente
          const treino = treinosList.find(
            (t) => t.id === registro.treino_id.toString()
          );
  
          // Se o treino não for encontrado, cria um objeto vazio para evitar erros
          const treinoData = treino || {
            id: registro.treino_id.toString(),
            descricao: registro.treino_descricao || 'Treino',
            exercicios: [],
          };
  
          return {
            id: registro.id,
            title: treinoData.descricao,
            start: eventDate,
            end: eventDate,
            treino: treinoData,
          };
        });
  
        setEvents(registeredEvents);
      } else {
        console.error('Erro ao buscar treinos registrados');
      }
    } catch (error) {
      console.error('Erro ao buscar treinos registrados', error);
    }
  };
  const downloadPDF = (treinoId: string) => {
    const url = `/api/treinos/${treinoId}/pdf`;
  
    // Iniciar o download abrindo a URL em uma nova aba
    window.open(url, '_blank');
  };

  const handleSelectEvent = async (event: Event) => {
    if (!alunoData) {
      return;
    }
  
    try {
      const response = await fetch(
        `/api/treinos?aluno_id=${alunoData.id}&treino_id=${event.treino.id}`
      );
      if (response.ok) {
        const treinoDetalhado = await response.json();
  
        // Atualiza o treino do evento com os detalhes, incluindo exercícios
        const updatedEvent = {
          ...event,
          treino: {
            ...event.treino,
            exercicios: treinoDetalhado.exercicios || [],
          },
        };
  
        setSelectedEvent(updatedEvent);
      } else {
        console.error('Erro ao buscar detalhes do treino');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do treino', error);
    }
  };

  const handleSelectSlot = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSaveTreino = async () => {
    if (!selectedTreinoId || !selectedDate || !alunoData) {
      alert('Por favor, selecione um treino.');
      return;
    }
  
    const treino = treinos.find((t) => t.id === selectedTreinoId);
  
    if (!treino) {
      alert('Treino não encontrado.');
      return;
    }
  
    const dateOnly = format(selectedDate, 'yyyy-MM-dd');
    console.log('alunoData.id:', alunoData.id);
    console.log('selectedTreinoId:', selectedTreinoId);
    console.log('data:', dateOnly);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: alunoData.login,
          treino_id: selectedTreinoId,
          data: dateOnly,
        }),
      });
  
      if (response.ok) {
        // Refresh the registered treinos
        alert('Sessão de treino registrada com sucesso!');
        await fetchRegisteredTreinos(alunoData.id, treinos);
      } else {
        console.error('Erro ao registrar treino');
      }
    } catch (error) {
      console.error('Erro ao registrar treino', error);
      alert('Erro ao registrar treino');
    }
  
    // Reset modal state
    setSelectedTreinoId('');
    setSelectedDate(null);
    setShowModal(false);
  };

  const getTreinoLetterIcon = (title: string) => {
    let letter = '';
    let className = styles.treinoLetterIcon;

    if (title.includes('Treino A')) {
      letter = 'A';
      className += ` ${styles.iconA}`;
    } else if (title.includes('Treino B')) {
      letter = 'B';
      className += ` ${styles.iconB}`;
    } else if (title.includes('Treino C')) {
      letter = 'C';
      className += ` ${styles.iconC}`;
    } else if (title.includes('Treino D')) {
      letter = 'D';
      className += ` ${styles.iconD}`;
    } else {
      letter = 'T'; // Default letter for Treino
      className += ` ${styles.iconDefault}`;
    }

    return <div className={className}>{letter}</div>;
  };

  const CustomDateHeader = ({ date, label }: any) => {
  const isToday = isSameDay(date, new Date());
  const eventOnDate = events.find((event) => isSameDay(event.start, date));

  const handleDateClick = () => {
    if (eventOnDate) {
      handleSelectEvent(eventOnDate);
    } else {
      handleSelectSlot(date);
    }
  };

  

  return (
    <div className={styles.dateHeader} onClick={handleDateClick}>
      <div
        className={`${styles.dateNumber} ${isToday ? styles.todayCell : ''}`}
      >
        {label}
      </div>
      {eventOnDate ? (
        <div className={styles.checkmarkIcon}>
          <MdCheckCircle />
        </div>
      ) : (
        <div className={styles.plusIcon}>
          <MdAddTask />
        </div>
      )}
    </div>
  );
};

  const toggleTreino = (treinoId: string) => {
    setExpandedTreinos((prevExpanded) => {
      if (prevExpanded.includes(treinoId)) {
        // Collapse the Treino if it's already expanded
        return prevExpanded.filter((id) => id !== treinoId);
      } else {
        // Expand the Treino
        return [...prevExpanded, treinoId];
      }
    });
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.headerTitle}>Painel do Aluno</h1>

      {alunoData && (
      <div className={styles.alunoInfo}>
        <h2 className={styles.alunoName}>{alunoData.name}</h2>
        {alunoData.photo_path && (
        <Image
          src={alunoData.photo_path}
          alt={`${alunoData.name}`}
          width={150} // Ajuste conforme necessário
          height={150} // Ajuste conforme necessário
          className={styles.alunoPhoto}
        />
      )}
      </div>
    )}

      {/* Cards for Treinos */}
      <div className={styles.cardsContainer}>
      {treinos.map((treino) => (
          <div key={treino.id} className={styles.treinoCard}>
            <div
              className={styles.treinoHeader}
              onClick={() => toggleTreino(treino.id)}
            >
              <h3>{treino.descricao}</h3>
              <span className={styles.expandIcon}>
                {expandedTreinos.includes(treino.id) ? '−' : '+'}
              </span>
            </div>
            {expandedTreinos.includes(treino.id) && treino.exercicios && (
              <div className={styles.exerciciosContainer}>
                {treino.exercicios.map((exercicio, index) => (
                  <div key={index} className={styles.exercicioCard}>
                    <strong>{exercicio.name}</strong>
                    <p>Repetições: {exercicio.repeticoes}</p>
                    <p>Carga: {exercicio.carga} kg</p>
                  </div>
                ))}
                   {/* botão de download */}
              <div className={styles.cardFooter}>
                <button
                  onClick={() => downloadPDF(treino.id)}
                  className={styles.downloadButton}
                >
                  Baixar PDF
                </button>
              </div>
              </div>
            )}
          </div>
        ))}
      
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          // selectable
          onSelectEvent={handleSelectEvent}
          // onSelectSlot={handleSelectSlot}
          views={['month', 'week']}
          defaultView="month"
          components={{
            month: {
              dateHeader: CustomDateHeader,
            },
          }}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Treino',
            noEventsInRange: 'Não há treinos neste período.',
          }}
        />
      </div>

      {/* Modal for viewing event details */}
      {selectedEvent && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedEvent.title}</h2>
            {selectedEvent.treino && selectedEvent.treino.exercicios && selectedEvent.treino.exercicios.length > 0 ? (
            <ul>
                {selectedEvent.treino.exercicios.map((exercicio, index) => (
                  <li key={index}>
                    <strong>{exercicio.name}</strong>
                    <p>Carga: {exercicio.carga} kg</p>
                    <p>Repetições: {exercicio.repeticoes}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem exercícios disponíveis para este treino.</p>
            )}
            <button onClick={() => setSelectedEvent(null)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal for selecting treino to register */}
      {showModal && selectedDate && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Registrar Treino</h2>
            <p>
              Selecione o treino realizado em{' '}
              {format(selectedDate, 'dd/MM/yyyy')}:
            </p>
            <div className={styles.treinoOptions}>
              {treinos.map((treino) => (
                <button
                  key={treino.id}
                  className={`${styles.treinoOption} ${
                    selectedTreinoId === treino.id
                      ? styles.treinoOptionSelected
                      : ''
                  }`}
                  onClick={() => setSelectedTreinoId(treino.id)}
                >
                  {treino.descricao}
                </button>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button
                onClick={handleSaveTreino}
                className={styles.saveButton}
              >
                Concluir
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlunoDashboard;

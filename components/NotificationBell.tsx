// components/NotificationBell.tsx

import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import styles from '../styles/NotificationBell.module.css';

interface Aluno {
  id?: string;
  name: string;
  login: string;
  password?: string;
  cpf?: string;
  birth_date?: string;
  email?: string;
  telefone?: string;
}

interface NotificationBellProps {
  aniversariantes: Aluno[];
  onSelectAluno: (aluno: Aluno) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ aniversariantes, onSelectAluno }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAlunoDetails, setSelectedAlunoDetails] = useState<Aluno | null>(null);

  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  const handleViewAlunoDetails = (aluno: Aluno) => {
    setSelectedAlunoDetails(aluno);
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.headerIcons}>
        <div className={styles.notificationIcon} onClick={toggleNotificationDropdown}>
          <FaBell className={styles.bellIcon} />
          {aniversariantes.length > 0 && (
            <span className={styles.notificationBadge}>{aniversariantes.length}</span>
          )}
        </div>
      </div>
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
      {selectedAlunoDetails && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAlunoDetails(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedAlunoDetails.name}</h2>
            <p><strong>CPF:</strong> {selectedAlunoDetails.cpf || 'Não informado'}</p>
            <p><strong>Data de Nascimento:</strong> {selectedAlunoDetails.birth_date || 'Não informado'}</p>
            <button onClick={() => setSelectedAlunoDetails(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

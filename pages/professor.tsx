import React from 'react';
import Optionsbar from '../components/OptionsBar';
import ProfessorDashboard from './ProfessorDashboard';
import styles from '../styles/Professor.module.css';

const Professor: React.FC = () => {
  return (
    <div className={styles.container}>
      <Optionsbar />
      <div className={styles.content}>
        <h1>Painel do Professor</h1>
        <ProfessorDashboard />
      </div>
    </div>
  );
};

export default Professor;

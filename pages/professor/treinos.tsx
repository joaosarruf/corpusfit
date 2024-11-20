import React from 'react';
import TreinoList from '../../components/TreinoList';
import TreinoForm from '../../components/TreinoForm';
import Optionsbar from '../../components/OptionsBar';
import styles from '../../styles/Professor.module.css';

const Treinos: React.FC = () => {
  return (
    <div className={styles.container}>
      <Optionsbar />
      <div className={styles.content}>
        <h1>Gerenciar Treinos</h1>
        <TreinoForm />
        <TreinoList />
      </div>
    </div>
  );
};

export default Treinos;

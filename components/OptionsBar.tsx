import React from 'react';
import styles from '../styles/OptionsBar.module.css'; // Ajuste o caminho conforme necessário

const Optionsbar: React.FC = () => {
  return (
    <div className={styles.optionsbar}>
      <h2>Menu</h2>
      <a href="/profile">Perfil</a>
      <a href="/settings">Configurações</a>
      <a href="/logout">Sair</a>
    </div>
  );
};

export default Optionsbar;

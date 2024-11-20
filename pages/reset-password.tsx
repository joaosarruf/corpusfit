// pages/reset-password.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css';

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className={styles.resetContainer}>
      <div className={styles.resetCard}>
        <h1>Redefinir Senha</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.resetButton}>Redefinir</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;

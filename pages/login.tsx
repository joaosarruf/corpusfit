// pages/login.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/login.module.css';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });

    if (res.ok) {
      const { user } = await res.json();
      localStorage.setItem('login', user.login);
      if (user.role === 'aluno') router.push('/AlunoDashboard');
      else if (user.role === 'professor') router.push('/ProfessorDashboard');
      else if (user.role === 'admin') router.push('/Administrador');
    } else {
      const { error } = await res.json();
      setError(error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label>Login:</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.loginButton}>Login</button>
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Esqueceu a senha?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

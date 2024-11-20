import { useState } from 'react';

const ForgotPassword: React.FC = () => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, email }),
    });

    const data = await response.json();
    setMessage(response.ok ? data.message : data.error);
  };

  return (
    <div>
      <h2>Esqueceu sua senha?</h2>
      <form onSubmit={handleForgotPassword}>
        <input
          type="text"
          placeholder="Seu login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar link de redefinição</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;

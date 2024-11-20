import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useRouter } from 'next/router';

interface LoginFormProps {
  userType: 'aluno' | 'professor';
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ userType, setErrorMessage }) => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        throw new Error('Erro no login');
      }

      const data = await response.json();
      console.log('Login bem-sucedido:', data);

      // Armazena o login no localStorage
      localStorage.setItem('login', login);

      // Redireciona com base no tipo de usuário
      if (data.type === 'professor') {
        router.push('/ProfessorDashboard');
      } else if (data.type === 'aluno') {
        router.push('/AlunoDashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocorreu um erro inesperado');
      }
      console.error('Erro no login:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Login - {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </Typography>
      <TextField label="Login" variant="outlined" fullWidth value={login} onChange={(e) => setLogin(e.target.value)} />
      <TextField label="Senha" variant="outlined" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit" variant="contained" color="primary">Entrar</Button>
    </Box>
  );
};

export default LoginForm;

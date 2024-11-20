// login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/login';

test('Exibe erro de validação quando os campos estão vazios', () => {
  render(<Login />);
  
  fireEvent.click(screen.getByText('Entrar'));

  expect(screen.getByText('Login é obrigatório')).toBeInTheDocument();
  expect(screen.getByText('Senha precisa ter no mínimo 8 caracteres')).toBeInTheDocument();
});

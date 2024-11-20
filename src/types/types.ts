// src/types/types.ts

export interface Aluno {
    id: string; // Decida se será 'string' ou 'number' e seja consistente
    name: string;
    login: string;
    password?: string;
    cpf?: string;
    birth_date?: string;
    email?: string;
    telefone?: string;
  }
  
# CAJU Organize

Aplicação React para gerenciar espaços e reservas (front-end). Este repositório contém a UI; a persistência é feita via Firebase (Firestore) quando configurado.

Breve e direto — instruções mínimas para rodar localmente.

## Tecnologias

- `React` (CRA)
- `react-router-dom`
- `Firebase` (Firestore) — Para Banco De Dados

## Quick Start

1. Instale dependências:

   `npm install`

2. Configure o Firebase (opcional): edite `src/firebase/config.js` com suas credenciais.

3. Rode em desenvolvimento:

   `npm start`

4. Abra `http://localhost:3000`.

## Observações importantes

- Reservas no sistema atual são tratadas como gratuitas (campo de preço removido da UI).

## Estrutura (resumida)

- `src/components` — componentes React por funcionalidade (Dashboard, Espacos, Reservas, Relatorios, Usuários, Agenda)
- `src/services` — chamadas ao backend / Firebase
- `src/firebase/config.js` — credenciais do Firebase

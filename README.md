
  # FocusGrid

  Aplicativo web de produtividade focado em pessoas com TDAH.

  ## Rodando localmente

  1. Instale as dependencias:

  ```bash
  npm i
  ```

  2. Inicie o app:

  ```bash
  npm run dev
  ```

  ## Banco de dados (inicio)

  O projeto agora tem uma camada inicial para Supabase:

  - schema SQL em `supabase/schema.sql` (tasks, subtasks, goals, goal_steps, routines, routine_steps)
  - cliente em `src/app/lib/supabase.ts`
  - repositorios em `src/app/repositories/taskRepository.ts`, `src/app/repositories/goalsRepository.ts` e `src/app/repositories/routinesRepository.ts`
  - autenticação por email em `src/app/components/Login.tsx`

  Se as variaveis de ambiente nao estiverem configuradas, o app continua funcionando com fallback local.

  ### Configuracao rapida

  1. Crie um projeto no Supabase.
  2. Execute o SQL de `supabase/schema.sql` no SQL Editor.
  3. Copie `.env.example` para `.env` e preencha:

  ```env
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  VITE_AI_BREAKDOWN_ENDPOINT=
  ```

  Depois de configurar, acesse `/login` para entrar com seu email.

  Se voce ja tinha executado uma versao anterior do schema, rode o arquivo novamente para criar as tabelas novas.

  Observacao: o calendario agora usa tarefas reais com base em `scheduledDate`.

## Fase 4 — Qualidade e produção

Esta aplicação agora inclui um fluxo básico de qualidade:

- `npm run lint` para verificar problemas de código
- `npm run test -- --run` para rodar testes automáticos
- `npm run build` para gerar artefatos de produção
- `npm run ci` para executar lint, testes e build em sequência

Para configurar Supabase local ou produção, veja `SUPABASE_SETUP.md`.
  
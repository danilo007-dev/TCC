
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

  Se as variaveis de ambiente nao estiverem configuradas, o app continua funcionando com fallback local.

  ### Configuracao rapida

  1. Crie um projeto no Supabase.
  2. Execute o SQL de `supabase/schema.sql` no SQL Editor.
  3. Copie `.env.example` para `.env` e preencha:

  ```env
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```

  Se voce ja tinha executado uma versao anterior do schema, rode o arquivo novamente para criar as tabelas novas.

  Observacao: o calendario agora usa tarefas reais com base em `scheduledDate`.
  
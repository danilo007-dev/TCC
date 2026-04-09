# Supabase Setup

## Local vs produção

O app pode rodar em modo desenvolvimento sem Supabase, usando dados em memória apenas para facilitar o desenvolvimento local.

Para um ambiente real, configure o Supabase e adicione as variáveis de ambiente:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AI_BREAKDOWN_ENDPOINT=
```

## Passos para configurar o Supabase

1. Crie um novo projeto no Supabase.
2. No painel do Supabase, acesse `SQL Editor`.
3. Cole e execute o SQL de `supabase/schema.sql`.
4. Na aba `Settings > API`, copie a URL do projeto e a `anon` key.
5. Crie o arquivo `.env` na raiz do projeto com as variáveis acima.

## Políticas e RLS

A aplicação espera que as tabelas estejam configuradas com `user_id` e políticas de RLS para garantir que cada usuário só acesse seus dados.

Se você usar o schema atual, verifique as políticas do Supabase em:
- `tasks`
- `subtasks`
- `goals`
- `goal_steps`
- `routines`
- `routine_steps`

## Execução

Use os comandos:

- `npm run dev` para desenvolvimento
- `npm run build` para gerar a versão de produção
- `npm run ci` para lint, testes e build

# Relatorio Simples - FocusGrid

Data: 08/04/2026
Branch de trabalho: test/correcoes-iniciais

## 1. O que foi feito

- Padronizacao de nome do produto para FocusGrid em pontos principais da interface.
- Ajustes de acessibilidade basica no HTML inicial.
- Melhorias de estabilidade em fluxo de foco e estrutura de layout.
- Inicio da camada de persistencia com Supabase (tarefas, metas e rotinas).
- Integracao inicial de tarefas com calendario real (sem hardcode de eventos fixos).
- Fortalecimento de resiliencia da app com Error Boundary global.
- Atualizacao de documentacao para setup local e setup inicial de banco.

## 2. O que foi corrigido e adicionado

### Corrigido

- lang do HTML alterado para pt-BR.
- Nome inconsistente do app corrigido para FocusGrid.
- API duplicada do HelpfulHint simplificada.
- Possivel memory leak no Deep Focus corrigido (cleanup de overflow do body).
- NavButton refatorado para fora do render de Layout.
- Progresso e streak deixaram de ser mock fixo e passaram a ser calculados por dados reais de tarefas concluidas.
- DayProgress, antes sem uso, agora esta conectado ao fluxo de progresso.
- QuickCapture deixou de depender apenas de simulacao com timeout e passou a suportar endpoint real configuravel com fallback local.

### Adicionado

- ErrorBoundary global com fallback visual.
- Supabase client e camada de repositorios:
  - taskRepository
  - goalsRepository
  - routinesRepository
- Schema SQL inicial em supabase/schema.sql com tabelas:
  - tasks, subtasks
  - goals, goal_steps
  - routines, routine_steps
- Suporte a scheduledDate em tarefas para alimentar calendario.
- IDs de novas tarefas/subtarefas padronizados com UUID no fluxo atual.
- Arquivo .env.example para configuracao de ambiente.

## 3. O que ainda falta (alem da IA)

### Alta prioridade

- Ativar autenticacao e RLS de verdade no Supabase (hoje esta preparado, mas nao ligado em producao).
- Adicionar user_id e isolamento real por usuario em todas as entidades.
- Concluir estrategia de migracoes/versionamento de banco (hoje o setup e manual por schema unico).

### Prioridade media

- Calendario ainda nao exibe metas e rotinas com data dedicada (hoje foco principal em tarefas).
- Melhorar UX de estado remoto (loading/erro) nas telas conectadas ao banco.
- Revisar compatibilidade de dados de ambientes antigos (seed/local vs remoto) em cenarios de migracao.

### Qualidade para producao

- Criar testes automatizados (store, repositorios e fluxos criticos de UI).
- Adicionar monitoramento de erros/sincronizacao (observabilidade).
- Fazer ajustes de performance de bundle (build alerta sobre chunk grande).

## 4. Proximo passo recomendado

1. Fechar autenticacao + RLS + user_id.
2. Completar calendario com metas/rotinas datadas.
3. Adicionar testes de regressao para fluxos principais.

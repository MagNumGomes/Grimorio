# 📜 Product Backlog - Grimório

Este documento contém o **Product Backlog Oficial** do projeto Grimório, detalhando as 14 User Stories priorizadas, suas estimativas em Story Points, critérios de aceitação e planejamento de Sprints.

---

## 1. Visão Geral do Backlog

| Rank | Prioridade | ID | User Story | Estimativa | Sprint | Status |
| :---: | :---: | :---: | :--- | :---: | :---: | :---: |
| **1** | **Alta** | **US01** | Cadastrar, listar, editar e concluir tarefas com atributos básicos (título, prazo, prioridade) para ter o controle central das minhas atividades. | 8 pts | **Sprint 1** | **Concluído** |
| **2** | **Alta** | **US02** | Criar subtarefas aninhadas e checklists dentro de cada tarefa principal para detalhar e decompor atividades mais complexas. | 5 pts | **Sprint 1** | **Concluído** |
| **3** | **Alta** | **US03** | Gerenciar tarefas através de um quadro Kanban interativo com colunas de status ("A Fazer", "Em Andamento", "Concluído") e fluxo de transição. | 8 pts | **Sprint 1** | **Concluído** |
| **4** | **Alta** | **US04** | Agrupar tarefas em projetos e pastas com métricas de progresso visual para organizar múltiplos objetivos simultâneos. | 5 pts | **Sprint 1** | **Concluído** |
| 5 | Alta | US05 | Configurar regras de recorrência (diária, semanal, personalizada) para automatizar a geração de tarefas repetitivas. | 5 pts | Sprint 2 | Backlog |
| 6 | Alta | US06 | Sincronização e persistência avançada com motor offline-first robusto e resolução de conflitos. | 8 pts | Sprint 2 | Backlog |
| 7 | Alta | US07 | Receber notificações agendadas e alertas contextuais por localização (GPS/FCM) para não perder prazos. | 8 pts | Sprint 2 | Backlog |
| 8 | Média | US08 | Ordenação inteligente baseada em urgência, esforço e nível de energia para saber exatamente qual tarefa priorizar. | 5 pts | Sprint 2 | Backlog |
| 9 | Média | US09 | Utilizar um modo foco com cronômetro Pomodoro integrado e bloqueio de distrações com gamificação completa de XP. | 5 pts | Sprint 2 | Backlog |
| 10 | Média | US10 | Anexar arquivos, gravar notas de voz e criar tarefas via linguagem natural/comando de voz. | 8 pts | Sprint 3 | Backlog |
| 11 | Média | US11 | Visualizar as entregas em um calendário integrado e compartilhar tarefas para permitir o acompanhamento e colaboração. | 8 pts | Sprint 3 | Backlog |
| 12 | Baixa | US12 | Visualizar relatórios com gráficos SVG de produtividade e análise de atrasos para entender padrões de entrega. | 5 pts | Sprint 3 | Backlog |
| 13 | Baixa | US13 | Widget na tela inicial do Android para registrar pendências com um toque e manter engajamento. | 5 pts | Sprint 3 | Backlog |
| 14 | Baixa | US14 | Importar arquivos CSV, exportar cartões de imagem e sincronizar com Google Tasks / agenda nativa. | 8 pts | Sprint 3 | Backlog |

**Total do Backlog:** 14 User Stories · 91 Story Points
**Entregue na Sprint 1:** 4 User Stories · 26 Story Points (100% da meta da Sprint 1)

---

## 2. Detalhamento da Sprint 1 (Rank 1 a 4) - Status: Concluída

### US01: CRUD de Tarefas Básicas (Rank 1 - 8 pts)
- **Descrição:** Como usuário, quero cadastrar, listar, editar e concluir tarefas com atributos básicos (título, prazo, prioridade) para ter o controle central das minhas atividades.
- **Critérios de Aceitação:**
  1. Cadastro de tarefa com título (obrigatório, até 120 caracteres), descrição opcional, data/hora de vencimento, prioridade (Alta, Média, Baixa), categoria e tempo estimado.
  2. Validação determinística de formulário impedindo dados inválidos com feedback visual.
  3. Listagem interativa com filtros rápidos por status (Todas, A Fazer, Em Andamento, Concluídas), categoria e prioridade.
  4. Conclusão instantânea através de checkbox com atualização de status e registro de `completedAt`.
  5. Edição completa de todos os atributos e arquivamento/exclusão de tarefas.
- **Implementação:** Entregue via `TaskRepository`, `HomeScreen`, `TaskCard`, `TaskFormModal` e `FilterBar`.

### US02: Subtarefas Aninhadas e Checklists (Rank 2 - 5 pts)
- **Descrição:** Como usuário, quero criar subtarefas aninhadas e checklists dentro de cada tarefa principal para detalhar e decompor atividades mais complexas.
- **Critérios de Aceitação:**
  1. Criação de múltiplos itens de checklist diretamente no formulário de criação/edição de tarefas.
  2. Resumo visual de subtarefas no card (`✓ X de Y subtarefas`) com expansão sob demanda.
  3. Conclusão interativa de subtarefas individuais com persistência imediata no armazenamento offline.
  4. Métodos dedicados no repositório: `addSubtask`, `toggleSubtask`, `removeSubtask`.
- **Implementação:** Entregue via modelo `Subtask`, builders em `TaskFormModal` e visualizador interativo em `TaskCard`.

### US03: Quadro Kanban Interativo (Rank 3 - 8 pts)
- **Descrição:** Como usuário, quero gerenciar minhas tarefas através de um quadro Kanban interativo com colunas visuais de status ("A Fazer", "Em Andamento", "Concluído") e transição entre colunas.
- **Critérios de Aceitação:**
  1. Visualização em 3 colunas de status: `A Fazer` (`todo`), `Em Andamento` (`in_progress`) e `Concluído` (`done`).
  2. Contadores dinâmicos de tarefas por coluna.
  3. Transição direta entre colunas através de ações táteis nos cards (`[Iniciar ›]`, `[‹ A Fazer]`, `[Concluir ✓]`, `[↺ Reabrir]`).
  4. Filtragem do Kanban por projeto selecionado.
  5. Layout adaptativo: navegação por abas de colunas em telas móveis e colunas lado a lado em telas amplas/web.
- **Implementação:** Entregue na view `kanban` de `HomeScreen`, `moveTaskKanban` em `TaskRepository` e `TaskCard`.

### US04: Projetos e Pastas com Métricas de Progresso (Rank 4 - 5 pts)
- **Descrição:** Como usuário, quero agrupar tarefas em projetos e pastas com métricas de progresso visual para organizar múltiplos objetivos simultâneos.
- **Critérios de Aceitação:**
  1. Criação de projetos com nome, descrição, cor de identificação da paleta arcana e ícone simbólico (`◈`, `✦`, `☷`, `◉`, `☾`, etc.).
  2. Vínculo de tarefas a projetos no formulário ou diretamente pelo card do projeto.
  3. Barra de progresso visual calculando a porcentagem de conclusão (`completedTasks / totalTasks * 100%`).
  4. Lista expansível de tarefas de cada projeto com checkbox para conclusão rápida.
  5. Atalhos rápidos para visualizar as tarefas do projeto no Quadro Kanban ou na Lista principal.
  6. Exclusão segura de projetos com desvinculação automática das tarefas associadas.
- **Implementação:** Entregue via `ProjectModal`, view `projects` em `HomeScreen`, `projectService.ts` e `taskRepository.ts`.

---

## 3. Planejamento das Próximas Sprints

### Sprint 2: Automação, Notificações e Gamificação Completa (31 pts)
- **US05 (5 pts):** Regras de recorrência (diária, semanal, mensal) e recriação automática de tarefas.
- **US06 (8 pts):** Sincronização offline e resolução de conflitos via motor de sync.
- **US07 (8 pts):** Lembretes locais agendados e notificações com alertas de prazo.
- **US08 (5 pts):** Ordenação inteligente por urgência, esforço e nível de energia.
- **US09 (5 pts):** Modo Foco Pomodoro com XP arcano completo, níveis e medalhas.

### Sprint 3: Inteligência Operacional, Portabilidade e Relatórios (34 pts)
- **US10 (8 pts):** Anexos de áudio, notas de voz e criação de rituais via linguagem natural.
- **US11 (8 pts):** Visualização em calendário integrado e colaboração/compartilhamento.
- **US12 (5 pts):** Relatórios de produtividade com gráficos SVG e análise de atrasos.
- **US13 (5 pts):** Widget para a tela inicial do Android.
- **US14 (8 pts):** Importação/exportação CSV e sincronização com Google Tasks/Google Agenda.

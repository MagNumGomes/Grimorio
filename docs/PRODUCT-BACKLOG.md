# Product Backlog - Grimório

Este documento registra a direção e as prioridades do **Grimório** como produto: organizar o trabalho cotidiano, apoiar a conclusão de objetivos e evoluir gradualmente em automação, foco, compreensão do progresso e portabilidade. As 14 histórias abaixo traduzem essa direção em entregas incrementais; as sprints são uma organização do plano de trabalho, não a definição do produto. Os critérios de aceitação estão detalhados para as histórias implementadas; o escopo futuro é uma referência sujeita a refinamento.

---

## 1. Direção e áreas do produto

| Área | Necessidade atendida | Escopo previsto |
| --- | --- | --- |
| Planejamento pessoal | Capturar e organizar ações do dia a dia | Tarefas, atributos, filtros e diferentes ordenações |
| Execução e acompanhamento | Decompor trabalho e visualizar seu andamento | Checklists, estados e quadro Kanban |
| Objetivos | Relacionar ações a metas de maior duração | Projetos, agrupamentos por pasta e indicadores de progresso |
| Rotina e foco | Reduzir trabalho repetitivo e apoiar períodos de concentração | Recorrência, lembretes e sessão Pomodoro |
| Visibilidade e portabilidade | Entender padrões e levar os dados para outros fluxos | Relatórios, calendário, importação/exportação e integrações |
| Acesso contextual | Acompanhar e registrar atividades com menos etapas | Widget móvel, anexos, voz e compartilhamento |

As áreas acima descrevem o escopo global pretendido. A tabela de histórias diferencia o que já está disponível do que ainda depende de implementação.

## 2. Product Backlog

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :---: | :---: | :--- | :---: | :---: |
| 1 | Alta | Como usuário, desejo cadastrar, listar, editar e concluir tarefas com título, prazo e prioridade, para organizar minhas atividades. | 8 | 1 |
| 2 | Alta | Como usuário, desejo decompor tarefas em itens de checklist que possam ser concluídos individualmente, para acompanhar os passos de atividades maiores. | 5 | 1 |
| 3 | Alta | Como usuário, desejo visualizar e mover tarefas entre etapas em um quadro Kanban, para acompanhar o andamento do meu trabalho. | 8 | 1 |
| 4 | Alta | Como usuário, desejo agrupar tarefas em projetos e pastas e acompanhar seu progresso, para organizar objetivos maiores. | 5 | 1 |
| 5 | Alta | Como usuário, desejo configurar tarefas recorrentes, para automatizar a organização de atividades repetitivas. | 5 | 2 |
| 6 | Alta | Como usuário, desejo sincronizar e fazer backup dos meus dados com resolução de conflitos, para acessá-los em diferentes dispositivos com continuidade. | 8 | 2 |
| 7 | Alta | Como usuário, desejo receber lembretes e alertas de prazo, para não esquecer atividades importantes. | 8 | 2 |
| 8 | Média | Como usuário, desejo receber sugestões de prioridade que considerem urgência, esforço e nível de energia, para escolher melhor a próxima tarefa. | 5 | 2 |
| 9 | Média | Como usuário, desejo usar sessões de foco com cronômetro Pomodoro e acompanhar meu progresso, para manter a concentração. | 5 | 2 |
| 10 | Média | Como usuário, desejo anexar arquivos e notas de voz e criar tarefas por voz ou linguagem natural, para registrar informações com facilidade. | 8 | 3 |
| 11 | Média | Como usuário, desejo consultar tarefas em um calendário e compartilhá-las, para visualizar compromissos e colaborar quando necessário. | 8 | 3 |
| 12 | Baixa | Como usuário, desejo consultar relatórios de produtividade e atrasos, para compreender meus hábitos e meu progresso. | 5 | 3 |
| 13 | Baixa | Como usuário, desejo acessar e registrar tarefas por um widget Android, para capturar atividades rapidamente. | 5 | 3 |
| 14 | Baixa | Como usuário, desejo importar e exportar tarefas e integrá-las a serviços de agenda, para transportar meus dados entre ferramentas. | 8 | 3 |

**Total estimado:** 91 Story Points.

As histórias 1 a 4 estão implementadas. A história 8 é parcial: a sugestão atual considera prazo, prioridade e esforço, mas ainda não considera nível de energia. As histórias 5 a 7 e 9 a 14 permanecem planejadas. Estimativas e escopo futuro podem ser refinados.

## 3. Escopo implementado: planejamento e acompanhamento

### US01: Tarefas (Rank 1 - 8 pts)
- **Descrição:** Como usuário, quero cadastrar, listar, editar e concluir tarefas com atributos básicos (título, prazo, prioridade) para ter o controle central das minhas atividades.
- **Critérios de Aceitação:**
  1. Cadastro de tarefa com título (obrigatório, até 120 caracteres), descrição opcional, data/hora de vencimento, prioridade (Alta, Média, Baixa), categoria e tempo estimado.
  2. Validação determinística de formulário impedindo dados inválidos com feedback visual.
  3. Listagem interativa com filtros rápidos por status (Todas, A Fazer, Em Andamento, Concluídas), categoria e prioridade.
  4. Conclusão instantânea através de checkbox com atualização de status e registro de `completedAt`.
  5. Edição completa de todos os atributos e arquivamento/exclusão de tarefas.
- **Implementação:** Entregue via `TaskRepository`, `HomeScreen`, `TaskCard`, `TaskFormModal` e `FilterBar`.

### US02: Checklists e decomposição de tarefas (Rank 2 - 5 pts)
“Subtarefas aninhadas” significa itens de checklist dentro de uma tarefa, em um nível; não há hierarquia recursiva.
- **Descrição:** Como usuário, quero criar subtarefas aninhadas e checklists dentro de cada tarefa principal para detalhar e decompor atividades mais complexas.
- **Critérios de Aceitação:**
  1. Criação de múltiplos itens de checklist diretamente no formulário de criação/edição de tarefas.
  2. Resumo visual de subtarefas no card (`✓ X de Y subtarefas`) com expansão sob demanda.
  3. Conclusão interativa de subtarefas individuais com persistência imediata no armazenamento offline.
  4. Métodos dedicados no repositório: `addSubtask`, `toggleSubtask`, `removeSubtask`.
- **Implementação:** Entregue via modelo `Subtask`, builders em `TaskFormModal` e visualizador interativo em `TaskCard`.

### US03: Acompanhamento em Kanban (Rank 3 - 8 pts)
- **Descrição:** Como usuário, quero gerenciar minhas tarefas através de um quadro Kanban interativo com colunas visuais de status ("A Fazer", "Em Andamento", "Concluído") e transição entre colunas.
- **Critérios de Aceitação:**
  1. Visualização em 3 colunas de status: `A Fazer` (`todo`), `Em Andamento` (`in_progress`) e `Concluído` (`done`).
  2. Contadores dinâmicos de tarefas por coluna.
  3. Transição direta entre colunas através de ações táteis nos cards (`[Iniciar ›]`, `[‹ A Fazer]`, `[Concluir ✓]`, `[↺ Reabrir]`).
  4. Filtragem do Kanban por projeto selecionado.
  5. Layout adaptativo: navegação por abas de colunas em telas móveis e colunas lado a lado em telas amplas/web.
- **Implementação:** Entregue na view `kanban` de `HomeScreen`, `moveTaskKanban` em `TaskRepository` e `TaskCard`.

### US04: Organização por projetos e pastas (Rank 4 - 5 pts)
Pastas são agrupamentos simples pelo campo `Project.folder`, informado na criação do projeto; a lista organiza projetos por pasta e nome. Não há hierarquia recursiva de pastas.
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

## 4. Evolução planejada

Os tópicos a seguir descrevem intenção de produto. Não são recursos disponíveis até serem implementados e verificados.

### Sprint 2: Rotina, continuidade e foco (31 pts, estimativa original)
- **US05 (5 pts):** Regras de recorrência (diária, semanal, mensal) e recriação automática de tarefas.
- **US06 (8 pts):** Sincronização offline e resolução de conflitos via motor de sync.
- **US07 (8 pts):** Lembretes locais agendados e notificações com alertas de prazo.
- **US08 (5 pts, parcial):** Evoluir a ordenação já existente (prazo, prioridade e esforço) para incluir nível de energia e contexto.
- **US09 (5 pts):** Modo Foco Pomodoro com XP arcano completo, níveis e medalhas.

### Sprint 3: Acesso, compreensão e portabilidade (34 pts, estimativa original)
- **US10 (8 pts):** Anexos de áudio, notas de voz e criação de rituais via linguagem natural.
- **US11 (8 pts):** Visualização em calendário integrado e colaboração/compartilhamento.
- **US12 (5 pts):** Relatórios de produtividade com gráficos SVG e análise de atrasos.
- **US13 (5 pts):** Widget para a tela inicial do Android.
- **US14 (8 pts):** Importação/exportação CSV e sincronização com Google Tasks/Google Agenda.

# Product Backlog - Grimório

## Visão do produto

O Grimório é um aplicativo Android de organização pessoal e profissional que transforma tarefas em rituais de progresso. O produto combina planejamento, execução e acompanhamento com uma camada de gamificação arcana: experiência (XP), níveis, sequência diária, missões e recompensas.

## Priorização

- **MVP:** entregar criação, organização, execução e feedback básico de tarefas.
- **Valor central:** o usuário consegue planejar o dia, concluir tarefas e perceber evolução.
- **Critério de pronto:** a história está implementada, validada em Android e possui tratamento de estados vazios, erro e carregamento quando aplicável.

## Backlog priorizado

| ID | História de usuário | Valor | Estimativa | Sprint |
| --- | --- | --- | ---: | --- |
| US01 | Como usuário, quero criar uma tarefa com título, descrição, prazo, horário, prioridade, categoria e esforço estimado para registrar o que preciso fazer. | Essencial | 8 | 1 |
| US02 | Como usuário, quero visualizar minhas tarefas em lista e filtrá-las por status, categoria e prioridade para encontrar rapidamente o que devo executar. | Essencial | 5 | 1 |
| US03 | Como usuário, quero editar, concluir e arquivar tarefas para manter minha organização atualizada. | Essencial | 5 | 1 |
| US04 | Como usuário, quero receber uma sugestão de ordem das tarefas baseada em prazo, prioridade e esforço para começar pelo que mais importa. | Alto | 8 | 1 |
| US05 | Como usuário, quero configurar tarefas recorrentes diárias, semanais, mensais ou personalizadas para não recriar atividades repetitivas. | Alto | 8 | 2 |
| US06 | Como usuário, quero decompor uma tarefa em subtarefas e checklist para acompanhar projetos complexos passo a passo. | Alto | 8 | 2 |
| US07 | Como usuário, quero usar um quadro Kanban com as colunas A fazer, Fazendo e Concluído para acompanhar visualmente meu fluxo. | Alto | 8 | 2 |
| US08 | Como usuário, quero usar um cronômetro Pomodoro associado a uma tarefa para trabalhar em períodos de foco e registrar o tempo investido. | Alto | 5 | 2 |
| US09 | Como usuário, quero ganhar XP, níveis, medalhas, sequência diária e recompensas ao concluir tarefas para manter minha motivação. | Diferencial | 8 | 2 |
| US10 | Como usuário, quero consultar um histórico com filtros por período, categoria e prioridade para analisar minha produtividade. | Alto | 5 | 3 |
| US11 | Como usuário, quero visualizar um calendário e um painel de progresso por projeto ou categoria para planejar e acompanhar minha evolução. | Alto | 8 | 3 |
| US12 | Como usuário, quero que minhas alterações funcionem offline e sejam sincronizadas quando a conexão voltar para não perder meu trabalho. | Essencial | 13 | 3 |

**Total estimado:** 89 pontos.

## Sprints

### Sprint 1 - Fundamentos do grimório

**Objetivo:** criar, organizar e priorizar tarefas do dia.

- US01, US02, US03 e US04
- Resultado demonstrável: o usuário cria uma tarefa, encontra-a na lista, altera seu estado e recebe uma ordem sugerida.
- Critério de sucesso: o fluxo principal de tarefa funciona sem depender de uma API externa.

### Sprint 2 - Execução e motivação

**Objetivo:** transformar tarefas em um fluxo visual de execução com gamificação forte.

- US05, US06, US07, US08 e US09
- Resultado demonstrável: o usuário organiza tarefas recorrentes e subtarefas, move itens no Kanban, inicia foco e recebe XP/recompensas.
- Critério de sucesso: concluir uma tarefa atualiza status, XP, nível, sequência e progresso da missão do dia.

### Sprint 3 - Inteligência operacional e confiabilidade

**Objetivo:** dar visão histórica e garantir continuidade de uso.

- US10, US11 e US12
- Resultado demonstrável: o usuário consulta seu desempenho, navega pelo calendário e continua trabalhando sem conexão.
- Critério de sucesso: alterações feitas offline permanecem disponíveis localmente e são sincronizadas após reconexão.

## Definition of Done

- Fluxo feliz e estados de carregamento, vazio e erro implementados.
- Interface responsiva para Android e acessível por toque.
- Dados validados no formulário.
- Testes unitários para regras de XP, recorrência, priorização e sincronização.
- Teste de integração para criar, concluir e editar uma tarefa.
- Documentação atualizada e build Android validado.

## Fora do MVP inicial

Colaboração em tempo real, anexos, notificações push, geofencing, comando de voz, widgets Android, integração com Google Tasks, IA generativa, backup em nuvem, relatórios avançados e modo de apresentação ficam como épicos posteriores. Eles dependem de autenticação, backend, permissões nativas, custos de serviços e decisões de privacidade.

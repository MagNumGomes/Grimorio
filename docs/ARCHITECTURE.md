# Arquitetura do Grimório

Este documento descreve a arquitetura implementada atualmente. O Grimório é uma aplicação de organização pessoal para web e mobile; a arquitetura abaixo suporta o fluxo disponível de tarefas, checklists e projetos. Recursos que ainda estão no backlog não são apresentados como componentes existentes.

## Visão geral

O desenho separa a interface, os casos de uso da aplicação, as regras do domínio e a persistência local. A interface observa e aciona operações por meio do hook; o repositório é responsável por ler, validar e persistir o estado.

```text
index.ts → HomeScreen → useTasks → TaskRepository → AsyncStorage
               ↓           ↓            ↓
           componentes   serviços      validação
                         de domínio
```

## Domínios e responsabilidades

- `src/domain/entities/task.ts`: `Task`, `Subtask`, `Project`, DTOs e estados canônicos `todo | in_progress | done`.
- `src/domain/services/taskValidation.ts`: regras de campos, categorias, estados, datas reais, esforço e subtarefas. Os limites são verificados em runtime.
- `src/domain/services/taskFiltering.ts`: filtro usado tanto pela aplicação quanto pelos testes; exclui arquivados e combina estado, categoria, prioridade, projeto e vencimento.
- `src/domain/services/prioritization.ts`: pontuação determinística (prazo, prioridade e esforço) e ordenação sugerida; tarefas concluídas ficam depois das ativas. Energia e contexto pessoal não são considerados.
- `src/domain/services/projectService.ts`: contadores e percentual de conclusão, excluindo tarefas arquivadas.
- `src/shared/utils/dateUtils.ts`: operações de calendário local e apresentação de prazo.

Na apresentação, `HomeScreen` compõe as áreas Lista, Kanban e Projetos. `useTasks` mantém o estado da tela, aciona operações do repositório, aplica filtros/ordenação e atualiza os dados após mutações. Os componentes de tarefa, formulário, projeto e arquivo implementam as interações correspondentes. As funções de domínio mantêm validação, filtragem, priorização e cálculo de progresso fora da interface.

## Dados e persistência local

`TaskRepository` aceita um `IStorage` injetável. `null` habilita armazenamento apenas em memória para testes. A aplicação usa AsyncStorage no navegador e no React Native.

O documento `@grimorio_state_v2` contém `{ version: 2, tasks, projects }`. A remoção de projeto e a desvinculação das tarefas são persistidas juntas em uma gravação do documento; isso evita gravações parciais entre chaves, mas não promete durabilidade/transação do sistema de arquivos.

1. Cada leitura/mutação entra na fila da instância do repositório.
2. A mutação trabalha em uma cópia isolada do estado.
3. Validação verifica dados, identidades e referências antes de gravar.
4. O cache é atualizado somente depois do sucesso de `setItem`.
5. Exceções são propagadas até a interface e a fila continua disponível para nova tentativa.

Na ausência de v2, o repositório lê `@grimorio_tasks_v1` e `@grimorio_projects_v1`. `pending/completed` são convertidos em `todo/done`; subtarefas ausentes em dados antigos recebem `[]`. As chaves legadas são preservadas. JSON inválido, esquema inválido e falha de leitura não são tratados como armazenamento vazio.

IDs e datas de criação de subtarefas existentes são preservados. `projectId: null` desvincula uma tarefa; datas/horários vazios removem os campos. `undefined` em atualização significa não alterar.

A fila protege operações concorrentes na mesma instância. Não há sincronização ou resolução de conflitos entre instâncias, abas e dispositivos implementadas. AsyncStorage não adiciona criptografia aos dados.

## Fluxo de dados e apresentação

1. `HomeScreen` obtém dados e ações de `useTasks` e compõe lista, quadro Kanban, projetos, arquivo e formulários.
2. `useTasks` carrega tarefas/projetos, aplica filtros e ordenação, e solicita as mutações ao repositório.
3. `TaskRepository` valida a entrada, altera uma cópia do estado e persiste o documento local antes de atualizar o cache.
4. Erros de carregamento ou gravação são propagados para a interface, que pode informar o problema e oferecer nova tentativa.

O resumo diário utiliza a data local. Listas são apresentadas com `FlatList`; no Kanban, três colunas aparecem a partir de 900 px e abas de coluna em larguras menores. Projetos são ordenados por pasta e nome; `Project.folder` é um agrupamento textual, sem hierarquia recursiva.

## Qualidade e validação

- `npm test`: 29 testes com `node:test`, incluindo regressões de concorrência, erro de gravação, dados corrompidos, migração, identidades, exclusão de projeto e isolamento do cache.
- `npm run typecheck`: valida aplicação e arquivos de teste; remoção de tipos no runner não substitui essa verificação.
- `npm run test:e2e`: script existente no `package.json`, mas sem Playwright instalado/configurado e sem casos E2E no repositório; não é uma verificação disponível no estado atual.

Em 04/10/2026, `npm test` (29/29) e `npm run typecheck` foram executados com sucesso. Isso não substitui validação de build e execução em dispositivos Android/iOS.

## Limites e evolução arquitetural

A arquitetura atual é local-first: não há servidor, autenticação, sincronização entre dispositivos, notificações agendadas, recorrência, calendário, relatórios, widget ou colaboração implementados. Esses recursos aparecem no [Product Backlog](PRODUCT-BACKLOG.md) como possibilidades de evolução; sua inclusão poderá exigir novos serviços, persistência ou integrações, a serem definidos quando entrarem em desenvolvimento.

![Banner do Grimório — organizador pessoal offline-first](assets/banner.svg)

# 📖 Grimório

> **Um espaço pessoal para planejar, acompanhar e concluir o que importa — dos afazeres do dia a objetivos maiores.**

O **Grimório** é um organizador pessoal para web e dispositivos móveis. Reúne tarefas, checklists, projetos e diferentes formas de acompanhar o progresso em uma experiência com identidade visual arcana. Seu desenvolvimento busca equilibrar organização cotidiana, foco, autonomia e uma experiência simples de usar.

---

## 📑 Índice

- [Visão do Produto](#-visão-do-produto)
- [O que está disponível](#-o-que-está-disponível)
- [Product Backlog](#-product-backlog)
- [Estrutura do Projeto e Arquitetura](#-estrutura-do-projeto-e-arquitetura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Instalar, Executar, Usar e Testar o Projeto](#-como-instalar-executar-usar-e-testar-o-projeto)
- [Documentação](#-documentação)

---

## 🔮 Visão do Produto

O Grimório ajuda a transformar intenções em trabalho organizado: capturar uma tarefa, detalhar os próximos passos, definir quando e com que prioridade agir, acompanhar seu estado e relacioná-la a um objetivo maior. Lista e Kanban atendem diferentes formas de visualizar o trabalho; projetos e pastas simples agrupam atividades; a visão do dia aproxima o planejamento da execução.

A direção do produto é ampliar esse fluxo com apoio a rotinas recorrentes, foco, notificações, consulta de progresso e portabilidade dos dados. O backlog separa o que já está implementado do que continua planejado, sem apresentar intenções futuras como recursos disponíveis.

## ✨ O que está disponível

Os recursos abaixo descrevem a implementação atual, sem depender da divisão do trabalho em sprints:

- 📜 **Rituais (Tarefas):** Cadastro com título, descrição, categoria (*Estudos*, *Trabalho*, *Pessoal*, *Organização*, *Bem-estar*, *Grimório*, *Outros*), prioridade (*Baixa*, *Média*, *Alta*), prazo e estimativa de esforço.
- ☑️ **Checklists Dinâmicos:** Subtarefas em lista expansível por tarefa, com contadores de progresso imediatos e marcação individual.
- ⎇ **Quadro Kanban:** Visualização dinâmica em três colunas (*A Fazer*, *Em Andamento*, *Concluído*), com contadores em tempo real, transições diretas nos cards e layout adaptativo (colunas no desktop/web e abas no mobile).
- 📁 **Projetos e Pastas:** Agrupamento de tarefas por projeto e nome de pasta, com barra de progresso, cores e símbolos. Pastas são agrupamentos simples, não hierárquicos.
- ⚖️ **Priorização & Ordenação:** Sugestão determinística que considera prazo, prioridade e esforço; a interface também permite ordenar por prazo, prioridade ou esforço. Não considera energia ou disponibilidade contextual.
- ⌂ **Visão Hoje:** Resumo e filtro das tarefas com vencimento para o dia atual, incluindo seu estado de conclusão.
- 📦 **Arquivo de Rituais:** Arquive tarefas pelos cards e use a tela de arquivo para restaurá-las ou excluí-las definitivamente.
- 🛡️ **Persistência & Resiliência:** Um documento local `AsyncStorage` (`@grimorio_state_v2`), operações serializadas, validação em runtime e migração de dados legados (`v1`). Não equivale a criptografia nem sincroniza dados entre dispositivos.

---

## 🧭 Product Backlog

O backlog organiza a evolução do Grimório em histórias priorizadas. As estimativas estão em Story Points; os números de Sprint indicam o planejamento atual, que pode ser refinado.

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

---

## 🏗️ Estrutura do Projeto e Arquitetura

> 📐 *Para entender em detalhes as decisões arquiteturais e o formato do documento de armazenamento, leia o [Guia de Arquitetura](docs/ARCHITECTURE.md).*

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Ecossistema Mobile** | **Expo ~57.0.26** & **React Native 0.86.3** | Framework unificado e tooling para desenvolvimento mobile |
| **Execução Web** | **React 19** & **React Native Web** | Preview rápido e responsivo no navegador durante o desenvolvimento |
| **Linguagem** | **TypeScript ~6.0.3** | Tipagem estática para aplicação e testes |
| **Armazenamento** | **AsyncStorage ~2.2.0** | Persistência local offline-first |
| **Suíte de Testes** | **Node.js Test Runner** (`node:test`) | Execução de testes de unidade e integração sem dependências externas |
| **Design & Assets** | **Sharp** | Pipeline de conversão automatizada do `logo.svg` para ícones do Android |
| **Build Android** | **Gradle** & **Android SDK** (JDK 17) | Compilação do pacote nativo `.apk` via script PowerShell |

---

## 🚀 Como Instalar, Executar, Usar e Testar o Projeto

### 1. Pré-requisitos

- **Node.js** (versão 22 ou superior, necessária para o runner de testes usado pelo projeto)
- **npm** (incluso com o Node)
- *(Opcional para compilar o APK nativo)*: JDK 17 e Android Studio com Android SDK configurados.

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/MagNumGomes/Grimorio.git
cd Grimorio
npm ci
```

*(Opcional)* Para regenerar os ícones do aplicativo a partir do arquivo vetorial:

```bash
npm run icons
```

---

### 3. Como Executar

#### Opção A: No Navegador (Web - Preview Rápido)

```bash
npm run web
```
Acesse [http://localhost:8081](http://localhost:8081) para testar a interface de forma imediata.

#### Opção B: No Emulador Android ou Dispositivo Físico

```bash
# Iniciar o servidor Metro do Expo
npm run start

# Ou abrir diretamente no emulador Android conectado
npm run android
```

#### Opção C: Gerar o APK Instalável (Android)

```bash
npm run android:apk
```

O script gera os ícones adaptativos, cria o projeto Android e compila o pacote de release:
```text
builds/grimorio-1.0.0-preview.apk
```

O APK de preview usa a configuração de assinatura local do projeto; não é um artefato de distribuição assinado para publicação.

Para instalar via cabo USB com depuração ativada:
```bash
adb install -r builds/grimorio-1.0.0-preview.apk
```

---

### 4. Como Usar o Aplicativo

- **Criar Tarefas (Rituais):** Toque em `+ Ritual`, preencha título, descrição, categoria, esforço estimado, prioridade e data/horário de vencimento.
- **Checklists & Subtarefas:** Inclua itens no formulário da tarefa e expanda o checklist no card para marcá-los. Os itens têm um nível, sem hierarquia recursiva.
- **Quadro Kanban:** Alterne para a aba `⎇ Kanban` para gerenciar o fluxo com botões de transição direta (`[Iniciar ›]`, `[‹ A Fazer]`, `[Concluir ✓]`, `[↺ Reabrir]`).
- **Projetos e Metas:** Toque em `+ Projeto` para criar projetos agrupados por pastas. Vincule rituais para acompanhar a barra de progresso visual.
- **Foco Diário:** Use a aba `⌂ Hoje` para ver o resumo e as tarefas com prazo para o dia, concluídas ou não.
- **Sugestão de Prioridades:** A ordenação sugerida considera prazo, prioridade e esforço. A barra também permite ordenar por prazo, prioridade ou esforço.
- **Arquivo & Histórico:** Abra o menu de arquivadas para restaurar rituais antigos ou excluí-los em definitivo.

---

## 📚 Documentação

Para conhecer a direção do produto e como a implementação atual está organizada:

- 📋 [**Product Backlog**](docs/PRODUCT-BACKLOG.md) — Objetivos, prioridades, estado e escopo das histórias.
- 🏛️ [**Guia de Arquitetura**](docs/ARCHITECTURE.md) — Organização da aplicação, domínios, persistência local e validação.

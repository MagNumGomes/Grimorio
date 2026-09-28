# 📜 Grimório

## Visão do Produto

O **Grimório** é um aplicativo móvel e multiplataforma de organização pessoal offline-first que transforma tarefas cotidianas em rituais de progresso. O produto combina planejamento estruturado, execução visual e acompanhamento por objetivos, envolto em uma estética arcana refinada (pergaminho, ameixa profunda, dourado envelhecido e verde-sálvia) sem poluição visual ou emojis coloridos de sistema.

---

## ✦ Product Backlog Oficial

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

---

## ✦ Sprints e Entregas

### 🟢 Sprint 1 - Fundamentos e Fluxo Visual (26 pts) · **CONCLUÍDA**
**Objetivo:** criar, decompor, organizar em fluxo visual e agrupar tarefas do dia por projetos.
- **US01 (8 pts):** Cadastro, edição, listagem, filtros, conclusão e exclusão/arquivo de tarefas.
- **US02 (5 pts):** Subtarefas aninhadas e checklists com progresso visual e marcação interativa.
- **US03 (8 pts):** Quadro Kanban interativo com 3 colunas (`A Fazer`, `Em Andamento`, `Concluído`) e transição direta entre colunas.
- **US04 (5 pts):** Agrupamento por Projetos e Pastas com barras de progresso visual (`% concluído`) e contadores.
- **Resultado Entregue:** 100% das 4 histórias implementadas com persistência offline (`AsyncStorage`), sem dependência de APIs externas e 19 testes automatizados aprovados.

### 🟡 Sprint 2 - Automação, Notificações e Gamificação (31 pts) · **PLANEJADA**
**Objetivo:** automatizar rotinas, garantir alertas pontuais e introduzir ciclo completo de gamificação.
- US05 (Recorrência de tarefas), US06 (Sincronização avançada), US07 (Notificações locais/remotas), US08 (Priorização inteligente avançada), US09 (Modo Foco Pomodoro com XP e medalhas).

### ⚪ Sprint 3 - Inteligência Operacional e Portabilidade (34 pts) · **PLANEJADA**
**Objetivo:** fornecer visão temporal expandida, entrada multimodal e relatórios analíticos.
- US10 (Áudio/Voz), US11 (Calendário integrado), US12 (Relatórios SVG), US13 (Widgets Android), US14 (Importação/Exportação CSV e Google Tasks).

---

## ✦ Funcionalidades da Sprint 1 em Destaque

1. **Visão em Três Modos:** Alternância instantânea via abas superiores ou navegação inferior:
   - **`☷ Lista`**: Visão completa com filtros rápidos (Status, Categoria, Prioridade, Projeto), ordenação e priorização arcana.
   - **`⎇ Quadro Kanban`**: 3 colunas de execução com botões táteis nos cards (`[Iniciar ›]`, `[‹ A Fazer]`, `[Concluir ✓]`, `[↺ Reabrir]`).
   - **`◈ Projetos`**: Cards com identidade de cor, ícones simbólicos, barra de progresso visual e lista expansível de atividades.
2. **Subtarefas e Checklists:** Decomposição de tarefas complexas em itens com contadores (`✓ X de Y subtarefas`) e marcação interativa.
3. **Estética Arcana Limpa:** Paleta em tons terrosos e nobres (`#f6f1e8`, `#403243`, `#c38b32`, `#778b72`) utilizando exclusivamente tipografia e glifos monocromáticos (`✦`, `☾`, `◈`, `◉`, `✓`, `›`), eliminando emojis coloridos de sistema.
4. **Offline-First:** Dados persistidos localmente sem necessidade de login ou conexão com a internet.

---

## ✦ Como Executar o Projeto

No diretório `grimorio-app/`:

```bash
# Instalar dependências
npm install

# Iniciar o servidor Expo (Web, Android ou iOS)
npm start

# Iniciar diretamente no navegador web
npm run web

# Executar a verificação de tipos estritos do TypeScript
npx tsc --noEmit

# Executar a suíte completa de testes automatizados (19 testes)
npm test
```

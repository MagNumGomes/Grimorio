import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import type { Task, TaskStatus, CreateTaskDTO, UpdateTaskDTO, Project } from '../../domain/entities/task';
import { calculateProjectProgress } from '../../domain/services/projectService';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { ProjectModal } from '../components/ProjectModal';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { ArchivedTasksModal } from '../components/ArchivedTasksModal';
import { getHeaderDateBr, getTodayDateString } from '../../shared/utils/dateUtils';
import { colors } from '../theme/colors';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'A Fazer' }, { status: 'in_progress', label: 'Em Andamento' }, { status: 'done', label: 'Concluído' },
];

export default function HomeScreen() {
  const data = useTasks();
  const { width } = useWindowDimensions();
  const [view, setView] = useState<'list' | 'kanban' | 'projects'>('list');
  const [column, setColumn] = useState<TaskStatus>('todo');
  const [formOpen, setFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialProjectId, setInitialProjectId] = useState<string>();
  const [projectOpen, setProjectOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (operation: () => Promise<unknown>, success = 'Alteração salva no grimório.') => {
    setActionError(null);
    try { await operation(); setMessage(success); }
    catch (error) { setMessage(null); setActionError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'); }
  };
  const openCreate = (projectId?: string) => { setTaskToEdit(null); setInitialProjectId(projectId); setFormOpen(true); };
  const openEdit = (task: Task) => { setTaskToEdit(task); setInitialProjectId(undefined); setFormOpen(true); };
  const submitTask = async (dto: CreateTaskDTO | UpdateTaskDTO) => {
    if (taskToEdit) await data.updateTask(taskToEdit.id, dto);
    else await data.createTask(dto as CreateTaskDTO);
    setMessage('Ritual salvo no grimório.');
  };
  const showProject = (projectId: string, target: 'list' | 'kanban') => {
    data.clearFilters(); data.setProjectFilter(projectId); setView(target);
  };
  const renderTask = (task: Task) => (
    <TaskCard task={task} projectName={data.projects.find(p => p.id === task.projectId)?.name}
      onToggleStatus={id => void run(() => data.toggleStatus(id))}
      onToggleSubtask={(id, subId) => void run(() => data.toggleSubtask(id, subId))}
      onMove={(id, status) => void run(() => data.moveTask(id, status))}
      onEdit={openEdit} onArchive={id => void run(() => data.archiveTask(id), 'Ritual arquivado.')} />
  );
  const todayTasks = data.activeTasks.filter(task => task.dueDate === getTodayDateString());
  const todayCompleted = todayTasks.filter(task => task.status === 'done').length;
  const todayPercent = todayTasks.length ? Math.round(todayCompleted / todayTasks.length * 100) : 0;

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{getHeaderDateBr()}</Text>
        <Text style={styles.title}>Grimório de Rituais</Text>
        <Text style={styles.subtitle}>Um passo de cada vez, um propósito em cada ritual.</Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summarySymbol}>☾</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>Seus rituais de hoje</Text>
          <Text style={styles.summaryText}>{todayCompleted} de {todayTasks.length} concluídos · {todayPercent}%</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${todayPercent}%` }]} /></View>
        </View>
      </View>
      <View style={styles.row}>
        {([{ key: 'list', label: '☷ Lista' }, { key: 'kanban', label: '⎇ Kanban' }, { key: 'projects', label: '◈ Projetos' }] as const).map(tab => (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: view === tab.key }} style={[styles.tab, view === tab.key && styles.selected]} onPress={() => { setView(tab.key); if (tab.key === 'kanban') data.setStatusFilter('all'); }}>
            <Text style={[styles.tabText, view === tab.key && styles.selectedText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, { justifyContent: 'space-between', marginVertical: 16 }]}>
        <Text style={styles.heading}>{view === 'projects' ? 'Projetos e pastas' : 'Seus rituais'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={view === 'projects' ? 'Criar projeto' : 'Criar nova tarefa no grimório'} style={styles.button} disabled={!!data.error || data.loading} onPress={() => view === 'projects' ? setProjectOpen(true) : openCreate(data.projectFilter === 'all' ? undefined : data.projectFilter)}>
          <Text style={styles.buttonText}>{view === 'projects' ? '+ Projeto' : '+ Ritual'}</Text>
        </Pressable>
      </View>
      {(actionError || message) && <Pressable accessibilityRole="button" accessibilityLabel="Fechar mensagem" onPress={() => { setActionError(null); setMessage(null); }} style={[styles.notice, actionError ? styles.error : undefined]}><Text accessibilityRole="alert" style={styles.text}>{actionError ?? message} ×</Text></Pressable>}
      {view !== 'projects' && <>
        <FilterBar statusFilter={data.statusFilter} onStatusChange={data.setStatusFilter} categoryFilter={data.categoryFilter} onCategoryChange={data.setCategoryFilter} priorityFilter={data.priorityFilter} onPriorityChange={data.setPriorityFilter} projectFilter={data.projectFilter} onProjectChange={data.setProjectFilter} projects={data.projects} sortOrder={data.sortOrder} onSortChange={data.setSortOrder} onClearFilters={data.clearFilters} hasActiveFilters={data.hasActiveFilters} totalResultsCount={data.processedTasks.length} />
        <Text style={styles.subtitle}>{data.processedTasks.length} rituais listados{data.todayOnly ? ' · vencimento hoje' : ''}</Text>
      </>}
      {data.loading && <ActivityIndicator color={colors.plum} style={{ margin: 20 }} />}
      {data.error && <View style={[styles.notice, styles.error]}><Text style={styles.text}>{data.error}</Text><Pressable accessibilityRole="button" onPress={() => void data.reload()}><Text style={styles.link}>Tentar novamente</Text></Pressable></View>}
    </View>
  );

  const projectCard = (project: Project) => {
    const progress = calculateProjectProgress(project, data.tasks);
    const expanded = expandedProject === project.id;
    const tasks = data.activeTasks.filter(t => t.projectId === project.id);
    return <View style={[styles.project, { borderLeftColor: project.color ?? colors.gold }]}>
      <Text style={styles.eyebrow}>{project.folder || 'Sem pasta'}</Text>
      <Text style={styles.heading}>{project.icon || '◈'} {project.name}</Text>
      {!!project.description && <Text style={styles.subtitle}>{project.description}</Text>}
      <Text style={styles.subtitle}>{progress.completedTasks}/{progress.totalTasks} concluídos · {progress.progressPercent}%</Text>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress.progressPercent }} style={styles.projectTrack}><View style={[styles.fill, { width: `${progress.progressPercent}%`, backgroundColor: project.color ?? colors.gold }]} /></View>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={() => setExpandedProject(expanded ? null : project.id)}><Text style={styles.link}>{expanded ? '− Ocultar' : '+ Tarefas'}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => openCreate(project.id)}><Text style={styles.link}>+ Ritual</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => showProject(project.id, 'list')}><Text style={styles.link}>Lista</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => showProject(project.id, 'kanban')}><Text style={styles.link}>Kanban</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Excluir projeto ${project.name}`} onPress={() => void run(() => data.deleteProject(project.id), 'Projeto excluído; tarefas preservadas e desvinculadas.')}><Text style={[styles.link, { color: colors.crimson }]}>Excluir</Text></Pressable>
      </View>
      {expanded && tasks.map(task => <Pressable key={task.id} accessibilityRole="checkbox" accessibilityState={{ checked: task.status === 'done' }} accessibilityLabel={task.title} onPress={() => void run(() => data.toggleStatus(task.id))}><Text style={styles.projectTask}>{task.status === 'done' ? '✓' : '○'} {task.title}</Text></Pressable>)}
      {expanded && tasks.length === 0 && <Text style={styles.subtitle}>Este projeto ainda não tem rituais.</Text>}
    </View>;
  };

  const empty = !data.loading && !data.error ? <EmptyState type={data.hasActiveFilters ? 'filtered-empty' : 'no-tasks'} onAction={data.hasActiveFilters ? data.clearFilters : () => openCreate()} /> : null;
  return <View style={styles.container}>
    <StatusBar style="dark" />
    {view === 'list' && <FlatList data={data.processedTasks} keyExtractor={item => item.task.id} contentContainerStyle={styles.content} ListHeaderComponent={header} ListEmptyComponent={empty}
      renderItem={({ item, index }) => <TaskCard task={item.task} projectName={data.projects.find(p => p.id === item.task.projectId)?.name} prioritizedTask={data.sortOrder === 'suggested' ? item : undefined} rank={index + 1} onToggleStatus={id => void run(() => data.toggleStatus(id))} onToggleSubtask={(id, subId) => void run(() => data.toggleSubtask(id, subId))} onMove={(id, status) => void run(() => data.moveTask(id, status))} onEdit={openEdit} onArchive={id => void run(() => data.archiveTask(id))} />} />}
    {view === 'projects' && <FlatList data={[...data.projects].sort((a, b) => (a.folder ?? '').localeCompare(b.folder ?? '') || a.name.localeCompare(b.name))} keyExtractor={p => p.id} contentContainerStyle={styles.content} ListHeaderComponent={header} renderItem={({ item }) => projectCard(item)} ListEmptyComponent={!data.loading && !data.error ? <View style={styles.project}><Text style={styles.heading}>Seu próximo objetivo começa aqui.</Text><Text style={styles.subtitle}>Crie um projeto e organize-o em uma pasta.</Text></View> : null} />}
    {view === 'kanban' && <FlatList data={[0]} keyExtractor={String} contentContainerStyle={styles.content} ListHeaderComponent={header} renderItem={() => <View>
      {width < 900 && <View style={styles.row}>{COLUMNS.map(c => <Pressable key={c.status} accessibilityRole="tab" accessibilityState={{ selected: column === c.status }} onPress={() => setColumn(c.status)} style={[styles.tab, column === c.status && styles.selected]}><Text style={[styles.tabText, column === c.status && styles.selectedText]}>{c.label} ({data.processedTasks.filter(t => t.task.status === c.status).length})</Text></Pressable>)}</View>}
      <View style={styles.board}>{COLUMNS.filter(c => width >= 900 || c.status === column).map(c => <View key={c.status} style={styles.column}>
        <Text style={styles.heading}>{c.label} · {data.processedTasks.filter(t => t.task.status === c.status).length}</Text>
        {data.processedTasks.filter(t => t.task.status === c.status).map(({ task }) => <View key={task.id}>{renderTask(task)}</View>)}
        {data.processedTasks.every(t => t.task.status !== c.status) && <Text style={styles.subtitle}>Nenhum ritual nesta coluna.</Text>}
      </View>)}</View>
    </View>} />}
    <View style={styles.navigation}>
      <Pressable accessibilityRole="button" onPress={() => { data.clearFilters(); data.setTodayOnly(true); setView('list'); }}><Text style={styles.link}>⌂ Hoje</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => { data.clearFilters(); setView('list'); }}><Text style={styles.link}>☷ Rituais</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setView('projects')}><Text style={styles.link}>◈ Projetos</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setArchiveOpen(true)}><Text style={styles.link}>Arquivo ({data.archivedTasks.length})</Text></Pressable>
    </View>
    <TaskFormModal visible={formOpen} taskToEdit={taskToEdit} projects={data.projects} initialProjectId={initialProjectId} onClose={() => setFormOpen(false)} onSubmit={submitTask} />
    <ProjectModal visible={projectOpen} onClose={() => setProjectOpen(false)} onSubmit={async dto => { await data.createProject(dto); setMessage('Projeto criado.'); }} />
    <ArchivedTasksModal visible={archiveOpen} archivedTasks={data.archivedTasks} onClose={() => setArchiveOpen(false)} onRestore={async id => { await data.restoreTask(id); }} onDelete={async id => { await data.deleteTask(id); }} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 48, paddingBottom: 24, width: '100%', maxWidth: 1440, alignSelf: 'center' },
  header: { marginBottom: 24 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '800', color: colors.goldDark, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '800', color: colors.plum },
  subtitle: { fontSize: 12, color: colors.muted, lineHeight: 20, marginBottom: 10 },
  heading: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  summary: { backgroundColor: colors.plum, padding: 20, borderRadius: 14, flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 24 },
  summarySymbol: { color: colors.goldLight, fontSize: 38 },
  summaryTitle: { color: colors.goldLight, fontSize: 16, fontWeight: '700' },
  summaryText: { color: colors.cardPaper, fontSize: 12, marginTop: 4 },
  track: { height: 5, borderRadius: 4, backgroundColor: colors.plumLight, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.gold },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  tab: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: colors.line },
  selected: { backgroundColor: colors.plum },
  tabText: { color: colors.plum, fontWeight: '700', fontSize: 12 },
  selectedText: { color: colors.goldLight },
  button: { backgroundColor: colors.plum, padding: 12, borderRadius: 8 },
  buttonText: { color: colors.goldLight, fontWeight: '800' },
  notice: { backgroundColor: colors.sageLight, padding: 14, borderRadius: 8, marginBottom: 12 },
  error: { backgroundColor: colors.crimsonLight, borderWidth: 1, borderColor: colors.crimson },
  text: { color: colors.ink, fontSize: 13 },
  link: { color: colors.plum, fontWeight: '700', fontSize: 12, paddingVertical: 10 },
  project: { padding: 18, marginBottom: 16, borderRadius: 12, backgroundColor: colors.cardPaper, borderWidth: 1, borderColor: colors.line, borderLeftWidth: 4 },
  projectTrack: { height: 7, backgroundColor: colors.line, borderRadius: 4, overflow: 'hidden', marginVertical: 10 },
  projectTask: { color: colors.ink, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  board: { flexDirection: 'row', gap: 16, marginTop: 14 },
  column: { flex: 1, minWidth: 0, backgroundColor: colors.line, padding: 10, borderRadius: 10 },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 10, paddingBottom: 20, backgroundColor: colors.cardPaper, borderTopWidth: 1, borderTopColor: colors.line },
});

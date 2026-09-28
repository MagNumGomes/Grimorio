import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../../domain/entities/task';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { ArchivedTasksModal } from '../components/ArchivedTasksModal';
import { colors } from '../theme/colors';
import { getHeaderDateBr } from '../../shared/utils/dateUtils';

export default function HomeScreen() {
  const {
    tasks,
    activeTasks,
    archivedTasks,
    processedTasks,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    sortOrder,
    setSortOrder,
    hasActiveFilters,
    clearFilters,
    createTask,
    updateTask,
    toggleStatus,
    archiveTask,
    restoreTask,
    deleteTask,
    completedCount,
    totalActiveCount,
    earnedXp,
  } = useTasks();

  // Navigation & Modals
  const [activeNav, setActiveNav] = useState<'Hoje' | 'Rituais' | 'Foco' | 'Arquivo'>('Hoje');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null);

  // Feedback toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (dto: CreateTaskDTO | UpdateTaskDTO) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, dto);
      showToast('✦ Ritual atualizado com sucesso no grimório.');
    } else {
      await createTask(dto as CreateTaskDTO);
      showToast('✦ Novo ritual inscrito com sucesso no grimório.');
    }
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const newStatus = task?.status === 'completed' ? 'reaberto' : 'concluído';
    await toggleStatus(id);
    showToast(`✦ Ritual ${newStatus}!`);
  };

  const handleArchive = async (id: string) => {
    await archiveTask(id);
    showToast('✦ Ritual guardado no Arquivo Sagrado.');
  };

  const handleRestore = async (id: string) => {
    await restoreTask(id);
    showToast('✦ Ritual restaurado para a lista ativa.');
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    showToast('✦ Ritual removido definitivamente.');
  };

  const handleNavPress = (tab: 'Hoje' | 'Rituais' | 'Foco' | 'Arquivo') => {
    setActiveNav(tab);
    if (tab === 'Hoje') {
      setStatusFilter('pending');
    } else if (tab === 'Rituais') {
      setStatusFilter('all');
    } else if (tab === 'Arquivo') {
      setIsArchiveModalOpen(true);
    } else if (tab === 'Foco') {
      setInfoModalMessage(
        'O Modo Foco com cronômetro Pomodoro integrado está planejado para a Sprint 2 (US08). No momento, organize e priorize seus rituais na Sprint 1!'
      );
    }
  };

  const getEmptyStateType = () => {
    if (activeTasks.length === 0) {
      return 'no-tasks';
    }
    if (hasActiveFilters && processedTasks.length === 0) {
      return 'filtered-empty';
    }
    if (statusFilter === 'completed' && processedTasks.length === 0) {
      return 'no-completed';
    }
    return 'no-tasks';
  };

  const completionPercent =
    totalActiveCount > 0 ? Math.round((completedCount / totalActiveCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.eyebrow}>{getHeaderDateBr()}</Text>
            <Text style={styles.title}>Grimório de Rituais</Text>
            <Text style={styles.subtitle}>
              Seu próximo passo aguarda no grimório.
            </Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() =>
              setInfoModalMessage(
                'Perfil Arcano: Gamificação completa com missões e medalhas virá na Sprint 2 (US09).'
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Ver perfil do grimório"
          >
            <Text style={styles.avatarText}>JG</Text>
          </Pressable>
        </View>

        {/* Streak / Motivation Card with Sprint 2 disclaimer */}
        <View style={styles.streakCard}>
          <View style={styles.moon}>
            <Text style={styles.moonText}>☾</Text>
          </View>
          <View style={styles.streakCopy}>
            <View style={styles.streakLabelRow}>
              <Text style={styles.streakLabel}>SEQUÊNCIA DIÁRIA</Text>
              <Text style={styles.demoTag}>Sprint 2 Demo</Text>
            </View>
            <Text style={styles.streakValue}>
              7 dias <Text style={styles.streakAccent}>em ascensão</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.max(15, completionPercent))}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.streakXpWrap}>
            <Text style={styles.streakNumber}>
              +{earnedXp}
              <Text style={styles.xpSmall}> XP</Text>
            </Text>
            <Text style={styles.xpDetailLabel}>obtidos hoje</Text>
          </View>
        </View>

        {/* Mission Card reflecting real completed tasks */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Missão do dia</Text>
            <Text style={styles.sectionHint}>
              {completedCount} de {totalActiveCount} rituais concluídos
            </Text>
          </View>
          <Text style={styles.percent}>{completionPercent}%</Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Text style={styles.iconText}>✦</Text>
          </View>
          <View style={styles.missionCopy}>
            <Text style={styles.missionTitle}>
              {completedCount >= 3
                ? 'Chamas acesas com êxito!'
                : 'Acenda as chamas do conhecimento'}
            </Text>
            <Text style={styles.missionHint}>
              {completedCount >= 3
                ? 'Meta diária básica de 3 rituais concluída hoje.'
                : `Complete mais ${Math.max(1, 3 - completedCount)} ritual(is) hoje para consolidar o dia.`}
            </Text>
          </View>
          <View style={styles.reward}>
            <Text style={styles.rewardValue}>+{earnedXp + 50}</Text>
            <Text style={styles.rewardLabel}>XP</Text>
          </View>
        </View>

        {/* Section Heading with Action */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Seus rituais</Text>
            <Text style={styles.sectionHint}>
              {processedTasks.length} {processedTasks.length === 1 ? 'ritual' : 'rituais'} listados
            </Text>
          </View>
          <Pressable
            style={styles.newButton}
            onPress={handleOpenCreate}
            accessibilityRole="button"
            accessibilityLabel="Criar nova tarefa no grimório"
          >
            <Text style={styles.newButtonText}>+ Novo Ritual</Text>
          </Pressable>
        </View>

        {/* FilterBar for US02 & US04 */}
        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          totalResultsCount={processedTasks.length}
        />

        {/* Task List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.plum} />
            <Text style={styles.loadingText}>Consultando o grimório...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Erro ao consultar tarefas</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
          </View>
        ) : processedTasks.length === 0 ? (
          <EmptyState
            type={getEmptyStateType()}
            onAction={hasActiveFilters ? clearFilters : handleOpenCreate}
          />
        ) : (
          processedTasks.map((item, index) => (
            <TaskCard
              key={item.task.id}
              task={item.task}
              prioritizedTask={sortOrder === 'suggested' ? item : undefined}
              rank={sortOrder === 'suggested' ? index + 1 : undefined}
              onToggleStatus={handleToggle}
              onEdit={handleOpenEdit}
              onArchive={handleArchive}
            />
          ))
        )}

        {/* Circle of Power (Progression Banner) */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Seu círculo de poder</Text>
            <Text style={styles.sectionHint}>
              Nível 4 · Aprendiz da Aurora (Sprint 2 Demo)
            </Text>
          </View>
          <Pressable
            onPress={() =>
              setInfoModalMessage(
                'O sistema de progressão por níveis e recompensas completas faz parte da Sprint 2 (US09).'
              )
            }
          >
            <Text style={styles.seeAll}>Ver círculo</Text>
          </Pressable>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>IV</Text>
          </View>
          <View style={styles.levelCopy}>
            <Text style={styles.levelTitle}>Aprendiz da Aurora</Text>
            <Text style={styles.levelHint}>
              {earnedXp + 340} / 500 XP para o próximo nível
            </Text>
            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(10, ((earnedXp + 340) / 500) * 100)
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.levelArrow}>›</Text>
        </View>
      </ScrollView>

      {/* Task Creation & Edition Modal (US01 & US03) */}
      <TaskFormModal
        visible={isFormOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Sacred Archive Modal (US03) */}
      <ArchivedTasksModal
        visible={isArchiveModalOpen}
        archivedTasks={archivedTasks}
        onClose={() => setIsArchiveModalOpen(false)}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />

      {/* Informational Modal */}
      <Modal
        visible={Boolean(infoModalMessage)}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalCard}>
            <Text style={styles.infoModalTitle}>Grimório Sagrado</Text>
            <Text style={styles.infoModalBody}>{infoModalMessage}</Text>
            <Pressable
              style={styles.infoModalBtn}
              onPress={() => setInfoModalMessage(null)}
            >
              <Text style={styles.infoModalBtnText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: '⌂', label: 'Hoje', key: 'Hoje' as const },
          { icon: '◈', label: 'Rituais', key: 'Rituais' as const },
          { icon: '◉', label: 'Foco', key: 'Foco' as const },
          {
            icon: '☷',
            label: 'Arquivo',
            key: 'Arquivo' as const,
            badge: archivedTasks.length,
          },
        ].map((item) => {
          const isActive = activeNav === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handleNavPress(item.key)}
              style={styles.navItem}
              accessibilityRole="button"
              accessibilityLabel={`Ir para ${item.label}`}
            >
              <View style={styles.navIconWrap}>
                <Text style={[styles.navIcon, isActive && styles.navActive]}>
                  {item.icon}
                </Text>
                {Boolean(item.badge && item.badge > 0) && (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: colors.plum,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 999,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: colors.goldLight,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    padding: 22,
    paddingTop: 56,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.plum,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  avatarText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 13,
  },
  streakCard: {
    backgroundColor: colors.plum,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  moon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.plumLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moonText: {
    color: colors.goldLight,
    fontSize: 26,
    lineHeight: 30,
  },
  streakCopy: {
    flex: 1,
  },
  streakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakLabel: {
    color: '#bdb0be',
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  demoTag: {
    backgroundColor: 'rgba(219, 182, 110, 0.25)',
    color: colors.goldLight,
    fontSize: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '700',
  },
  streakValue: {
    color: '#fff8e9',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  streakAccent: {
    color: '#dcb66e',
    fontSize: 11,
    fontWeight: '500',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#66566a',
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    height: 5,
    backgroundColor: '#d7a943',
    borderRadius: 4,
  },
  streakXpWrap: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  streakNumber: {
    color: '#eacb8c',
    fontSize: 16,
    fontWeight: '900',
  },
  xpSmall: {
    fontSize: 9,
  },
  xpDetailLabel: {
    color: '#bdb0be',
    fontSize: 8,
    marginTop: 2,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  percent: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 16,
  },
  seeAll: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  newButton: {
    backgroundColor: colors.plum,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  newButtonText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 12,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.lineHighlight,
    borderRadius: 12,
    padding: 13,
    marginBottom: 24,
  },
  missionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2dfb7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  iconText: {
    color: colors.gold,
    fontSize: 18,
  },
  missionCopy: {
    flex: 1,
  },
  missionTitle: {
    fontWeight: '800',
    color: colors.ink,
    fontSize: 13,
  },
  missionHint: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 3,
  },
  reward: {
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.lineHighlight,
    paddingLeft: 12,
  },
  rewardValue: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  rewardLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: colors.crimson,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  errorTitle: {
    color: colors.crimson,
    fontWeight: '800',
    fontSize: 13,
  },
  errorSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  levelCard: {
    marginTop: 4,
    backgroundColor: '#ebe5da',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  levelBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.plum,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelNumber: {
    color: colors.goldLight,
    fontSize: 15,
    fontWeight: '900',
  },
  levelCopy: {
    flex: 1,
  },
  levelTitle: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 13,
  },
  levelHint: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },
  levelTrack: {
    height: 4,
    backgroundColor: '#d2c8b8',
    borderRadius: 3,
    marginTop: 8,
  },
  levelFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  levelArrow: {
    color: colors.muted,
    fontSize: 24,
    marginLeft: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: colors.cardPaper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  navItem: {
    alignItems: 'center',
    width: 70,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  navIconWrap: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#aa9f91',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.plum,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  navBadgeText: {
    color: colors.goldLight,
    fontSize: 8,
    fontWeight: '800',
  },
  navLabel: {
    fontSize: 10,
    color: '#aa9f91',
    fontWeight: '600',
    marginTop: 2,
  },
  navActive: {
    color: colors.plum,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoModalCard: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  infoModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
  },
  infoModalBody: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoModalBtn: {
    backgroundColor: colors.plum,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  infoModalBtnText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 12,
  },
});

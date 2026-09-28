import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Task } from '../../domain/entities/task';
import { PrioritizedTask } from '../../domain/services/prioritization';
import { formatDueDisplay, isTaskOverdue } from '../../shared/utils/dateUtils';
import { colors } from '../theme/colors';
import { PriorityScoreBadge } from './PriorityScoreBadge';

interface TaskCardProps {
  task: Task;
  prioritizedTask?: PrioritizedTask;
  rank?: number;
  onToggleStatus: (id: string) => void;
  onEdit?: (task: Task) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  isArchiveView?: boolean;
}

export function TaskCard({
  task,
  prioritizedTask,
  rank,
  onToggleStatus,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  isArchiveView = false,
}: TaskCardProps) {
  const isDone = task.status === 'completed';
  const overdue = !isDone && isTaskOverdue(task.dueDate, task.dueTime);
  const dueDisplay = formatDueDisplay(task.dueDate, task.dueTime);

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'Alta':
        return styles.priorityHigh;
      case 'Média':
        return styles.priorityMedium;
      case 'Baixa':
        return styles.priorityLow;
    }
  };

  const getPriorityTextStyle = () => {
    switch (task.priority) {
      case 'Alta':
        return styles.priorityHighText;
      case 'Média':
        return styles.priorityMediumText;
      case 'Baixa':
        return styles.priorityLowText;
    }
  };

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <View style={styles.mainRow}>
        {!isArchiveView && (
          <Pressable
            style={[styles.checkbox, isDone && styles.checkboxDone]}
            onPress={() => onToggleStatus(task.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            accessibilityLabel={`Marcar ${task.title} como ${isDone ? 'pendente' : 'concluída'}`}
          >
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
        )}

        <View style={styles.contentWrap}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
              {task.title}
            </Text>
          </View>

          {task.description ? (
            <Text style={[styles.description, isDone && styles.textMuted]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          {/* Metadata Chips */}
          <View style={styles.metaChips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{task.category}</Text>
            </View>

            <View style={[styles.chip, getPriorityStyle()]}>
              <Text style={[styles.chipText, getPriorityTextStyle()]}>{task.priority}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipText}>⏱ {task.estimatedMinutes} min</Text>
            </View>

            <View style={[styles.chip, overdue && styles.chipOverdue]}>
              <Text style={[styles.chipText, overdue && styles.chipOverdueText]}>
                {overdue ? '⚠ ' : '📅 '}
                {dueDisplay}
              </Text>
            </View>
          </View>

          {/* Prioritization suggestion badge */}
          {prioritizedTask && !isDone && !isArchiveView && (
            <PriorityScoreBadge prioritizedTask={prioritizedTask} rank={rank} />
          )}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.actionFooter}>
        {isArchiveView ? (
          <View style={styles.archiveActions}>
            {onRestore && (
              <Pressable
                style={styles.actionButton}
                onPress={() => onRestore(task.id)}
                accessibilityRole="button"
                accessibilityLabel="Restaurar ritual"
              >
                <Text style={styles.actionText}>↺ Restaurar</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(task.id)}
                accessibilityRole="button"
                accessibilityLabel="Excluir ritual definitivamente"
              >
                <Text style={styles.deleteText}>✕ Excluir</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.normalActions}>
            {onEdit && (
              <Pressable
                style={styles.actionButton}
                onPress={() => onEdit(task)}
                accessibilityRole="button"
                accessibilityLabel="Editar ritual"
              >
                <Text style={styles.actionText}>✎ Editar</Text>
              </Pressable>
            )}
            {onArchive && (
              <Pressable
                style={styles.actionButton}
                onPress={() => onArchive(task.id)}
                accessibilityRole="button"
                accessibilityLabel="Arquivar ritual"
              >
                <Text style={styles.actionText}>☷ Arquivar</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardDone: {
    opacity: 0.72,
    backgroundColor: '#f3ede1',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#ffffff',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  checkboxDone: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  checkmark: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    flex: 1,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  description: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    opacity: 0.85,
  },
  textMuted: {
    color: colors.muted,
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#ede6d8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    color: colors.ink,
    fontWeight: '600',
  },
  chipOverdue: {
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: '#f2c6c6',
  },
  chipOverdueText: {
    color: colors.crimson,
    fontWeight: '700',
  },
  priorityHigh: {
    backgroundColor: '#fcebe6',
    borderWidth: 1,
    borderColor: '#f3c5b8',
  },
  priorityHighText: {
    color: '#a13b28',
    fontWeight: '800',
  },
  priorityMedium: {
    backgroundColor: '#fcf2dd',
    borderWidth: 1,
    borderColor: '#e8d4a7',
  },
  priorityMediumText: {
    color: '#936a19',
    fontWeight: '700',
  },
  priorityLow: {
    backgroundColor: '#eaf2ea',
    borderWidth: 1,
    borderColor: '#c6dcc5',
  },
  priorityLowText: {
    color: colors.sageDark,
    fontWeight: '700',
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 10,
    paddingTop: 8,
  },
  normalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  archiveActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  actionText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  deleteButton: {},
  deleteText: {
    fontSize: 11,
    color: colors.crimson,
    fontWeight: '600',
  },
});

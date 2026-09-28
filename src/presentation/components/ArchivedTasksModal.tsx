import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Task } from '../../domain/entities/task';
import { colors } from '../theme/colors';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';

interface ArchivedTasksModalProps {
  visible: boolean;
  archivedTasks: Task[];
  onClose: () => void;
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ArchivedTasksModal({
  visible,
  archivedTasks,
  onClose,
  onRestore,
  onDelete,
}: ArchivedTasksModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>MEMÓRIA DOS RITUAIS</Text>
              <Text style={styles.sheetTitle}>
                Arquivo Sagrado ({archivedTasks.length})
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closePressable}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.sheetSubtitle}>
            Tarefas arquivadas ficam guardadas fora da sua visão diária.
            Você pode restaurar qualquer tarefa para trazê-la de volta à atividade.
          </Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {archivedTasks.length === 0 ? (
              <EmptyState type="no-archived" />
            ) : (
              archivedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={() => {}}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  isArchiveView={true}
                />
              ))
            )}
          </ScrollView>

          <View style={styles.sheetFooter}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Voltar ao Grimório</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.gold,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sheetEyebrow: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  sheetTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  closePressable: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  closeIcon: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 460,
  },
  sheetFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: colors.plum,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  closeButtonText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 13,
  },
});

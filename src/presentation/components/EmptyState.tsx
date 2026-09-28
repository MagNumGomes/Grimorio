import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  type: 'no-tasks' | 'filtered-empty' | 'no-completed' | 'no-archived';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  let glyph = '◌';
  let title = 'Nenhum ritual encontrado';
  let message = 'Tente ajustar os critérios de busca.';
  let actionLabel: string | null = null;

  switch (type) {
    case 'no-tasks':
      glyph = '✧';
      title = 'O grimório está em branco';
      message = 'Inscreva seu primeiro ritual para iniciar o dia com propósito e foco.';
      actionLabel = '+ Inscrever Primeiro Ritual';
      break;
    case 'filtered-empty':
      glyph = '⌕';
      title = 'Nenhum ritual corresponde aos filtros';
      message = 'Nenhuma tarefa atende à combinação atual de status, prioridade ou categoria.';
      actionLabel = 'Limpar Filtros';
      break;
    case 'no-completed':
      glyph = '☾';
      title = 'Nenhum ritual concluído ainda';
      message = 'Marque suas tarefas como concluídas à medida que as executar para acumular progresso.';
      break;
    case 'no-archived':
      glyph = '☷';
      title = 'O arquivo sagrado está vazio';
      message = 'Tarefas arquivadas são guardadas aqui para manter seu grimório ativo desobstruído.';
      break;
  }

  return (
    <View style={styles.container}>
      <View style={styles.glyphWrap}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          style={styles.actionButton}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 250, 241, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 20,
  },
  glyphWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ebd9b9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  glyph: {
    color: colors.goldDark,
    fontSize: 26,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: colors.plum,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  actionButtonText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 12,
  },
});

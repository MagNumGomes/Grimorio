import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { PrioritizedTask } from '../../domain/services/prioritization';
import { colors } from '../theme/colors';

interface PriorityScoreBadgeProps {
  prioritizedTask: PrioritizedTask;
  rank?: number;
}

export function PriorityScoreBadge({ prioritizedTask, rank }: PriorityScoreBadgeProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { score, factors, summaryReason, task } = prioritizedTask;

  return (
    <>
      <Pressable
        style={styles.container}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Sugestão Grimório: ${score} pontos. Toque para ver detalhes dos fatores.`}
      >
        <View style={styles.badge}>
          <Text style={styles.star}>✦</Text>
          {rank !== undefined && <Text style={styles.rank}>#{rank}</Text>}
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>
        <Text style={styles.summary} numberOfLines={1}>
          {summaryReason}
        </Text>
        <Text style={styles.infoIcon}>ⓘ</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Text style={styles.modalIcon}>✦</Text>
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Sugestão do Grimório</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>{task.title}</Text>
              </View>
            </View>

            <View style={styles.scoreHighlight}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreOutOf}>/ 100 pontos</Text>
            </View>

            <Text style={styles.factorsHeading}>Fatores determinísticos calculados:</Text>

            <View style={styles.factorsList}>
              {factors.map((factor) => (
                <View key={factor.key} style={styles.factorRow}>
                  <View style={styles.factorHeader}>
                    <Text style={styles.factorName}>{factor.title}</Text>
                    <Text style={styles.factorPoints}>
                      +{factor.points} <Text style={styles.factorMax}>/ {factor.maxPoints}</Text>
                    </Text>
                  </View>
                  <Text style={styles.factorExplanation}>{factor.explanation}</Text>
                </View>
              ))}
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ◈ Esta pontuação é uma sugestão calculada a partir de prazo, prioridade e esforço estimado.
                A priorização é um auxílio determinístico; a decisão do que realizar cabe a você.
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Compreendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbf5ea',
    borderWidth: 1,
    borderColor: '#e8dbbe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.plum,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  star: {
    color: colors.goldLight,
    fontSize: 10,
    marginRight: 3,
  },
  rank: {
    color: colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  summary: {
    flex: 1,
    fontSize: 11,
    color: colors.ink,
    fontStyle: 'italic',
  },
  infoIcon: {
    color: colors.goldDark,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.plum,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIcon: {
    color: colors.goldLight,
    fontSize: 18,
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  scoreHighlight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.lineHighlight,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.gold,
    marginRight: 6,
  },
  scoreOutOf: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
  },
  factorsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  factorsList: {
    gap: 8,
    marginBottom: 16,
  },
  factorRow: {
    backgroundColor: colors.cardPaper,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  factorPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.goldDark,
  },
  factorMax: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '500',
  },
  factorExplanation: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  disclaimerBox: {
    backgroundColor: '#faf6ee',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    padding: 10,
    borderRadius: 4,
    marginBottom: 18,
  },
  disclaimerText: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 14,
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

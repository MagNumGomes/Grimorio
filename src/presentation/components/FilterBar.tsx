import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform } from 'react-native';
import { TaskSortOrder, Project } from '../../domain/entities/task';
import { VALID_PRIORITIES, VALID_CATEGORIES } from '../../domain/services/taskValidation';
import { colors } from '../theme/colors';

export type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done';

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  projectFilter: string;
  onProjectChange: (projectId: string) => void;
  projects?: Project[];
  sortOrder: TaskSortOrder;
  onSortChange: (sort: TaskSortOrder) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalResultsCount: number;
}

export function FilterBar({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  projectFilter,
  onProjectChange,
  projects = [],
  sortOrder,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  totalResultsCount,
}: FilterBarProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'A Fazer', value: 'todo' },
    { label: 'Em Andamento', value: 'in_progress' },
    { label: 'Concluídas', value: 'done' },
  ];

  const sortOptions: { label: string; value: TaskSortOrder }[] = [
    { label: '✦ Sugestão Arcana', value: 'suggested' },
    { label: 'Prazo', value: 'dueDate' },
    { label: 'Prioridade', value: 'priority' },
    { label: 'Esforço', value: 'effort' },
  ];

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (projectFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const selectedProject = projects.find((p) => p.id === projectFilter);

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onStatusChange(opt.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filterActionsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <Pressable
            style={[styles.chipButton, sortOrder === 'suggested' && styles.chipHighlighted]}
            onPress={() => {
              const currentIndex = sortOptions.findIndex((s) => s.value === sortOrder);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              onSortChange(sortOptions[nextIndex].value);
            }}
          >
            <Text
              style={[
                styles.chipButtonText,
                sortOrder === 'suggested' && styles.chipHighlightedText,
              ]}
            >
              {sortOptions.find((s) => s.value === sortOrder)?.label} ▾
            </Text>
          </Pressable>

          <Pressable
            style={[styles.chipButton, hasActiveFilters && styles.chipActive]}
            onPress={() => setFilterModalOpen(true)}
          >
            <Text style={[styles.chipButtonText, hasActiveFilters && styles.chipActiveText]}>
              ◈ Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Text>
          </Pressable>

          {/* Active project tag */}
          {projectFilter !== 'all' && selectedProject && (
            <Pressable
              style={[styles.chipButton, styles.activeFilterTag]}
              onPress={() => onProjectChange('all')}
            >
              <Text style={styles.activeFilterTagText}>
                {selectedProject.icon} {selectedProject.name} ✕
              </Text>
            </Pressable>
          )}

          {categoryFilter !== 'all' && (
            <Pressable
              style={[styles.chipButton, styles.activeFilterTag]}
              onPress={() => onCategoryChange('all')}
            >
              <Text style={styles.activeFilterTagText}>{categoryFilter} ✕</Text>
            </Pressable>
          )}

          {priorityFilter !== 'all' && (
            <Pressable
              style={[styles.chipButton, styles.activeFilterTag]}
              onPress={() => onPriorityChange('all')}
            >
              <Text style={styles.activeFilterTagText}>{priorityFilter} ✕</Text>
            </Pressable>
          )}

          {hasActiveFilters && (
            <Pressable style={styles.clearButton} onPress={onClearFilters}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros e Visualização</Text>
              <Pressable onPress={() => setFilterModalOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            {/* Project Filter */}
            {projects.length > 0 && (
              <>
                <Text style={styles.filterSectionTitle}>Projeto / Meta</Text>
                <View style={styles.filterOptionsGrid}>
                  <Pressable
                    style={[
                      styles.filterGridItem,
                      projectFilter === 'all' && styles.filterGridItemActive,
                    ]}
                    onPress={() => onProjectChange('all')}
                  >
                    <Text
                      style={[
                        styles.filterGridItemText,
                        projectFilter === 'all' && styles.filterGridItemTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </Pressable>
                  {projects.map((proj) => (
                    <Pressable
                      key={proj.id}
                      style={[
                        styles.filterGridItem,
                        projectFilter === proj.id && styles.filterGridItemActive,
                      ]}
                      onPress={() => onProjectChange(proj.id)}
                    >
                      <Text
                        style={[
                          styles.filterGridItemText,
                          projectFilter === proj.id && styles.filterGridItemTextActive,
                        ]}
                      >
                        {proj.icon} {proj.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Priority Filter */}
            <Text style={styles.filterSectionTitle}>Prioridade</Text>
            <View style={styles.filterOptionsGrid}>
              <Pressable
                style={[
                  styles.filterGridItem,
                  priorityFilter === 'all' && styles.filterGridItemActive,
                ]}
                onPress={() => onPriorityChange('all')}
              >
                <Text
                  style={[
                    styles.filterGridItemText,
                    priorityFilter === 'all' && styles.filterGridItemTextActive,
                  ]}
                >
                  Todas
                </Text>
              </Pressable>
              {VALID_PRIORITIES.map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.filterGridItem,
                    priorityFilter === p && styles.filterGridItemActive,
                  ]}
                  onPress={() => onPriorityChange(p)}
                >
                  <Text
                    style={[
                      styles.filterGridItemText,
                      priorityFilter === p && styles.filterGridItemTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Category Filter */}
            <Text style={styles.filterSectionTitle}>Categoria</Text>
            <View style={styles.filterOptionsGrid}>
              <Pressable
                style={[
                  styles.filterGridItem,
                  categoryFilter === 'all' && styles.filterGridItemActive,
                ]}
                onPress={() => onCategoryChange('all')}
              >
                <Text
                  style={[
                    styles.filterGridItemText,
                    categoryFilter === 'all' && styles.filterGridItemTextActive,
                  ]}
                >
                  Todas
                </Text>
              </Pressable>
              {VALID_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.filterGridItem,
                    categoryFilter === c && styles.filterGridItemActive,
                  ]}
                  onPress={() => onCategoryChange(c)}
                >
                  <Text
                    style={[
                      styles.filterGridItemText,
                      categoryFilter === c && styles.filterGridItemTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sort Order */}
            <Text style={styles.filterSectionTitle}>Critério de Ordenação</Text>
            <View style={styles.filterOptionsGrid}>
              {sortOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.filterGridItem,
                    sortOrder === opt.value && styles.filterGridItemActive,
                  ]}
                  onPress={() => onSortChange(opt.value)}
                >
                  <Text
                    style={[
                      styles.filterGridItemText,
                      sortOrder === opt.value && styles.filterGridItemTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalFooter}>
              {hasActiveFilters && (
                <Pressable
                  style={styles.modalResetBtn}
                  onPress={() => {
                    onClearFilters();
                    setFilterModalOpen(false);
                  }}
                >
                  <Text style={styles.modalResetText}>Limpar tudo</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.modalApplyBtn}
                onPress={() => setFilterModalOpen(false)}
              >
                <Text style={styles.modalApplyText}>Aplicar Filtros</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 9,
    marginRight: 18,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.plum,
  },
  tabText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.plum,
    fontWeight: '800',
  },
  filterActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chipButton: {
    backgroundColor: '#eee6d8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dfd4c1',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  chipButtonText: {
    fontSize: 11,
    color: colors.ink,
    fontWeight: '700',
  },
  chipHighlighted: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  chipHighlightedText: {
    color: colors.goldLight,
  },
  chipActive: {
    backgroundColor: colors.goldBg,
    borderColor: colors.gold,
  },
  chipActiveText: {
    color: colors.goldDark,
    fontWeight: '800',
  },
  activeFilterTag: {
    backgroundColor: colors.cardPaper,
    borderColor: colors.plum,
  },
  activeFilterTagText: {
    color: colors.plum,
    fontSize: 11,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  clearButtonText: {
    fontSize: 11,
    color: colors.crimson,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 20,
    width: '100%',
    maxWidth: 440,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  modalClose: {
    fontSize: 16,
    color: colors.ink,
    padding: 4,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  filterGridItem: {
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  filterGridItemActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  filterGridItemText: {
    fontSize: 11,
    color: colors.ink,
    fontWeight: '600',
  },
  filterGridItemTextActive: {
    color: colors.goldLight,
    fontWeight: '800',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 12,
  },
  modalResetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  modalResetText: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '700',
  },
  modalApplyBtn: {
    backgroundColor: colors.plum,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  modalApplyText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: '800',
  },
});
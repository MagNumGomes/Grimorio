import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Task,
  TaskPriority,
  TaskCategory,
  CreateTaskDTO,
  UpdateTaskDTO,
  Project,
  SubtaskInput,
} from '../../domain/entities/task';
import {
  VALID_PRIORITIES,
  VALID_CATEGORIES,
  validateCreateTaskInput,
  validateUpdateTaskInput,
} from '../../domain/services/taskValidation';
import {
  getTodayDateString,
  formatToDateString,
} from '../../shared/utils/dateUtils';
import { colors } from '../theme/colors';

interface TaskFormModalProps {
  projects?: Project[];
  initialProjectId?: string;
  visible: boolean;
  taskToEdit?: Task | null;
  onClose: () => void;
  onSubmit: (dto: CreateTaskDTO | UpdateTaskDTO) => Promise<void>;
}

const EFFORT_PRESETS = [15, 30, 45, 60, 90, 120];

export function TaskFormModal({
  projects = [],
  initialProjectId,
  visible,
  taskToEdit,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Média');
  const [category, setCategory] = useState<TaskCategory>('Estudos');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [customEffort, setCustomEffort] = useState('');
  const [isCustomEffort, setIsCustomEffort] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProjectId(taskToEdit?.projectId ?? initialProjectId ?? null);
    setSubtasks(taskToEdit?.subtasks.map(s => ({ ...s })) ?? []);
    setSubtaskTitle('');
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setEstimatedMinutes(taskToEdit.estimatedMinutes);
      if (EFFORT_PRESETS.includes(taskToEdit.estimatedMinutes)) {
        setIsCustomEffort(false);
        setCustomEffort('');
      } else {
        setIsCustomEffort(true);
        setCustomEffort(String(taskToEdit.estimatedMinutes));
      }
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setDueTime('18:00');
      setPriority('Média');
      setCategory('Estudos');
      setEstimatedMinutes(30);
      setIsCustomEffort(false);
      setCustomEffort('');
    }
    setErrors({});
    setGeneralError(null);
  }, [taskToEdit, visible, initialProjectId]);

  const setQuickDate = (daysAhead: number | null) => {
    if (daysAhead === null) {
      setDueDate('');
      setDueTime('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(formatToDateString(d));
    if (errors.dueDate) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.dueDate;
        return next;
      });
    }
  };

  const handleEffortSelect = (minutes: number) => {
    setIsCustomEffort(false);
    setEstimatedMinutes(minutes);
    setCustomEffort('');
    if (errors.estimatedMinutes) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.estimatedMinutes;
        return next;
      });
    }
  };

  const handleCustomEffortChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomEffort(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setEstimatedMinutes(parsed);
      if (errors.estimatedMinutes) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.estimatedMinutes;
          return next;
        });
      }
    }
  };

  const handleSubmit = async () => {
    setGeneralError(null);

    const minutes = isCustomEffort ? parseInt(customEffort, 10) : estimatedMinutes;

    const payload: CreateTaskDTO | UpdateTaskDTO = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.trim(),
      dueTime: dueTime.trim(),
      projectId: projectId ?? (isEditing ? null : undefined),
      subtasks: subtaskTitle.trim() ? [...subtasks, { title: subtaskTitle.trim(), completed: false }] : subtasks,
      priority,
      category,
      estimatedMinutes: minutes,
    };

    const validation = isEditing
      ? validateUpdateTaskInput(payload)
      : validateCreateTaskInput(payload as CreateTaskDTO);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError('Por favor, corrija os campos indicados antes de salvar.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar o ritual.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>
                  {isEditing ? 'REVISÃO DO GRIMÓRIO' : 'NOVA INSCRIÇÃO ARCANA'}
                </Text>
                <Text style={styles.sheetTitle}>
                  {isEditing ? 'Editar Ritual' : 'Inscrever Novo Ritual'}
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.closePressable}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {generalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            ) : null}

            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Título do Ritual <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    if (errors.title) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.title;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Ex.: Decifrar pergaminho de alquimia"
                  placeholderTextColor={colors.muted}
                  maxLength={120}
                />
                {errors.title ? (
                  <Text style={styles.fieldErrorText}>{errors.title}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Descrição ou Anotações (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalhes adicionais, requisitos ou materiais necessários..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                {errors.description ? (
                  <Text style={styles.fieldErrorText}>{errors.description}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Nível de Prioridade <Text style={styles.requiredMark}>*</Text>
                </Text>
                <View style={styles.priorityRow}>
                  {VALID_PRIORITIES.map((p) => {
                    const isSelected = priority === p;
                    return (
                      <Pressable
                        key={p}
                        style={[
                          styles.priorityPill,
                          isSelected && styles.priorityPillActive,
                          isSelected && p === 'Alta' && styles.priorityAlta,
                          isSelected && p === 'Média' && styles.priorityMedia,
                          isSelected && p === 'Baixa' && styles.priorityBaixa,
                        ]}
                        onPress={() => setPriority(p)}
                      >
                        <Text
                          style={[
                            styles.priorityPillText,
                            isSelected && styles.priorityPillTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.priority ? (
                  <Text style={styles.fieldErrorText}>{errors.priority}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Círculo / Categoria <Text style={styles.requiredMark}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {VALID_CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        style={[
                          styles.categoryPill,
                          isSelected && styles.categoryPillActive,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            isSelected && styles.categoryPillTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Prazo e Horário</Text>

                <View style={styles.quickDateRow}>
                  <Pressable
                    style={[
                      styles.quickDateChip,
                      dueDate === getTodayDateString() && styles.quickDateChipActive,
                    ]}
                    onPress={() => setQuickDate(0)}
                  >
                    <Text
                      style={[
                        styles.quickDateChipText,
                        dueDate === getTodayDateString() && styles.quickDateChipTextActive,
                      ]}
                    >
                      Hoje
                    </Text>
                  </Pressable>
                  <Pressable style={styles.quickDateChip} onPress={() => setQuickDate(1)}>
                    <Text style={styles.quickDateChipText}>Amanhã</Text>
                  </Pressable>
                  <Pressable style={styles.quickDateChip} onPress={() => setQuickDate(3)}>
                    <Text style={styles.quickDateChipText}>+3 dias</Text>
                  </Pressable>
                  <Pressable style={styles.quickDateChip} onPress={() => setQuickDate(7)}>
                    <Text style={styles.quickDateChipText}>+1 sem</Text>
                  </Pressable>
                  <Pressable style={styles.quickDateChip} onPress={() => setQuickDate(null)}>
                    <Text style={styles.quickDateChipText}>Sem data</Text>
                  </Pressable>
                </View>

                <View style={styles.dateTimeRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.subLabel}>Data (AAAA-MM-DD)</Text>
                    <TextInput
                      style={[styles.input, errors.dueDate && styles.inputError]}
                      value={dueDate}
                      onChangeText={(val) => {
                        setDueDate(val);
                        if (errors.dueDate) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.dueDate;
                            return copy;
                          });
                        }
                      }}
                      placeholder="2026-09-30"
                      placeholderTextColor={colors.muted}
                      maxLength={10}
                    />
                    {errors.dueDate ? (
                      <Text style={styles.fieldErrorText}>{errors.dueDate}</Text>
                    ) : null}
                  </View>

                  <View style={styles.timeCol}>
                    <Text style={styles.subLabel}>Horário (HH:MM)</Text>
                    <TextInput
                      style={[styles.input, errors.dueTime && styles.inputError]}
                      value={dueTime}
                      onChangeText={(val) => {
                        setDueTime(val);
                        if (errors.dueTime) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.dueTime;
                            return copy;
                          });
                        }
                      }}
                      placeholder="18:00"
                      placeholderTextColor={colors.muted}
                      maxLength={5}
                    />
                    {errors.dueTime ? (
                      <Text style={styles.fieldErrorText}>{errors.dueTime}</Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Projeto</Text>
                <View style={styles.effortRow}>
                  {[{ id: '', name: 'Sem projeto' }, ...projects].map(project => (
                    <Pressable key={project.id} accessibilityRole="button" onPress={() => setProjectId(project.id || null)} style={[styles.effortPill, (projectId ?? '') === project.id && styles.effortPillActive]}>
                      <Text style={[styles.effortPillText, (projectId ?? '') === project.id && styles.effortPillTextActive]}>{project.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Checklist</Text>
                {subtasks.map((subtask, index) => (
                  <View key={subtask.id ?? `new-${index}`} style={styles.dateTimeRow}>
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!subtask.completed }} accessibilityLabel={`Concluir ${subtask.title}`} onPress={() => setSubtasks(items => items.map((s, i) => i === index ? { ...s, completed: !s.completed } : s))}><Text style={styles.label}>{subtask.completed ? '✓' : '○'}</Text></Pressable>
                    <TextInput accessibilityLabel={`Título da subtarefa ${index + 1}`} style={[styles.input, { flex: 1 }]} maxLength={120} value={subtask.title} onChangeText={value => setSubtasks(items => items.map((s, i) => i === index ? { ...s, title: value } : s))} />
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${subtask.title}`} onPress={() => setSubtasks(items => items.filter((_, i) => i !== index))}><Text style={styles.label}>×</Text></Pressable>
                  </View>
                ))}
                <TextInput accessibilityLabel="Nova subtarefa" placeholder="Nova subtarefa" placeholderTextColor={colors.muted} value={subtaskTitle} maxLength={120} style={styles.input} onChangeText={setSubtaskTitle} />
                <Pressable accessibilityRole="button" disabled={!subtaskTitle.trim()} onPress={() => { setSubtasks(items => [...items, { title: subtaskTitle.trim(), completed: false }]); setSubtaskTitle(''); }}><Text style={styles.label}>+ Adicionar subtarefa</Text></Pressable>
                {errors.subtasks && <Text style={styles.fieldErrorText}>{errors.subtasks}</Text>}
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Esforço Estimado (minutos) <Text style={styles.requiredMark}>*</Text>
                </Text>
                <View style={styles.effortRow}>
                  {EFFORT_PRESETS.map((mins) => {
                    const isSelected = !isCustomEffort && estimatedMinutes === mins;
                    return (
                      <Pressable
                        key={mins}
                        style={[
                          styles.effortPill,
                          isSelected && styles.effortPillActive,
                        ]}
                        onPress={() => handleEffortSelect(mins)}
                      >
                        <Text
                          style={[
                            styles.effortPillText,
                            isSelected && styles.effortPillTextActive,
                          ]}
                        >
                          {mins}m
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    style={[styles.effortPill, isCustomEffort && styles.effortPillActive]}
                    onPress={() => setIsCustomEffort(true)}
                  >
                    <Text
                      style={[
                        styles.effortPillText,
                        isCustomEffort && styles.effortPillTextActive,
                      ]}
                    >
                      Outro
                    </Text>
                  </Pressable>
                </View>

                {isCustomEffort && (
                  <View style={styles.customEffortWrap}>
                    <TextInput
                      style={[styles.input, errors.estimatedMinutes && styles.inputError]}
                      value={customEffort}
                      onChangeText={handleCustomEffortChange}
                      placeholder="Ex.: 45"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Text style={styles.customEffortSuffix}>minutos</Text>
                  </View>
                )}
                {errors.estimatedMinutes ? (
                  <Text style={styles.fieldErrorText}>{errors.estimatedMinutes}</Text>
                ) : null}
              </View>
            </ScrollView>

            <View style={styles.sheetActions}>
              <Pressable
                onPress={onClose}
                style={styles.cancelBtn}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting
                    ? 'Consagrando...'
                    : isEditing
                    ? 'Salvar Alterações ✦'
                    : 'Consagrar Ritual ✦'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
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
    maxHeight: '90%',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.gold,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
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
  errorBanner: {
    backgroundColor: colors.crimsonLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.crimson,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorBannerText: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '600',
  },
  formScroll: {
    maxHeight: 460,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 4,
    fontWeight: '600',
  },
  requiredMark: {
    color: colors.crimson,
  },
  input: {
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.crimson,
    backgroundColor: '#fff4f4',
  },
  fieldErrorText: {
    color: colors.crimson,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardPaper,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  priorityPillActive: {
    borderColor: colors.plum,
    borderWidth: 1.5,
  },
  priorityAlta: {
    backgroundColor: '#faebe6',
    borderColor: '#a13b28',
  },
  priorityMedia: {
    backgroundColor: '#fbf3de',
    borderColor: '#936a19',
  },
  priorityBaixa: {
    backgroundColor: '#ebf4eb',
    borderColor: colors.sageDark,
  },
  priorityPillText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
  },
  priorityPillTextActive: {
    color: colors.ink,
    fontWeight: '900',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardPaper,
    marginRight: 8,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  categoryPillActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  categoryPillText: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.goldLight,
    fontWeight: '800',
  },
  quickDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  quickDateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ede6d8',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  quickDateChipActive: {
    backgroundColor: colors.gold,
  },
  quickDateChipText: {
    fontSize: 11,
    color: colors.ink,
    fontWeight: '600',
  },
  quickDateChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 3,
  },
  timeCol: {
    flex: 2,
  },
  effortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effortPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardPaper,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  effortPillActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  effortPillText: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  effortPillTextActive: {
    color: colors.goldLight,
    fontWeight: '800',
  },
  customEffortWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  customEffortSuffix: {
    fontSize: 12,
    color: colors.muted,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  cancelBtnText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.plum,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 13,
  },
});

import React, { useState } from 'react';
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
import type { CreateProjectDTO } from '../../domain/entities/task';
import { validateCreateProjectInput } from '../../domain/services/taskValidation';
import { colors } from '../theme/colors';

interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProjectDTO) => Promise<void>;
}

const COLOR_PRESETS = [
  { name: 'Ouro Arcano', value: colors.gold },
  { name: 'Ameixa Profunda', value: colors.plum },
  { name: 'Sálvia Mística', value: colors.sage },
  { name: 'Carmesim', value: colors.crimson },
  { name: 'Ouro Envelhecido', value: colors.goldDark },
  { name: 'Tinta Suave', value: colors.muted },
];

const ICON_PRESETS = ['◈', '✦', '☷', '◉', '☾', '★', '⚑', '✧'];

export function ProjectModal({ visible, onClose, onSubmit }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICON_PRESETS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setFolder('');
    setSelectedColor(COLOR_PRESETS[0].value);
    setSelectedIcon(ICON_PRESETS[0]);
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const dto: CreateProjectDTO = {
      name: name.trim(),
      folder: folder.trim() || undefined,
      description: description.trim() ? description.trim() : undefined,
      color: selectedColor,
      icon: selectedIcon,
    };

    const validation = validateCreateProjectInput(dto);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      await onSubmit(dto);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar o projeto.';
      setErrors({ form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>ORGANIZAÇÃO POR OBJETIVOS</Text>
              <Text style={styles.sheetTitle}>Novo Projeto</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closePressable}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {errors.form && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errors.form}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Nome do Projeto <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.name;
                      return copy;
                    });
                  }
                }}
                placeholder="Ex: Trabalho, Estudos, Vida Pessoal..."
                placeholderTextColor={colors.muted}
                maxLength={60}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva o objetivo deste projeto..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Pasta (opcional)</Text>
              <TextInput accessibilityLabel="Pasta do projeto" value={folder} onChangeText={setFolder} maxLength={60} style={styles.input} placeholder="Ex.: Pessoal ou Trabalho" placeholderTextColor={colors.muted} />
              {errors.folder && <Text style={styles.errorText}>{errors.folder}</Text>}
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ícone Simbólico</Text>
              <View style={styles.iconGrid}>
                {ICON_PRESETS.map((icon) => (
                  <Pressable
                    key={icon}
                    accessibilityRole="button"
                    accessibilityLabel={`Ícone ${icon}`}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionActive,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text
                      style={[
                        styles.iconOptionText,
                        selectedIcon === icon && styles.iconOptionTextActive,
                      ]}
                    >
                      {icon}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cor de Identificação</Text>
              <View style={styles.colorGrid}>
                {COLOR_PRESETS.map((col) => (
                  <Pressable
                    key={col.value}
                    accessibilityRole="button"
                    accessibilityLabel={col.name}
                    style={[
                      styles.colorOption,
                      { backgroundColor: col.value },
                      selectedColor === col.value && styles.colorOptionActive,
                    ]}
                    onPress={() => setSelectedColor(col.value)}
                  >
                    {selectedColor === col.value && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Criando...' : '✦ Criar Projeto'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  scrollArea: {
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
  required: {
    color: colors.crimson,
  },
  input: {
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.crimson,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 11,
    color: colors.crimson,
    marginTop: 4,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#faebeb',
    borderWidth: 1,
    borderColor: colors.crimson,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBoxText: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '700',
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  iconOption: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.cardPaper,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  iconOptionActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  iconOptionText: {
    fontSize: 16,
    color: colors.ink,
  },
  iconOptionTextActive: {
    color: colors.goldLight,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  colorOptionActive: {
    borderColor: colors.ink,
  },
  colorCheckmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  cancelBtnText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.plum,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' as const } }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: '800',
  },
});

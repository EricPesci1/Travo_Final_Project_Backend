import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';

type DropdownSelectorProps = {
  label: string;
  value?: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string) => void;
};

export function DropdownSelector({
  label,
  value,
  options,
  placeholder = 'Select an option',
  onSelect,
}: DropdownSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selector} onPress={() => setOpen(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textPrimary} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}>
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    color: colors.textPrimary,
    marginBottom: 6,
    fontWeight: '600',
  },
  selector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    color: colors.textPrimary,
  },
  placeholderText: {
    color: '#6f7f9d',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '60%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    color: colors.textPrimary,
  },
});

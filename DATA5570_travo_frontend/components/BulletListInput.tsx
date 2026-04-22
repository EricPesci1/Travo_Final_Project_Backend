import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';

type BulletListInputProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
};

export function BulletListInput({ label, items, onChange }: BulletListInputProps) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft('');
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          placeholder={`Add a ${label.toLowerCase()} item`}
          placeholderTextColor="#6f7f9d"
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
        />
        <Pressable style={styles.addButton} onPress={addItem}>
          <Ionicons name="add" size={20} color={colors.white} />
        </Pressable>
      </View>

      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.listItem}>
          <Text style={styles.itemText}>• {item}</Text>
          <Pressable onPress={() => removeItem(index)}>
            <Ionicons name="close-circle" size={18} color={colors.accentClay} />
          </Pressable>
        </View>
      ))}
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
  },
  addButton: {
    width: 42,
    borderRadius: 10,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemText: {
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
});

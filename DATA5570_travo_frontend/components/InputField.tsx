import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '@/constants/theme';

type InputFieldProps = TextInputProps & {
  label: string;
};

export function InputField({ label, style, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#6f7f9d"
        style={[styles.input, style]}
        {...props}
      />
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
  },
});

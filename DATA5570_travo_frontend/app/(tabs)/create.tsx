import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BulletListInput } from '@/components/BulletListInput';
import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { usStateCities, usStates } from '@/data/usLocations';
import { createReview } from '@/services/travoApi';

export default function CreatePostScreen() {
  const [image, setImage] = useState('');
  const [state, setState] = useState<string>();
  const [city, setCity] = useState<string>();
  const [description, setDescription] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cityOptions = useMemo(() => (state ? usStateCities[state] : []), [state]);

  const onSubmit = async () => {
    if (!state || !city) {
      Alert.alert('Missing location', 'Please select a state and city.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing description', 'Please add a description.');
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        username: 'traveler.jules',
        city_name: city,
        state_name: state,
        rating: 5,
        description,
        pros,
        cons,
      });
      Alert.alert('Posted', 'Your post was submitted to the API.');
      setImage('');
      setState(undefined);
      setCity(undefined);
      setDescription('');
      setPros([]);
      setCons([]);
      setPrice('');
    } catch (e) {
      Alert.alert('Submit failed', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InputField
        label="Image Upload (jpg/jpeg URL placeholder)"
        value={image}
        onChangeText={setImage}
        placeholder="https://example.com/trip-image.jpg"
      />
      <DropdownSelector
        label="State"
        value={state}
        options={usStates}
        placeholder="Select state"
        onSelect={(value) => {
          setState(value);
          setCity(undefined);
        }}
      />
      <DropdownSelector
        label="City"
        value={city}
        options={cityOptions}
        placeholder={state ? 'Select city' : 'Select state first'}
        onSelect={setCity}
      />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Share your experience..."
        multiline
        numberOfLines={4}
        style={styles.multiline}
      />
      <BulletListInput label="Pros" items={pros} onChange={setPros} />
      <BulletListInput label="Cons" items={cons} onChange={setCons} />
      <InputField
        label="Price (optional)"
        value={price}
        onChangeText={setPrice}
        placeholder="0"
        keyboardType="numeric"
      />

      <Pressable
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={submitting}>
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting…' : 'Submit Post'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 130,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});

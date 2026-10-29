import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const COUNTRIES = [
  { name: 'Pakistan', iso: 'PK', dial: '92' },
  { name: 'India', iso: 'IN', dial: '91' },
  { name: 'Bangladesh', iso: 'BD', dial: '880' },
  { name: 'Afghanistan', iso: 'AF', dial: '93' },
  { name: 'Sri Lanka', iso: 'LK', dial: '94' },
  { name: 'Nepal', iso: 'NP', dial: '977' },
  { name: 'Saudi Arabia', iso: 'SA', dial: '966' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '971' },
  { name: 'Qatar', iso: 'QA', dial: '974' },
  { name: 'Kuwait', iso: 'KW', dial: '965' },
  { name: 'Oman', iso: 'OM', dial: '968' },
  { name: 'Bahrain', iso: 'BH', dial: '973' },
  { name: 'Turkey', iso: 'TR', dial: '90' },
  { name: 'Iran', iso: 'IR', dial: '98' },
  { name: 'Egypt', iso: 'EG', dial: '20' },
  { name: 'United Kingdom', iso: 'GB', dial: '44' },
  { name: 'United States', iso: 'US', dial: '1' },
  { name: 'Canada', iso: 'CA', dial: '1' },
  { name: 'Australia', iso: 'AU', dial: '61' },
  { name: 'Germany', iso: 'DE', dial: '49' },
  { name: 'France', iso: 'FR', dial: '33' },
  { name: 'Italy', iso: 'IT', dial: '39' },
  { name: 'Spain', iso: 'ES', dial: '34' },
  { name: 'Netherlands', iso: 'NL', dial: '31' },
  { name: 'Sweden', iso: 'SE', dial: '46' },
  { name: 'Russia', iso: 'RU', dial: '7' },
  { name: 'China', iso: 'CN', dial: '86' },
  { name: 'Japan', iso: 'JP', dial: '81' },
  { name: 'Malaysia', iso: 'MY', dial: '60' },
  { name: 'Singapore', iso: 'SG', dial: '65' },
  { name: 'Indonesia', iso: 'ID', dial: '62' },
  { name: 'South Africa', iso: 'ZA', dial: '27' },
  { name: 'Nigeria', iso: 'NG', dial: '234' },
  { name: 'Brazil', iso: 'BR', dial: '55' },
  { name: 'Mexico', iso: 'MX', dial: '52' },
];

export default function CountryPicker({ country, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter((item) => {
      const haystack = `${item.name} ${item.iso} +${item.dial}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function choose(item) {
    onSelect(item);
    close();
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${country.iso} +${country.dial}`}
        onPress={() => setOpen(true)}
        disabled={disabled}
        style={styles.button}
      >
        <Text style={styles.iso}>{country.iso}</Text>
        <Text style={styles.dial}>+{country.dial}</Text>
        <Ionicons name="chevron-down" size={14} color="#94A3B8" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.search}
            />
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
              {rows.map((item) => (
                <Pressable
                  key={item.iso}
                  accessibilityRole="button"
                  onPress={() => choose(item)}
                  style={styles.row}
                >
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.iso}</Text>
                  <Text style={styles.meta}>+{item.dial}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 8,
    height: '100%',
  },
  iso: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 28, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: '#182447',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2B3B68',
    padding: 12,
  },
  search: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B3B68',
    backgroundColor: '#1E2B52',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  name: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  meta: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});

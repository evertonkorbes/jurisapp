'use client';

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { TribunalKey, TRIBUNAIS } from '@/constants/api';

interface SearchBarProps {
  onSearch: (query: string, tribunal: TribunalKey) => void;
  loading?: boolean;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, loading = false, placeholder = 'Digite termos para buscar jurisprudência...' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [tribunal, setTribunal] = useState<TribunalKey>('all');
  const [showTribunais, setShowTribunais] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (query.trim().length >= 3) {
      Keyboard.dismiss();
      onSearch(query.trim(), tribunal);
    }
  };

  const tribunalOptions = Object.entries(TRIBUNAIS) as [TribunalKey, { label: string; icon: string }][];

  return (
    <View style={styles.container}>
      {/* Campo de busca */}
      <View style={[styles.searchWrapper, focused && styles.searchFocused]}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          disabled={loading}
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonLoading]}
          onPress={handleSubmit}
          disabled={loading || query.trim().length < 3}
        >
          {loading ? (
            <Animated.View style={styles.spinner} />
          ) : (
            <View style={styles.searchIcon} />
          )}
        </TouchableOpacity>
      </View>

      {/* Seletor de tribunal */}
      <TouchableOpacity
        style={[styles.tribunalButton, showTribunais && styles.tribunalButtonOpen]}
        onPress={() => setShowTribunais(!showTribunais)}
      >
        <View style={styles.tribunalLabel}>
          <Text style={styles.tribunalIcon}>{TRIBUNAIS[tribunal].icon}</Text>
          <Text style={styles.tribunalText}>{TRIBUNAIS[tribunal].label}</Text>
        </View>
        <View style={styles.dropdownArrow} />
      </TouchableOpacity>

      {/* Dropdown de tribunais */}
      {showTribunais && (
        <View style={styles.dropdown}>
          {tribunalOptions.map(([key, info]) => (
            <TouchableOpacity
              key={key}
              style={[styles.dropdownItem, tribunal === key && styles.dropdownItemSelected]}
              onPress={() => {
                setTribunal(key);
                setShowTribunais(false);
              }}
            >
              <Text style={styles.dropdownIcon}>{info.icon}</Text>
              <Text style={[
                styles.dropdownText,
                tribunal === key && styles.dropdownTextSelected
              ]}>
                {info.label}
              </Text>
              {tribunal === key && <View style={styles.checkmark} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {query.trim().length > 0 && query.trim().length < 3 && (
        <Text style={styles.hint}>Digite pelo menos 3 caracteres</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  searchFocused: {
    borderColor: '#1a1a2e',
    borderWidth: 2,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
  },
  searchButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonLoading: {
    backgroundColor: '#f0f0f0',
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  spinner: {
    width: 24,
    height: 24,
  },
  tribunalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tribunalButtonOpen: {
    borderColor: '#1a1a2e',
    borderWidth: 2,
  },
  tribunalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tribunalIcon: {
    fontSize: 20,
  },
  tribunalText: {
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#666',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownIcon: {
    fontSize: 18,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
  },
  dropdownTextSelected: {
    fontWeight: '600',
    color: '#1a1a2e',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#ff6b6b',
    marginLeft: 4,
  },
});
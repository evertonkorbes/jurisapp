'use client';

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useProcessDetail } from '@/hooks/useApi';
import { ProcessDetail } from '@/components/ProcessDetail';
import { router, useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { tribunal, numero } = useLocalSearchParams<{ tribunal: string; numero: string }>();
  const { process, loading, error, fetchDetail, clear } = useProcessDetail();

  const tribunalKey = tribunal as 'datajud' | 'stj' | 'tjrs';

  useEffect(() => {
    if (tribunalKey && numero) {
      fetchDetail(tribunalKey, decodeURIComponent(numero));
    }
    return () => clear();
  }, [tribunalKey, numero, fetchDetail, clear]);

  const handleRetry = useCallback(() => {
    if (tribunalKey && numero) {
      fetchDetail(tribunalKey, decodeURIComponent(numero));
    }
  }, [tribunalKey, numero, fetchDetail]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>Carregando detalhes do processo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Erro ao carregar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorActions}>
          <View style={styles.retryButton} onTouchStart={handleRetry}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </View>
          <View style={styles.backButton} onTouchStart={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!process) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Processo não encontrado</Text>
      </View>
    );
  }

  return <ProcessDetail processo={process} onClose={() => router.back()} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1a1a2e',
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
    gap: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#c41e3a',
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
});
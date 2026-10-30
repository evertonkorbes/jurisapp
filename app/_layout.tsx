import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useHealthCheck } from '@/hooks/useApi';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

export default function RootLayout() {
  const { healthy, checking, check, apiStatus } = useHealthCheck();
  const [mounted, setMounted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setMounted(true);
    check();
  }, [check]);

  if (!mounted || checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a2e" />
        <Text style={styles.loadingText}>Verificando conexão com tribunais brasileiros...</Text>
        <Text style={styles.loadingHint}>Certifique-se que sua VPN Brasil está ligada</Text>
      </View>
    );
  }

  // Se nenhuma API funcionou, mostra aviso mas deixa usar mesmo assim
  const anyWorking = Object.values(apiStatus).some(v => v);
  const allFailed = Object.keys(apiStatus).length > 0 && !anyWorking;

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="detail" options={{ presentation: 'modal' }} />
      </Stack>

      {allFailed && !showWarning && (
        <View style={styles.warningBanner}>
          <View style={styles.warningContent}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>VPN Brasil necessária</Text>
              <Text style={styles.warningText}>
                Nenhum tribunal respondeu. Ligue sua VPN (Brasil) e puxe para atualizar.
              </Text>
            </View>
            <View style={styles.warningButton} onTouchStart={() => setShowWarning(true)}>
              <Text style={styles.warningButtonText}>Entendi</Text>
            </View>
          </View>
        </View>
      )}

      {!anyWorking && showWarning && (
        <View style={styles.detailWarning}>
          <Text style={styles.detailTitle}>Status das APIs:</Text>
          <View style={styles.apiStatusList}>
            {Object.entries(apiStatus).map(([api, ok]) => (
              <View key={api} style={styles.apiStatusItem}>
                <View style={[styles.apiStatusDot, ok ? styles.apiStatusOk : styles.apiStatusFail]} />
                <Text style={styles.apiStatusLabel}>
                  {api === 'datajud' ? 'TJRS (DataJud/CNJ)' : api === 'stj' ? 'STJ' : 'TJRS Direto'}
                </Text>
                <Text style={[styles.apiStatusValue, ok ? styles.apiStatusOkText : styles.apiStatusFailText]}>
                  {ok ? 'Conectado ✓' : 'Falhou ✗'}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.detailHint}>
            Dica: Use "Super Unlimited VPN" → escolha servidor Brasil → reconecte → puxe a tela para baixo para tentar novamente
          </Text>
          <View style={styles.warningButton} onTouchStart={() => check()}>
            <Text style={styles.warningButtonText}>🔄 Tentar novamente</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#1a1a2e',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingHint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  warningBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
    padding: 12,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: { fontSize: 24 },
  warningTextContainer: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#856404' },
  warningText: { fontSize: 12, color: '#856404', marginTop: 2 },
  warningButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#856404',
    borderRadius: 6,
  },
  warningButtonText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  detailWarning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  apiStatusList: { gap: 12, width: '100%' },
  apiStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  apiStatusDot: { width: 10, height: 10, borderRadius: 5 },
  apiStatusOk: { backgroundColor: '#28a745' },
  apiStatusFail: { backgroundColor: '#dc3545' },
  apiStatusLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a2e' },
  apiStatusValue: { fontSize: 13, fontWeight: '600' },
  apiStatusOkText: { color: '#28a745' },
  apiStatusFailText: { color: '#dc3545' },
  detailHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
'use client';

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { useSearch } from '@/hooks/useApi';
import { SearchBar } from '@/components/SearchBar';
import { ProcessCard } from '@/components/ProcessCard';
import { router } from 'expo-router';
import { Processo } from '@/types';

export default function HomeScreen() {
  const {
    results,
    loading,
    error,
    pagination,
    search,
    loadMore,
    clear,
    hasMore,
  } = useSearch();

  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState('');
  const [lastTribunal, setLastTribunal] = React.useState<'all' | 'datajud' | 'stj' | 'tjrs'>('all');

  const handleSearch = useCallback((query: string, tribunal: 'all' | 'datajud' | 'stj' | 'tjrs') => {
    setLastQuery(query);
    setLastTribunal(tribunal);
    search({ query, tribunal, page: 1, size: 20 });
  }, [search]);

  const handleRefresh = useCallback(() => {
    if (lastQuery) {
      setRefreshing(true);
      search({ query: lastQuery, tribunal: lastTribunal, page: 1, size: 20 })
        .finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [lastQuery, lastTribunal, search]);

  const handleLoadMore = useCallback(() => {
    if (lastQuery && hasMore && !loading) {
      loadMore({ query: lastQuery, tribunal: lastTribunal, size: 20 });
    }
  }, [lastQuery, lastTribunal, hasMore, loading, loadMore]);

  const handleCardPress = (processo: Processo) => {
    router.push({
      pathname: '/detail',
      params: {
        tribunal: processo.fonte,
        numero: processo.numeroProcesso,
      },
    });
  };

  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Erro na busca</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    if (!lastQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyTitle}>JurisApp</Text>
          <Text style={styles.emptyText}>
            Busque jurisprudência do TJRS, STJ e outros tribunais brasileiros.\n
            O número do processo aparece completo, sem máscara.
          </Text>
          <View style={styles.tips}>
            <Text style={styles.tip}>💡 Tente: "dano moral", "honorários advocatícios", "prescrição"</Text>
            <Text style={styles.tip}>💡 Use o seletor para filtrar por tribunal</Text>
            <Text style={styles.tip}>💡 Números CNJ completos: 0001234-56.2023.8.21.0001</Text>
          </View>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Nenhum resultado</Text>
          <Text style={styles.emptyText}>
            Nenhum processo encontrado para "{lastQuery}".
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>JurisApp</Text>
        <Text style={styles.subtitle}>Jurisprudência brasileira sem máscara</Text>
      </View>

      <SearchBar
        onSearch={handleSearch}
        loading={loading}
        placeholder="Ex: dano moral, honorários, prescrição..."
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1a1a2e']}
          />
        }
        onContentSizeChange={handleLoadMore}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y > nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height - 200) {
            handleLoadMore();
          }
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsContainer}>
          {renderEmptyState()}
          {results.map((processo) => (
            <ProcessCard
              key={processo.id}
              processo={processo}
              onPress={() => handleCardPress(processo)}
              highlightQuery={lastQuery}
            />
          ))}
          {hasMore && loading && (
            <View style={styles.loadMore}>
              <Text style={styles.loadMoreText}>Carregando mais resultados...</Text>
            </View>
          )}
          {hasMore && !loading && results.length > 0 && (
            <View style={styles.loadMore}>
              <Text style={styles.loadMoreText}>
                {results.length} de {pagination.total} resultados • Role para carregar mais
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tips: {
    marginTop: 8,
    gap: 8,
    width: '80%',
  },
  tip: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 13,
    color: '#888',
  },
});
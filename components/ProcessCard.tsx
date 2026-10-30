'use client';

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Processo } from '@/types';

interface ProcessCardProps {
  processo: Processo;
  onPress: () => void;
  highlightQuery?: string;
}

const tribunalColors: Record<string, string> = {
  'TJRS (DataJud/CNJ)': '#1a1a2e',
  'STJ': '#c41e3a',
  'TJRS Direto': '#0056a0',
};

export const ProcessCard = ({ processo, onPress, highlightQuery }: ProcessCardProps) => {
  const tribunalColor = tribunalColors[processo.tribunal] || '#1a1a2e';
  const formattedDate = processo.dataJulgamento
    ? format(new Date(processo.dataJulgamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'Data não informada';

  const highlightText = (text: string, query: string, baseStyle: TextStyle) => {
    if (!query || !text) return <Text style={baseStyle}>{text}</Text>;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={[
              baseStyle,
              part.toLowerCase() === query.toLowerCase() && { fontWeight: 'bold', color: tribunalColor },
            ]}
          >
            {part}
          </Text>
        ))}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header com tribunal e número do processo */}
      <View style={styles.header}>
        <View style={[styles.tribunalBadge, { backgroundColor: tribunalColor }]}>
          <Text style={styles.tribunalBadgeText}>{processo.tribunal.split(' ')[0]}</Text>
        </View>
        <Text style={styles.numeroProcesso} numberOfLines={1}>
          {processo.numeroProcesso}
        </Text>
      </View>

      {/* Classe e assunto */}
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Classe:</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {processo.classeProcessual || 'Não informado'}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Assunto:</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {processo.assunto || 'Não informado'}
        </Text>
      </View>

      {/* Relator e órgão julgador */}
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Relator:</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {processo.relator || 'Não informado'}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Órgão:</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {processo.orgaoJulgador || 'Não informado'}
        </Text>
      </View>

      {/* Data */}
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Julgamento:</Text>
        <Text style={styles.metaValue}>{formattedDate}</Text>
      </View>

      {/* Ementa - destaque principal */}
      <View style={styles.ementaContainer}>
        <Text style={styles.ementaLabel}>Ementa:</Text>
        <Text style={styles.ementaText} numberOfLines={4}>
          {highlightQuery
            ? highlightText(processo.ementa || 'Ementa não disponível', highlightQuery, styles.ementaText)
            : processo.ementa || 'Ementa não disponível'}
        </Text>
      </View>

      {/* Indicador de inteiro teor disponível */}
      {processo.inteiroTeor && (
        <View style={styles.inteiroTeorBadge}>
          <Text style={styles.inteiroTeorText}>📄 Inteiro teor disponível</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tribunalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tribunalBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numeroProcesso: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    fontFamily: 'monospace',
    flex: 1,
    marginLeft: 10,
    textAlign: 'right',
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  metaLabel: {
    width: 70,
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  metaValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  ementaContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ementaLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ementaText: {
    fontSize: 14,
    color: '#1a1a2e',
    lineHeight: 21,
  },
  inteiroTeorBadge: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inteiroTeorText: {
    fontSize: 12,
    color: '#1a1a2e',
    fontWeight: '500',
    textAlign: 'center',
  },
});
'use client';

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Processo } from '@/types';
import Markdown from 'react-native-markdown-display';

interface ProcessDetailProps {
  processo: Processo;
  onClose: () => void;
}

const tribunalColors: Record<string, string> = {
  'TJRS (DataJud/CNJ)': '#1a1a2e',
  'STJ': '#c41e3a',
  'TJRS Direto': '#0056a0',
};

export const ProcessDetail = ({ processo, onClose }: ProcessDetailProps) => {
  const tribunalColor = tribunalColors[processo.tribunal] || '#1a1a2e';
  const formattedDate = processo.dataJulgamento
    ? format(new Date(processo.dataJulgamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'Data não informada';

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copiado!', `${label} copiado para a área de transferência`);
  };

  const renderSection = (title: string, content: string | undefined, copyable = false, copyLabel = '') => {
    if (!content) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tribunalColor }]}>{title}</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText} selectable={true}>
            {content}
          </Text>
          {copyable && (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(content, copyLabel)}
            >
              <Text style={styles.copyButtonText}>📋 Copiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPartes = () => {
    if (!processo.partes || processo.partes.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tribunalColor }]}>Partes</Text>
        {processo.partes.map((parte, index) => (
          <View key={index} style={styles.parteItem}>
            <Text style={[styles.parteTipo, { color: tribunalColor }]}>{parte.tipo.toUpperCase()}</Text>
            <Text style={styles.parteNome}>{parte.nome}</Text>
            {parte.advogados && parte.advogados.length > 0 && (
              <Text style={styles.parteAdvogados}>
                Adv: {parte.advogados.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderMovimentacoes = () => {
    if (!processo.movimentacoes || processo.movimentacoes.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tribunalColor }]}>Movimentações</Text>
        {processo.movimentacoes
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .map((mov, index) => (
            <View key={index} style={styles.movItem}>
              <Text style={styles.movData}>
                {format(new Date(mov.data), "dd/MM/yyyy", { locale: ptBR })}
              </Text>
              <Text style={styles.movDesc}>{mov.descricao}</Text>
              {mov.tipo && <Text style={styles.movTipo}>{mov.tipo}</Text>}
            </View>
          ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: tribunalColor }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.tribunalBadge, { backgroundColor: tribunalColor }]}>
            <Text style={styles.tribunalBadgeText}>{processo.tribunal.split(' ')[0]}</Text>
          </View>
          <Text style={styles.numeroProcesso}>{processo.numeroProcesso}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Metadados principais */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Classe Processual</Text>
            <Text style={styles.metaValue}>{processo.classeProcessual || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Assunto</Text>
            <Text style={styles.metaValue}>{processo.assunto || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Relator</Text>
            <Text style={styles.metaValue}>{processo.relator || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Órgão Julgador</Text>
            <Text style={styles.metaValue}>{processo.orgaoJulgador || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Data Julgamento</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
          {processo.grau && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Grau</Text>
              <Text style={styles.metaValue}>{processo.grau}</Text>
            </View>
          )}
          {processo.dataAjuizamento && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Data Ajuizamento</Text>
              <Text style={styles.metaValue}>
                {format(new Date(processo.dataAjuizamento), "dd/MM/yyyy", { locale: ptBR })}
              </Text>
            </View>
          )}
        </View>

        {/* Ementa */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tribunalColor }]}>Ementa</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.ementaText} selectable={true}>
              {processo.ementa || 'Ementa não disponível'}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(processo.ementa || '', 'Ementa')}
            >
              <Text style={styles.copyButtonText}>📋 Copiar Ementa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inteiro Teor */}
        {processo.inteiroTeor && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tribunalColor }]}>Inteiro Teor</Text>
            <View style={styles.sectionContent}>
              <Markdown style={styles.inteiroTeorMarkdown}>
                {processo.inteiroTeor}
              </Markdown>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(processo.inteiroTeor!, 'Inteiro teor')}
              >
                <Text style={styles.copyButtonText}>📋 Copiar Inteiro Teor</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Partes */}
        {renderPartes()}

        {/* Movimentações */}
        {renderMovimentacoes()}

        {/* Fonte */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Fonte: {processo.fonte.toUpperCase()} • JurisApp
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 40,
  },
  tribunalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tribunalBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  numeroProcesso: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    fontFamily: 'monospace',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  metaLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    gap: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  ementaText: {
    fontSize: 14,
    color: '#1a1a2e',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  inteiroTeorMarkdown: {
    fontSize: 13,
    color: '#333',
    lineHeight: 21,
  },
  copyButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontSize: 12,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  parteItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  parteTipo: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  parteNome: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  parteAdvogados: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  movItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderLeftWidth: 3,
    borderLeftColor: tribunalColors['TJRS (DataJud/CNJ)'],
  },
  movData: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
  },
  movDesc: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  movTipo: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});
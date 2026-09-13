import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const DEPORTES_DISPONIBLES = [
  { id: 'futbol', nombre: 'Fútbol', icono: '⚽' },
  { id: 'padel', nombre: 'Pádel', icono: '🎾' },
  { id: 'tenis', nombre: 'Tenis', icono: '🎾' },
  { id: 'basquet', nombre: 'Básquetbol', icono: '🏀' },
  { id: 'running', nombre: 'Running', icono: '🏃' },
  { id: 'gym', nombre: 'Gimnasio', icono: '🏋️' },
  { id: 'volley', nombre: 'Vóleibol', icono: '🏐' },
  { id: 'ciclismo', nombre: 'Ciclismo', icono: '🚴' },
];

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'];

export default function DeportesScreen() {
  const [deportesSeleccionados, setDeportesSeleccionados] = useState<string[]>([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>('Intermedio');
  const router = useRouter();

  function toggleDeporte(id: string) {
    if (deportesSeleccionados.includes(id)) {
      setDeportesSeleccionados(deportesSeleccionados.filter((item) => item !== id));
    } else {
      setDeportesSeleccionados([...deportesSeleccionados, id]);
    }
  }

  function handleContinuar() {
    if (deportesSeleccionados.length === 0) {
      Alert.alert('Selecciona al menos un deporte', 'Elige un deporte para recomendarte matches cercanos.');
      return;
    }

    // Navegamos al Dashboard Principal (Tabs)
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>¿Qué te gusta jugar?</Text>
        <Text style={styles.subtitle}>Selecciona tus deportes preferidos para encontrar rivales y compañeros.</Text>

        {/* Grilla de Deportes */}
        <View style={styles.grid}>
          {DEPORTES_DISPONIBLES.map((dep) => {
            const isSelected = deportesSeleccionados.includes(dep.id);
            return (
              <TouchableOpacity
                key={dep.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleDeporte(dep.id)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28 }}>{dep.icono}</Text>
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>{dep.nombre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selección de Nivel */}
        <Text style={[styles.title, { fontSize: 20, marginTop: 24 }]}>Tu Nivel de Juego</Text>
        <View style={styles.nivelContainer}>
          {NIVELES.map((nivel) => {
            const isSelected = nivelSeleccionado === nivel;
            return (
              <TouchableOpacity
                key={nivel}
                style={[styles.nivelBtn, isSelected && styles.nivelBtnSelected]}
                onPress={() => setNivelSeleccionado(nivel)}
              >
                <Text style={[styles.nivelText, isSelected && styles.nivelTextSelected]}>{nivel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón de Continuar */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinuar}>
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 6, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  cardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  cardText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  cardTextSelected: { color: '#2563EB', fontWeight: 'bold' },
  nivelContainer: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 24 },
  nivelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  nivelBtnSelected: { backgroundColor: '#2563EB' },
  nivelText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  nivelTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
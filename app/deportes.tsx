import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useTheme } from './lib/ThemeContext';

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

const NIVELES = [
  'Principiante',
  'Intermedio',
  'Avanzado',
];

export default function DeportesScreen() {
  const { isDark, colors } = useTheme();

  const [deportesSeleccionados, setDeportesSeleccionados] =
    useState<string[]>([]);

  const [nivelSeleccionado, setNivelSeleccionado] =
    useState<string>('Intermedio');

  const router = useRouter();

  function toggleDeporte(id: string) {
    if (deportesSeleccionados.includes(id)) {
      setDeportesSeleccionados(
        deportesSeleccionados.filter(
          (item) => item !== id
        )
      );
    } else {
      setDeportesSeleccionados([
        ...deportesSeleccionados,
        id,
      ]);
    }
  }

  function handleContinuar() {
    if (deportesSeleccionados.length === 0) {
      Alert.alert(
        'Selecciona al menos un deporte',
        'Elige un deporte para recomendarte matches cercanos.'
      );

      return;
    }

    // Navegamos al Dashboard Principal (Tabs)
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          ¿Qué te gusta jugar?
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Selecciona tus deportes preferidos para encontrar rivales y
          compañeros.
        </Text>

        {/* Grilla de Deportes */}

        <View style={styles.grid}>
          {DEPORTES_DISPONIBLES.map((dep) => {
            const isSelected =
              deportesSeleccionados.includes(dep.id);

            return (
              <TouchableOpacity
                key={dep.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#27346A'
                        : '#EFF6FF'
                      : colors.card,

                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() =>
                  toggleDeporte(dep.id)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.sportIcon}>
                  {dep.icono}
                </Text>

                <Text
                  style={[
                    styles.cardText,
                    {
                      color: isSelected
                        ? isDark
                          ? '#A5B4FC'
                          : colors.primary
                        : colors.text,

                      fontWeight: isSelected
                        ? 'bold'
                        : '600',
                    },
                  ]}
                >
                  {dep.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selección de Nivel */}

        <Text
          style={[
            styles.levelTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Tu Nivel de Juego
        </Text>

        <View style={styles.nivelContainer}>
          {NIVELES.map((nivel) => {
            const isSelected =
              nivelSeleccionado === nivel;

            return (
              <TouchableOpacity
                key={nivel}
                style={[
                  styles.nivelBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? '#334155'
                      : '#F1F5F9',

                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() =>
                  setNivelSeleccionado(nivel)
                }
              >
                <Text
                  style={[
                    styles.nivelText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : colors.secondaryText,

                      fontWeight: isSelected
                        ? 'bold'
                        : '600',
                    },
                  ]}
                >
                  {nivel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón Continuar */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleContinuar}
        >
          <Text style={styles.primaryButtonText}>
            Continuar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    padding: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    width: '47%',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },

  sportIcon: {
    fontSize: 28,
  },

  cardText: {
    fontSize: 14,
  },

  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },

  nivelContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },

  nivelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  nivelText: {
    fontSize: 13,
  },

  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
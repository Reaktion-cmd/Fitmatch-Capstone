import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';

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
  const router = useRouter();
  const { isDark, colors } = useTheme();

  const [deportesSeleccionados, setDeportesSeleccionados] =
    useState<string[]>([]);

  const [nivelSeleccionado, setNivelSeleccionado] =
    useState<string>('Intermedio');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPreferencias();
  }, []);

  async function cargarPreferencias() {
    try {
      setCargando(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('sports, skill_level')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        if (Array.isArray(data.sports)) {
          setDeportesSeleccionados(data.sports);
        }

        if (data.skill_level) {
          setNivelSeleccionado(data.skill_level);
        }
      }
    } catch (error: any) {
      console.log(
        'Error cargando deportes:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron cargar tus preferencias deportivas.'
      );
    } finally {
      setCargando(false);
    }
  }

  function toggleDeporte(id: string) {
    setDeportesSeleccionados(
      (deportesActuales) => {
        if (deportesActuales.includes(id)) {
          return deportesActuales.filter(
            (item) => item !== id
          );
        }

        return [
          ...deportesActuales,
          id,
        ];
      }
    );
  }

  async function handleContinuar() {
    if (deportesSeleccionados.length === 0) {
      Alert.alert(
        'Selecciona al menos un deporte',
        'Elige un deporte para recomendarte matches cercanos.'
      );

      return;
    }

    try {
      setGuardando(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            sports: deportesSeleccionados,
            skill_level: nivelSeleccionado,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        );

      if (error) {
        throw error;
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.log(
        'Error guardando deportes:',
        error
      );

      Alert.alert(
        'Error al guardar',
        error?.message ??
          'No se pudieron guardar tus deportes y nivel.'
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Cargando preferencias...
          </Text>
        </View>
      </SafeAreaView>
    );
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
              opacity: guardando ? 0.7 : 1,
            },
          ]}
          onPress={handleContinuar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Continuar
            </Text>
          )}
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
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
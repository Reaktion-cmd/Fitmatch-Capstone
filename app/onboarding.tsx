import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTheme } from './lib/ThemeContext';

export default function OnboardingScreen() {
  const { isDark, colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function requestLocationPermission() {
    setLoading(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Ubicación requerida',
          'FitMatch necesita tu ubicación para mostrarte deportistas y eventos cercanos. Puedes activarla desde la configuración de tu teléfono.'
        );

        setLoading(false);
        return;
      }

      // Si concede el permiso, obtenemos la posición actual
      const location =
        await Location.getCurrentPositionAsync({});

      console.log(
        'Ubicación obtenida:',
        location.coords.latitude,
        location.coords.longitude
      );

      // Continuar a selección de deportes
      router.replace('/deportes');
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo obtener la ubicación.'
      );
    } finally {
      setLoading(false);
    }
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark
                  ? '#1E293B'
                  : colors.primarySoft,

                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.locationIcon}>
              📍
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Activa tu Ubicación
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Para conectarte con deportistas y partidos a tu alrededor,
            FitMatch utiliza tu posición geográfica.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={requestLocationPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Permitir Ubicación
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              router.replace('/(tabs)')
            }
            disabled={loading}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Ahora no
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },

  locationIcon: {
    fontSize: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  description: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  footer: {
    gap: 12,
    marginBottom: 20,
  },

  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },

  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useTheme } from '../lib/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

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
        <View style={styles.headerBox}>
          <View
            style={[
              styles.logoContainer,
              {
                backgroundColor: isDark
                  ? '#1E293B'
                  : '#EFF6FF',
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Bienvenido a FitMatch
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Encuentra partidos, completa equipos y organiza eventos deportivos
            cerca de ti.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push('/registro')}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: colors.text,
                },
              ]}
            >
              Crear Cuenta
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
    justifyContent: 'space-between',
    padding: 24,
  },

  headerBox: {
    marginTop: 40,
    alignItems: 'center',
  },

  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },

  logo: {
    width: 130,
    height: 130,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  buttonGroup: {
    width: '100%',
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
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

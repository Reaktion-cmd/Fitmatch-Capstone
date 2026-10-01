import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { useTheme } from './lib/ThemeContext';

export default function LoginScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert(
        'Error',
        'Por favor llena todos los campos'
      );

      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      Alert.alert(
        'Error al iniciar sesión',
        error.message
      );
    } else {
      Alert.alert(
        '¡Bienvenido!',
        'Sesión iniciada correctamente'
      );

      router.replace('/onboarding');
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
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Iniciar Sesión
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Ingresa a tu cuenta para buscar partidos
        </Text>

        <View style={styles.form}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Correo Electrónico
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={colors.secondaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Contraseña
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Entrar
              </Text>
            )}
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
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },

  form: {
    gap: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },

  primaryButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
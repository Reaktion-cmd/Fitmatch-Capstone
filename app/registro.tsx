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

export default function RegistroScreen() {
  const { colors } = useTheme();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !nombre) {
      Alert.alert(
        'Error',
        'Por favor llena todos los campos'
      );

      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nombre,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert(
        'Error al registrarte',
        error.message
      );
    } else {
      Alert.alert(
        '¡Registro exitoso!',
        'Revisa tu correo para confirmar o inicia sesión directamente.'
      );

      router.replace('/login');
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
          Crear Cuenta
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Únete a la comunidad de deportistas
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
            Nombre Completo
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
            placeholder="Juan Pérez"
            placeholderTextColor={colors.secondaryText}
            value={nombre}
            onChangeText={setNombre}
          />

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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Registrarme
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
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase'; 
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    } else {
      Alert.alert('¡Bienvenido!', 'Sesión iniciada correctamente');
      router.replace('/onboarding');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta para buscar partidos</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 32 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', padding: 14, borderRadius: 10, fontSize: 16 },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
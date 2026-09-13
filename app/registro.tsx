import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !nombre) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nombre }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error al registrarte', error.message);
    } else {
      Alert.alert('¡Registro exitoso!', 'Revisa tu correo para confirmar o inicia sesión directamente.');
      router.replace('/login');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a la comunidad de deportistas</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
          />

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

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Registrarme</Text>}
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
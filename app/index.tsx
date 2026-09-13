import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerBox}>
          {/* Círculo visual representativo de Logo en puro código (sin archivos de imagen) */}
          <Image 
  source={require('../assets/logo.png')} 
  style={{ width: 130, height: 130, marginBottom: 16 }}
  resizeMode="contain"
/>

        
          <Text style={styles.title}>Bienvenido a FitMatch
          </Text>
          <Text style={styles.subtitle}>
            Encuentra partidos, completa equipos y organiza eventos deportivos cerca de ti.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/registro" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  headerBox: { marginTop: 40, alignItems: 'center' },
  logoCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#EFF6FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2563EB'
  },
  logoText: { fontSize: 48 },
  badge: { backgroundColor: '#E2E8F0', color: '#334155', fontWeight: '700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontSize: 12, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  buttonGroup: { width: '100%', gap: 12, marginBottom: 20 },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#1E293B', fontWeight: 'bold', fontSize: 16 },
});

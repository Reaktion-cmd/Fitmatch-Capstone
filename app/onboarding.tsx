import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function requestLocationPermission() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Ubicación requerida',
          'FitMatch necesita tu ubicación para mostrarte deportistas y eventos cercanos. Puedes activarla desde la configuración de tu teléfono.'
        );
        setLoading(false);
        return;
      }

      // Si concede el permiso, obtenemos la posición actual
      const location = await Location.getCurrentPositionAsync({});
      console.log('Ubicación obtenida:', location.coords.latitude, location.coords.longitude);

      // Redirigir a las pestañas principales
    router.replace('/deportes');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 50 }}>📍</Text>
          </View>

          <Text style={styles.title}>Activa tu Ubicación</Text>
          <Text style={styles.description}>
            Para conectarte con deportistas y partidos a tu alrededor, FitMatch utiliza tu posición geográfica.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={requestLocationPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Permitir Ubicación</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Ahora no</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  description: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 16 },
  footer: { gap: 12, marginBottom: 20 },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#64748B', fontWeight: '600', fontSize: 15 },
});
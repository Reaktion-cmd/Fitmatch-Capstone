import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estados del perfil de usuario
  const [nombre, setNombre] = useState('Juan Pérez');
  const [edad, setEdad] = useState('25');
  const [bio, setBio] = useState('Apasionado por el deporte. Buscando rivales para pádel los fines de semana.');
  const [equipo, setEquipo] = useState('Real Madrid / Lakers');
  const [instagram, setInstagram] = useState('@juanperez_fit');
  const [deportes, setDeportes] = useState(['🎾 Pádel', '⚽ Fútbol 7', '🏃 Running']);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  function handleGuardar() {
    if (!nombre || !edad) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu nombre y edad.');
      return;
    }
    setModoEdicion(false);
    Alert.alert('¡Perfil actualizado!', 'Tus cambios se han guardado correctamente.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header / Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 50 }}>🏃‍♂️</Text>
          </View>
          <Text style={styles.userName}>{nombre}, {edad}</Text>
          <Text style={styles.userBio}>"{bio}"</Text>

          <TouchableOpacity 
            style={styles.editToggleBtn} 
            onPress={() => setModoEdicion(!modoEdicion)}
          >
            <Text style={styles.editToggleText}>{modoEdicion ? 'Cancelar' : '✏️ Editar Perfil'}</Text>
          </TouchableOpacity>
        </View>

        {modoEdicion ? (
          /* MODO EDICIÓN DE PERFIL */
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Editar Información</Text>

            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

            <Text style={styles.label}>Edad</Text>
            <TextInput style={styles.input} value={edad} onChangeText={setEdad} keyboardType="numeric" />

            <Text style={styles.label}>Biografía / Descripción</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={bio} 
              onChangeText={setBio} 
              multiline 
            />

            <Text style={styles.label}>Equipo Favorito / Hincha de</Text>
            <TextInput style={styles.input} value={equipo} onChangeText={setEquipo} />

            <Text style={styles.label}>Instagram / Red Social</Text>
            <TextInput style={styles.input} value={instagram} onChangeText={setInstagram} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar}>
              <Text style={styles.saveBtnText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* MODO VISTA PREVIA */
          <View style={{ gap: 16 }}>
            
            {/* Tarjeta 1: Deportes */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>⚡ Mis Deportes</Text>
              <View style={styles.chipContainer}>
                {deportes.map((dep, index) => (
                  <View key={index} style={styles.sportChip}>
                    <Text style={styles.sportChipText}>{dep}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tarjeta 2: Equipo e Info Adicional */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>⚽ Equipo Favorito</Text>
              <Text style={styles.infoText}>{equipo || 'No especificado'}</Text>
            </View>

            {/* Tarjeta 3: Redes Sociales */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>📲 Redes Sociales</Text>
              <Text style={styles.infoText}>Instagram: {instagram || 'No configurado'}</Text>
            </View>

            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  userBio: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 20, fontStyle: 'italic' },
  editToggleBtn: { marginTop: 12, backgroundColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editToggleText: { color: '#334155', fontWeight: '600', fontSize: 13 },
  infoCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  infoText: { fontSize: 14, color: '#475569' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sportChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  sportChipText: { color: '#2563EB', fontSize: 12, fontWeight: 'bold' },
  formCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8, fontSize: 14 },
  saveBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  logoutBtn: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#DC2626', fontWeight: 'bold' },
});
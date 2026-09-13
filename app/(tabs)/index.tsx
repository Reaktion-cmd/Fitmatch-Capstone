import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

export default function MatchScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Match Deportivo 1v1</Text>
        
        {/* Tarjeta simulada tipo Tinder */}
        <View style={styles.card}>
          <View style={styles.avatarPlaceholder}>
            <Text style={{ fontSize: 60 }}>🧢</Text>
          </View>
          <Text style={styles.userName}>Carlos Mendoza, 24</Text>
          <Text style={styles.userSport}>⚡ Tenis / Padel • Nivel Intermedio</Text>
          <Text style={styles.userBio}>"Buscando con quién jugar un partido este fin de semana por las tardes."</Text>
        </View>

        {/* Botones de Liked / Disliked */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.circleBtn, { borderColor: '#EF4444' }]}>
            <Text style={{ fontSize: 24 }}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circleBtn, { borderColor: '#22C55E' }]}>
            <Text style={{ fontSize: 24 }}>💚</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20, justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginTop: 10 },
  card: { width: '100%', height: '65%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 4 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  userSport: { fontSize: 14, color: '#2563EB', fontWeight: '600', marginTop: 4 },
  userBio: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 12, paddingHorizontal: 10 },
  actions: { flexDirection: 'row', gap: 30, marginBottom: 10 },
  circleBtn: { width: 65, height: 65, borderRadius: 33, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
});
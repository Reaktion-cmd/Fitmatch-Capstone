import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <Text style={{ color: '#64748B', marginTop: 20 }}>Aún no tienes chats activos de Match o Eventos.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
});
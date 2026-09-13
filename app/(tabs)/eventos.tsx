import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

interface Evento {
  id: string;
  titulo: string;
  deporte: string;
  lugar: string;
  fecha: string;
  cupos: number;
  esMio?: boolean;
  unido?: boolean;
}

export default function EventosScreen() {
  const [vista, setVista] = useState<'disponibles' | 'mis_eventos'>('disponibles');
  const [filtroDeporte, setFiltroDeporte] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [modalCrear, setModalCrear] = useState<boolean>(false);

  // Formulario nuevo evento
  const [titulo, setTitulo] = useState('');
  const [deporte, setDeporte] = useState('Fútbol');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [cupos, setCupos] = useState('');

  // Base de datos local simulada
  const [eventos, setEventos] = useState<Evento[]>([
    { id: '1', titulo: 'Fútbol 7 Nocturno', deporte: 'Fútbol', lugar: 'Canchas del Parque', fecha: 'Hoy, 20:00 hrs', cupos: 3 },
    { id: '2', titulo: 'Partido Dobles Pádel', deporte: 'Pádel', lugar: 'Club Padel Center', fecha: 'Mañana, 18:00 hrs', cupos: 1 },
    { id: '3', titulo: 'Básquetbol 3v3 Amistoso', deporte: 'Básquet', lugar: 'Gimnasio Municipal', fecha: 'Sábado, 16:30 hrs', cupos: 2 },
  ]);

  function handleCrearEvento() {
    if (!titulo || !lugar || !fecha || !cupos) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los datos del evento.');
      return;
    }

    const nuevoEvento: Evento = {
      id: Date.now().toString(),
      titulo,
      deporte,
      lugar,
      fecha,
      cupos: Number(cupos),
      esMio: true,
      unido: true,
    };

    setEventos([nuevoEvento, ...eventos]);
    Alert.alert('¡Éxito!', 'Partido publicado correctamente.');
    setModalCrear(false);
    
    // Limpiar campos
    setTitulo('');
    setLugar('');
    setFecha('');
    setCupos('');
  }

  function handleUnirse(id: string) {
    setEventos(eventos.map(ev => ev.id === id ? { ...ev, unido: true, cupos: ev.cupos - 1 } : ev));
    Alert.alert('¡Te has unido!', 'Ahora este evento aparecerá en "Mis Partidos".');
  }

  // Filtrado de eventos
  const eventosFiltrados = eventos.filter((ev) => {
    const coincideFiltro = filtroDeporte === 'Todos' || ev.deporte === filtroDeporte;
    const coincideBusqueda = ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) || ev.lugar.toLowerCase().includes(busqueda.toLowerCase());
    
    if (vista === 'mis_eventos') {
      return (ev.unido || ev.esMio) && coincideFiltro && coincideBusqueda;
    }
    return coincideFiltro && coincideBusqueda;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header con Buscador */}
        <Text style={styles.headerTitle}>Eventos Deportivos</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por cancha, ciudad o título..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {/* Filtros por Deporte */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {['Todos', 'Fútbol', 'Pádel', 'Tenis', 'Básquet'].map((dep) => (
            <TouchableOpacity
              key={dep}
              style={[styles.chip, filtroDeporte === dep && styles.chipActive]}
              onPress={() => setFiltroDeporte(dep)}
            >
              <Text style={[styles.chipText, filtroDeporte === dep && styles.chipTextActive]}>{dep}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sub-Tabs: Disponibles / Mis Partidos */}
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={[styles.tabButton, vista === 'disponibles' && styles.tabButtonActive]}
            onPress={() => setVista('disponibles')}
          >
            <Text style={[styles.tabText, vista === 'disponibles' && styles.tabTextActive]}>Disponibles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, vista === 'mis_eventos' && styles.tabButtonActive]}
            onPress={() => setVista('mis_eventos')}
          >
            <Text style={[styles.tabText, vista === 'mis_eventos' && styles.tabTextActive]}>Mis Partidos</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Eventos */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {eventosFiltrados.length === 0 ? (
            <Text style={styles.emptyText}>No se encontraron partidos en esta categoría.</Text>
          ) : (
            eventosFiltrados.map((item) => (
              <View key={item.id} style={styles.eventCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.eventTag}>⚽ {item.deporte.toUpperCase()}</Text>
                  <Text style={styles.eventSlots}>
                    {item.esMio ? '👑 Organizado por ti' : `Faltan ${item.cupos} jugadores`}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>{item.titulo}</Text>
                <Text style={styles.eventDetails}>📍 {item.lugar}</Text>
                <Text style={styles.eventDetails}>🕒 {item.fecha}</Text>

                {!item.unido && !item.esMio ? (
                  <TouchableOpacity style={styles.joinBtn} onPress={() => handleUnirse(item.id)}>
                    <Text style={styles.joinBtnText}>Unirme al Partido</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedBadgeText}>✓ Ya estás anotado</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Botón Flotante "+" para Crear Partido */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalCrear(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Modal de Crear Evento */}
        <Modal visible={modalCrear} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Crear Nuevo Partido</Text>
                <TouchableOpacity onPress={() => setModalCrear(false)}>
                  <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder="Título del partido" value={titulo} onChangeText={setTitulo} />
              
              <View style={styles.deporteSelector}>
                {['Fútbol', 'Pádel', 'Tenis', 'Básquet'].map((dep) => (
                  <TouchableOpacity
                    key={dep}
                    style={[styles.depChip, deporte === dep && styles.depChipActive]}
                    onPress={() => setDeporte(dep)}
                  >
                    <Text style={[styles.depChipText, deporte === dep && styles.depChipTextActive]}>{dep}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.input} placeholder="Ubicación / Cancha" value={lugar} onChangeText={setLugar} />
              <TextInput style={styles.input} placeholder="Fecha y Hora (Ej: Hoy 20:00)" value={fecha} onChangeText={setFecha} />
              <TextInput style={styles.input} placeholder="Jugadores faltantes (Ej: 3)" value={cupos} onChangeText={setCupos} keyboardType="numeric" />

              <TouchableOpacity style={styles.primaryButton} onPress={handleCrearEvento}>
                <Text style={styles.primaryButtonText}>Publicar Evento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  searchInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 12 },
  categories: { flexDirection: 'row', maxHeight: 36, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8, height: 32 },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  tabHeader: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 10, padding: 3, marginBottom: 14 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#2563EB', fontWeight: 'bold' },
  eventCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTag: { fontSize: 11, fontWeight: 'bold', color: '#2563EB' },
  eventSlots: { fontSize: 12, color: '#16A34A', fontWeight: 'bold' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  eventDetails: { fontSize: 13, color: '#64748B' },
  joinBtn: { backgroundColor: '#EFF6FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  joinBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  joinedBadge: { backgroundColor: '#DCFCE7', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  joinedBadgeText: { color: '#15803D', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 10, fontSize: 14 },
  deporteSelector: { flexDirection: 'row', gap: 6 },
  depChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E2E8F0' },
  depChipActive: { backgroundColor: '#2563EB' },
  depChipText: { fontSize: 12, color: '#475569' },
  depChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
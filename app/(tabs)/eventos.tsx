import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

import { useTheme } from '../../lib/ThemeContext';

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
  const { isDark, colors } = useTheme();

  const [vista, setVista] =
    useState<'disponibles' | 'mis_eventos'>('disponibles');

  const [filtroDeporte, setFiltroDeporte] =
    useState<string>('Todos');

  const [busqueda, setBusqueda] =
    useState<string>('');

  const [modalCrear, setModalCrear] =
    useState<boolean>(false);

  // Formulario nuevo evento
  const [titulo, setTitulo] = useState('');
  const [deporte, setDeporte] = useState('Fútbol');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [cupos, setCupos] = useState('');

  // Base de datos local simulada
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: '1',
      titulo: 'Fútbol 7 Nocturno',
      deporte: 'Fútbol',
      lugar: 'Canchas del Parque',
      fecha: 'Hoy, 20:00 hrs',
      cupos: 3,
    },
    {
      id: '2',
      titulo: 'Partido Dobles Pádel',
      deporte: 'Pádel',
      lugar: 'Club Padel Center',
      fecha: 'Mañana, 18:00 hrs',
      cupos: 1,
    },
    {
      id: '3',
      titulo: 'Básquetbol 3v3 Amistoso',
      deporte: 'Básquet',
      lugar: 'Gimnasio Municipal',
      fecha: 'Sábado, 16:30 hrs',
      cupos: 2,
    },
  ]);

  function handleCrearEvento() {
    if (!titulo || !lugar || !fecha || !cupos) {
      Alert.alert(
        'Campos incompletos',
        'Por favor llena todos los datos del evento.'
      );

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

    Alert.alert(
      '¡Éxito!',
      'Partido publicado correctamente.'
    );

    setModalCrear(false);

    // Limpiar campos
    setTitulo('');
    setLugar('');
    setFecha('');
    setCupos('');
  }

  function handleUnirse(id: string) {
    setEventos(
      eventos.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              unido: true,
              cupos: ev.cupos - 1,
            }
          : ev
      )
    );

    Alert.alert(
      '¡Te has unido!',
      'Ahora este evento aparecerá en "Mis Partidos".'
    );
  }

  // Filtrado de eventos
  const eventosFiltrados = eventos.filter((ev) => {
    const coincideFiltro =
      filtroDeporte === 'Todos' ||
      ev.deporte === filtroDeporte;

    const coincideBusqueda =
      ev.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      ev.lugar
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    if (vista === 'mis_eventos') {
      return (
        (ev.unido || ev.esMio) &&
        coincideFiltro &&
        coincideBusqueda
      );
    }

    return coincideFiltro && coincideBusqueda;
  });

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

        {/* Header */}

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Eventos Deportivos
        </Text>

        {/* Buscador */}

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="🔍 Buscar por cancha, ciudad o título..."
          placeholderTextColor={colors.secondaryText}
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {/* Filtros por deporte */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {[
            'Todos',
            'Fútbol',
            'Pádel',
            'Tenis',
            'Básquet',
          ].map((dep) => {
            const activo = filtroDeporte === dep;

            return (
              <TouchableOpacity
                key={dep}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activo
                      ? colors.primary
                      : isDark
                      ? '#334155'
                      : '#E2E8F0',

                    borderColor: activo
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() =>
                  setFiltroDeporte(dep)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: activo
                        ? '#FFFFFF'
                        : colors.secondaryText,

                      fontWeight: activo
                        ? 'bold'
                        : '600',
                    },
                  ]}
                >
                  {dep}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Disponibles / Mis Partidos */}

        <View
          style={[
            styles.tabHeader,
            {
              backgroundColor: isDark
                ? '#1E293B'
                : '#E2E8F0',

              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              vista === 'disponibles' && {
                backgroundColor: colors.card,
              },
            ]}
            onPress={() =>
              setVista('disponibles')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    vista === 'disponibles'
                      ? colors.primary
                      : colors.secondaryText,

                  fontWeight:
                    vista === 'disponibles'
                      ? 'bold'
                      : '600',
                },
              ]}
            >
              Disponibles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              vista === 'mis_eventos' && {
                backgroundColor: colors.card,
              },
            ]}
            onPress={() =>
              setVista('mis_eventos')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    vista === 'mis_eventos'
                      ? colors.primary
                      : colors.secondaryText,

                  fontWeight:
                    vista === 'mis_eventos'
                      ? 'bold'
                      : '600',
                },
              ]}
            >
              Mis Partidos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de eventos */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 80,
          }}
        >
          {eventosFiltrados.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              No se encontraron partidos en esta categoría.
            </Text>
          ) : (
            eventosFiltrados.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.eventTag,
                      {
                        color: isDark
                          ? '#93C5FD'
                          : '#2563EB',
                      },
                    ]}
                  >
                    ⚽ {item.deporte.toUpperCase()}
                  </Text>

                  <Text
                    style={styles.eventSlots}
                  >
                    {item.esMio
                      ? '👑 Organizado por ti'
                      : `Faltan ${item.cupos} jugadores`}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.eventTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {item.titulo}
                </Text>

                <Text
                  style={[
                    styles.eventDetails,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  📍 {item.lugar}
                </Text>

                <Text
                  style={[
                    styles.eventDetails,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  🕒 {item.fecha}
                </Text>

                {!item.unido && !item.esMio ? (
                  <TouchableOpacity
                    style={[
                      styles.joinBtn,
                      {
                        backgroundColor: isDark
                          ? '#1E3A5F'
                          : '#EFF6FF',

                        borderColor: isDark
                          ? '#334E68'
                          : '#DBEAFE',
                      },
                    ]}
                    onPress={() =>
                      handleUnirse(item.id)
                    }
                  >
                    <Text
                      style={[
                        styles.joinBtnText,
                        {
                          color: isDark
                            ? '#93C5FD'
                            : '#2563EB',
                        },
                      ]}
                    >
                      Unirme al Partido
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.joinedBadge,
                      {
                        backgroundColor: isDark
                          ? '#153C2B'
                          : '#DCFCE7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.joinedBadgeText,
                        {
                          color: isDark
                            ? '#86EFAC'
                            : '#15803D',
                        },
                      ]}
                    >
                      ✓ Ya estás anotado
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Botón flotante */}

        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() =>
            setModalCrear(true)
          }
        >
          <Text style={styles.fabText}>
            +
          </Text>
        </TouchableOpacity>

        {/* Modal crear evento */}

        <Modal
          visible={modalCrear}
          animationType="slide"
          transparent
          onRequestClose={() =>
            setModalCrear(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Crear Nuevo Partido
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setModalCrear(false)
                  }
                >
                  <Text
                    style={[
                      styles.closeButton,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color: colors.text,
                  },
                ]}
                placeholder="Título del partido"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={titulo}
                onChangeText={setTitulo}
              />

              {/* Selector deporte */}

              <View
                style={styles.deporteSelector}
              >
                {[
                  'Fútbol',
                  'Pádel',
                  'Tenis',
                  'Básquet',
                ].map((dep) => {
                  const activo =
                    deporte === dep;

                  return (
                    <TouchableOpacity
                      key={dep}
                      style={[
                        styles.depChip,
                        {
                          backgroundColor:
                            activo
                              ? colors.primary
                              : isDark
                              ? '#334155'
                              : '#E2E8F0',

                          borderColor:
                            activo
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setDeporte(dep)
                      }
                    >
                      <Text
                        style={[
                          styles.depChipText,
                          {
                            color: activo
                              ? '#FFFFFF'
                              : colors.secondaryText,

                            fontWeight:
                              activo
                                ? 'bold'
                                : '500',
                          },
                        ]}
                      >
                        {dep}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color: colors.text,
                  },
                ]}
                placeholder="Ubicación / Cancha"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={lugar}
                onChangeText={setLugar}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color: colors.text,
                  },
                ]}
                placeholder="Fecha y Hora (Ej: Hoy 20:00)"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={fecha}
                onChangeText={setFecha}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color: colors.text,
                  },
                ]}
                placeholder="Jugadores faltantes (Ej: 3)"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={cupos}
                onChangeText={setCupos}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={
                  handleCrearEvento
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Publicar Evento
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
  },

  categories: {
    flexDirection: 'row',
    maxHeight: 36,
    marginBottom: 14,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    height: 32,
    borderWidth: 1,
  },

  chipText: {
    fontSize: 13,
  },

  tabHeader: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },

  tabText: {
    fontSize: 13,
  },

  eventCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eventTag: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  eventSlots: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: 'bold',
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  eventDetails: {
    fontSize: 13,
  },

  joinBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },

  joinBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },

  joinedBadge: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },

  joinedBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  closeButton: {
    fontSize: 18,
  },

  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },

  deporteSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  depChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  depChipText: {
    fontSize: 12,
  },

  primaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

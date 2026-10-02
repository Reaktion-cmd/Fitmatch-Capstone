// ============================================================
// FITMATCH - EVENTOS DEPORTIVOS
// ============================================================
// Esta pantalla permite:
//
// - Cargar eventos reales desde Supabase.
// - Crear nuevos eventos.
// - Ver eventos disponibles.
// - Ver los eventos creados por el usuario.
// - Ver eventos a los que el usuario se ha unido.
// - Unirse a eventos.
// - Cancelar participación.
// - Calcular cupos restantes.
// - Buscar y filtrar eventos.
// - Mantener compatibilidad con modo claro / oscuro.
//
// Tablas utilizadas:
//
// public.events
// public.event_participants
// ============================================================

import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';

// SafeAreaView recomendado para Expo / React Native.
import { SafeAreaView } from 'react-native-safe-area-context';

// Navegación y recarga al volver a la pestaña.
import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

// Supabase.
import { supabase } from '../../lib/supabase';

// Tema global de FitMatch.
import { useTheme } from '../../lib/ThemeContext';


// ============================================================
// INTERFAZ DE EVENTO UTILIZADA POR LA APP
// ============================================================

interface Evento {
  id: string;

  titulo: string;

  deporte: string;

  lugar: string;

  fecha: string;

  // Cupos que todavía quedan disponibles.
  cupos: number;

  // Cupos solicitados originalmente.
  cuposTotales: number;

  // UUID del creador.
  creatorId: string;

  // true si el usuario autenticado creó el evento.
  esMio: boolean;

  // true si el usuario autenticado se unió al evento.
  unido: boolean;
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EventosScreen() {
  const router = useRouter();

  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS GENERALES
  // ==========================================================

  const [vista, setVista] =
    useState<'disponibles' | 'mis_eventos'>(
      'disponibles'
    );

  const [filtroDeporte, setFiltroDeporte] =
    useState<string>('Todos');

  const [busqueda, setBusqueda] =
    useState<string>('');

  const [modalCrear, setModalCrear] =
    useState<boolean>(false);


  // Lista de eventos obtenida desde Supabase.
  const [eventos, setEventos] =
    useState<Evento[]>([]);


  // Estados de carga.
  const [cargandoEventos, setCargandoEventos] =
    useState(true);

  const [guardandoEvento, setGuardandoEvento] =
    useState(false);

  // Guarda el ID del evento sobre el que estamos realizando
  // una acción de unirse o cancelar.
  const [eventoProcesando, setEventoProcesando] =
    useState<string | null>(null);


  // ==========================================================
  // FORMULARIO PARA CREAR EVENTO
  // ==========================================================

  const [titulo, setTitulo] =
    useState('');

  const [deporte, setDeporte] =
    useState('Fútbol');

  const [lugar, setLugar] =
    useState('');

  const [fecha, setFecha] =
    useState('');

  const [cupos, setCupos] =
    useState('');


  // ==========================================================
  // CARGAR EVENTOS AL ENTRAR A LA PANTALLA
  // ==========================================================
  //
  // useFocusEffect permite actualizar la información cada vez
  // que regresamos a la pestaña Eventos.
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarEventos();
    }, [])
  );


  // ==========================================================
  // CARGAR EVENTOS DESDE SUPABASE
  // ==========================================================

  async function cargarEventos() {
    try {
      setCargandoEventos(true);


      // ------------------------------------------------------
      // 1. OBTENER USUARIO AUTENTICADO
      // ------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');

        return;
      }


      // ------------------------------------------------------
      // 2. OBTENER TODOS LOS EVENTOS
      // ------------------------------------------------------

      const {
        data: eventosData,
        error: eventosError,
      } = await supabase
        .from('events')
        .select(
          `
          id,
          creator_id,
          title,
          sport,
          location,
          date_text,
          slots,
          created_at
          `
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );


      if (eventosError) {
        throw eventosError;
      }


      // Si todavía no existen eventos, dejamos la lista vacía.
      if (
        !eventosData ||
        eventosData.length === 0
      ) {
        setEventos([]);

        return;
      }


      // ------------------------------------------------------
      // 3. OBTENER PARTICIPANTES
      // ------------------------------------------------------
      //
      // Esta tabla nos permite saber:
      //
      // - quién se unió a cada evento;
      // - cuántos cupos quedan;
      // - si el usuario actual ya está inscrito.
      // ------------------------------------------------------

      const {
        data: participantesData,
        error: participantesError,
      } = await supabase
        .from('event_participants')
        .select(
          `
          event_id,
          user_id
          `
        );


      if (participantesError) {
        throw participantesError;
      }


      const participantes =
        participantesData ?? [];


      // ------------------------------------------------------
      // 4. TRANSFORMAR DATOS DE SUPABASE AL FORMATO DE LA APP
      // ------------------------------------------------------

      const eventosTransformados: Evento[] =
        eventosData.map((evento) => {
          // Participantes de este evento.
          const participantesEvento =
            participantes.filter(
              (participante) =>
                participante.event_id ===
                evento.id
            );


          // Cantidad de personas inscritas.
          const cantidadParticipantes =
            participantesEvento.length;


          // Cupos originalmente solicitados.
          const cuposTotales =
            Number(evento.slots);


          // Cupos restantes.
          const cuposRestantes =
            Math.max(
              cuposTotales -
                cantidadParticipantes,
              0
            );


          // Saber si el usuario actual ya está inscrito.
          const usuarioEstaUnido =
            participantesEvento.some(
              (participante) =>
                participante.user_id ===
                user.id
            );


          // Saber si el evento fue creado por el usuario actual.
          const esMio =
            evento.creator_id ===
            user.id;


          return {
            id:
              evento.id,

            titulo:
              evento.title,

            deporte:
              evento.sport,

            lugar:
              evento.location,

            fecha:
              evento.date_text,

            cupos:
              cuposRestantes,

            cuposTotales,

            creatorId:
              evento.creator_id,

            esMio,

            unido:
              usuarioEstaUnido,
          };
        });


      // Guardamos los eventos reales.
      setEventos(
        eventosTransformados
      );
    } catch (error: any) {
      console.log(
        'Error cargando eventos:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron cargar los eventos.'
      );
    } finally {
      setCargandoEventos(false);
    }
  }


  // ==========================================================
  // CREAR NUEVO EVENTO
  // ==========================================================

  async function handleCrearEvento() {
    // --------------------------------------------------------
    // VALIDAR CAMPOS
    // --------------------------------------------------------

    if (
      !titulo.trim() ||
      !lugar.trim() ||
      !fecha.trim() ||
      !cupos.trim()
    ) {
      Alert.alert(
        'Campos incompletos',
        'Por favor llena todos los datos del evento.'
      );

      return;
    }


    // Convertimos los cupos a número.
    const cuposNumero =
      Number(cupos);


    // Validación.
    if (
      !Number.isInteger(cuposNumero) ||
      cuposNumero <= 0
    ) {
      Alert.alert(
        'Cupos inválidos',
        'Ingresa una cantidad válida de jugadores faltantes.'
      );

      return;
    }


    try {
      setGuardandoEvento(true);


      // ------------------------------------------------------
      // OBTENER USUARIO ACTUAL
      // ------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');

        return;
      }


      // ------------------------------------------------------
      // INSERTAR EVENTO EN SUPABASE
      // ------------------------------------------------------

      const {
        error: crearError,
      } = await supabase
        .from('events')
        .insert({
          creator_id:
            user.id,

          title:
            titulo.trim(),

          sport:
            deporte,

          location:
            lugar.trim(),

          date_text:
            fecha.trim(),

          slots:
            cuposNumero,

          updated_at:
            new Date().toISOString(),
        });


      if (crearError) {
        throw crearError;
      }


      // ------------------------------------------------------
      // LIMPIAR FORMULARIO
      // ------------------------------------------------------

      setTitulo('');

      setDeporte('Fútbol');

      setLugar('');

      setFecha('');

      setCupos('');


      // Cerramos el modal.
      setModalCrear(false);


      // Recargamos eventos desde Supabase.
      await cargarEventos();


      Alert.alert(
        '¡Éxito!',
        'Partido publicado correctamente.'
      );
    } catch (error: any) {
      console.log(
        'Error creando evento:',
        error
      );


      Alert.alert(
        'Error al crear',
        error?.message ??
          'No se pudo publicar el evento.'
      );
    } finally {
      setGuardandoEvento(false);
    }
  }


  // ==========================================================
  // UNIRSE A UN EVENTO
  // ==========================================================

  async function handleUnirse(
    id: string
  ) {
    const evento =
      eventos.find(
        (item) =>
          item.id === id
      );


    // Verificación adicional.
    if (!evento) {
      return;
    }


    // No permitimos unirse si ya no quedan cupos.
    if (evento.cupos <= 0) {
      Alert.alert(
        'Evento completo',
        'Este partido ya no tiene cupos disponibles.'
      );

      return;
    }


    try {
      setEventoProcesando(id);


      // ------------------------------------------------------
      // OBTENER USUARIO
      // ------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');

        return;
      }


      // ------------------------------------------------------
      // REGISTRAR PARTICIPACIÓN
      // ------------------------------------------------------

      const {
        error: unirseError,
      } = await supabase
        .from(
          'event_participants'
        )
        .insert({
          event_id:
            id,

          user_id:
            user.id,
        });


      if (unirseError) {
        // Código 23505:
        // registro duplicado por clave primaria.
        if (
          unirseError.code ===
          '23505'
        ) {
          Alert.alert(
            'Ya estás inscrito',
            'Ya participas en este evento.'
          );

          return;
        }

        throw unirseError;
      }


      // Actualizamos la lista.
      await cargarEventos();


      Alert.alert(
        '¡Te has unido!',
        'Ahora este evento aparece en "Mis Partidos".'
      );
    } catch (error: any) {
      console.log(
        'Error uniéndose al evento:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo completar la inscripción.'
      );
    } finally {
      setEventoProcesando(null);
    }
  }


  // ==========================================================
  // CANCELAR PARTICIPACIÓN
  // ==========================================================

  async function handleCancelarParticipacion(
    id: string
  ) {
    try {
      setEventoProcesando(id);


      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');

        return;
      }


      // Eliminamos únicamente la participación del usuario.
      const {
        error: cancelarError,
      } = await supabase
        .from(
          'event_participants'
        )
        .delete()
        .eq(
          'event_id',
          id
        )
        .eq(
          'user_id',
          user.id
        );


      if (cancelarError) {
        throw cancelarError;
      }


      await cargarEventos();


      Alert.alert(
        'Participación cancelada',
        'Ya no estás inscrito en este partido.'
      );
    } catch (error: any) {
      console.log(
        'Error cancelando participación:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo cancelar la participación.'
      );
    } finally {
      setEventoProcesando(null);
    }
  }


  // ==========================================================
  // FILTRAR EVENTOS
  // ==========================================================

  const eventosFiltrados =
    eventos.filter((ev) => {
      // Filtro por deporte.
      const coincideFiltro =
        filtroDeporte === 'Todos' ||
        ev.deporte === filtroDeporte;


      // Búsqueda por título o lugar.
      const coincideBusqueda =
        ev.titulo
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          ) ||
        ev.lugar
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          );


      // En "Mis Partidos" mostramos:
      // - eventos creados por el usuario;
      // - eventos donde está inscrito.
      if (
        vista ===
        'mis_eventos'
      ) {
        return (
          (
            ev.unido ||
            ev.esMio
          ) &&
          coincideFiltro &&
          coincideBusqueda
        );
      }


      return (
        coincideFiltro &&
        coincideBusqueda
      );
    });


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <View
        style={
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={[
            styles.headerTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Eventos Deportivos
        </Text>


        {/* ==================================================
            BUSCADOR
        ================================================== */}

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,

              color:
                colors.text,
            },
          ]}
          placeholder="🔍 Buscar por cancha, ciudad o título..."
          placeholderTextColor={
            colors.secondaryText
          }
          value={busqueda}
          onChangeText={
            setBusqueda
          }
        />


        {/* ==================================================
            FILTROS POR DEPORTE
        ================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={
            styles.categories
          }
        >
          {[
            'Todos',
            'Fútbol',
            'Pádel',
            'Tenis',
            'Básquet',
          ].map((dep) => {
            const activo =
              filtroDeporte ===
              dep;


            return (
              <TouchableOpacity
                key={dep}
                style={[
                  styles.chip,
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
                  setFiltroDeporte(
                    dep
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        activo
                          ? '#FFFFFF'
                          : colors.secondaryText,

                      fontWeight:
                        activo
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


        {/* ==================================================
            DISPONIBLES / MIS PARTIDOS
        ================================================== */}

        <View
          style={[
            styles.tabHeader,
            {
              backgroundColor:
                isDark
                  ? '#1E293B'
                  : '#E2E8F0',

              borderColor:
                colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,

              vista ===
                'disponibles' && {
                backgroundColor:
                  colors.card,
              },
            ]}
            onPress={() =>
              setVista(
                'disponibles'
              )
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    vista ===
                    'disponibles'
                      ? colors.primary
                      : colors.secondaryText,

                  fontWeight:
                    vista ===
                    'disponibles'
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

              vista ===
                'mis_eventos' && {
                backgroundColor:
                  colors.card,
              },
            ]}
            onPress={() =>
              setVista(
                'mis_eventos'
              )
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    vista ===
                    'mis_eventos'
                      ? colors.primary
                      : colors.secondaryText,

                  fontWeight:
                    vista ===
                    'mis_eventos'
                      ? 'bold'
                      : '600',
                },
              ]}
            >
              Mis Partidos
            </Text>
          </TouchableOpacity>
        </View>


        {/* ==================================================
            LISTA DE EVENTOS
        ================================================== */}

        {cargandoEventos ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Cargando eventos...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom: 80,
            }}
          >
            {eventosFiltrados.length ===
            0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                No se encontraron partidos en esta categoría.
              </Text>
            ) : (
              eventosFiltrados.map(
                (item) => (
                  <View
                    key={
                      item.id
                    }
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor:
                          colors.card,

                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    {/* Cabecera */}

                    <View
                      style={
                        styles.cardHeader
                      }
                    >
                      <Text
                        style={[
                          styles.eventTag,
                          {
                            color:
                              isDark
                                ? '#93C5FD'
                                : '#2563EB',
                          },
                        ]}
                      >
                        ⚽{' '}
                        {item.deporte.toUpperCase()}
                      </Text>


                      <Text
                        style={
                          styles.eventSlots
                        }
                      >
                        {item.esMio
                          ? '👑 Organizado por ti'
                          : item.cupos >
                            0
                          ? `Faltan ${item.cupos} jugadores`
                          : 'Sin cupos'}
                      </Text>
                    </View>


                    {/* Título */}

                    <Text
                      style={[
                        styles.eventTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {item.titulo}
                    </Text>


                    {/* Lugar */}

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


                    {/* Fecha */}

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


                    {/* ========================================
                        EVENTO CREADO POR EL USUARIO
                    ======================================== */}

                    {item.esMio ? (
                      <View
                        style={[
                          styles.organizerBadge,
                          {
                            backgroundColor:
                              isDark
                                ? '#312E81'
                                : '#EEF2FF',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.organizerBadgeText,
                            {
                              color:
                                isDark
                                  ? '#C7D2FE'
                                  : '#4338CA',
                            },
                          ]}
                        >
                          👑 Este evento fue creado por ti
                        </Text>
                      </View>
                    ) : item.unido ? (
                      <>
                        {/* ====================================
                            YA ESTÁ INSCRITO
                        ==================================== */}

                        <View
                          style={[
                            styles.joinedBadge,
                            {
                              backgroundColor:
                                isDark
                                  ? '#153C2B'
                                  : '#DCFCE7',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.joinedBadgeText,
                              {
                                color:
                                  isDark
                                    ? '#86EFAC'
                                    : '#15803D',
                              },
                            ]}
                          >
                            ✓ Ya estás anotado
                          </Text>
                        </View>


                        {/* Cancelar participación */}

                        <TouchableOpacity
                          style={[
                            styles.cancelBtn,
                            {
                              borderColor:
                                colors.dangerText,
                            },
                          ]}
                          disabled={
                            eventoProcesando ===
                            item.id
                          }
                          onPress={() =>
                            handleCancelarParticipacion(
                              item.id
                            )
                          }
                        >
                          {eventoProcesando ===
                          item.id ? (
                            <ActivityIndicator
                              size="small"
                              color={
                                colors.dangerText
                              }
                            />
                          ) : (
                            <Text
                              style={[
                                styles.cancelBtnText,
                                {
                                  color:
                                    colors.dangerText,
                                },
                              ]}
                            >
                              Cancelar participación
                            </Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : item.cupos >
                      0 ? (
                      /* ======================================
                         UNIRSE
                      ====================================== */

                      <TouchableOpacity
                        style={[
                          styles.joinBtn,
                          {
                            backgroundColor:
                              isDark
                                ? '#1E3A5F'
                                : '#EFF6FF',

                            borderColor:
                              isDark
                                ? '#334E68'
                                : '#DBEAFE',
                          },
                        ]}
                        disabled={
                          eventoProcesando ===
                          item.id
                        }
                        onPress={() =>
                          handleUnirse(
                            item.id
                          )
                        }
                      >
                        {eventoProcesando ===
                        item.id ? (
                          <ActivityIndicator
                            size="small"
                            color={
                              isDark
                                ? '#93C5FD'
                                : '#2563EB'
                            }
                          />
                        ) : (
                          <Text
                            style={[
                              styles.joinBtnText,
                              {
                                color:
                                  isDark
                                    ? '#93C5FD'
                                    : '#2563EB',
                              },
                            ]}
                          >
                            Unirme al Partido
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      /* ======================================
                         EVENTO LLENO
                      ====================================== */

                      <View
                        style={[
                          styles.fullBadge,
                          {
                            backgroundColor:
                              isDark
                                ? '#3F1D1D'
                                : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.fullBadgeText,
                            {
                              color:
                                isDark
                                  ? '#FCA5A5'
                                  : '#B91C1C',
                            },
                          ]}
                        >
                          Partido completo
                        </Text>
                      </View>
                    )}
                  </View>
                )
              )
            )}
          </ScrollView>
        )}


        {/* ==================================================
            BOTÓN FLOTANTE +
        ================================================== */}

        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            setModalCrear(true)
          }
        >
          <Text
            style={
              styles.fabText
            }
          >
            +
          </Text>
        </TouchableOpacity>


        {/* ==================================================
            MODAL PARA CREAR EVENTO
        ================================================== */}

        <Modal
          visible={
            modalCrear
          }
          animationType="slide"
          transparent
          onRequestClose={() =>
            setModalCrear(false)
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colors.card,
                },
              ]}
            >
              {/* Header */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Crear Nuevo Partido
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setModalCrear(
                      false
                    )
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


              {/* Título */}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color:
                      colors.text,
                  },
                ]}
                placeholder="Título del partido"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={
                  titulo
                }
                onChangeText={
                  setTitulo
                }
              />


              {/* Selector de deporte */}

              <View
                style={
                  styles.deporteSelector
                }
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
                      key={
                        dep
                      }
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
                        setDeporte(
                          dep
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.depChipText,
                          {
                            color:
                              activo
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


              {/* Lugar */}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color:
                      colors.text,
                  },
                ]}
                placeholder="Ubicación / Cancha"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={
                  lugar
                }
                onChangeText={
                  setLugar
                }
              />


              {/* Fecha */}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color:
                      colors.text,
                  },
                ]}
                placeholder="Fecha y Hora (Ej: Hoy 20:00)"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={
                  fecha
                }
                onChangeText={
                  setFecha
                }
              />


              {/* Cupos */}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color:
                      colors.text,
                  },
                ]}
                placeholder="Jugadores faltantes (Ej: 3)"
                placeholderTextColor={
                  colors.secondaryText
                }
                value={
                  cupos
                }
                onChangeText={
                  setCupos
                }
                keyboardType="numeric"
              />


              {/* Publicar */}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,

                    opacity:
                      guardandoEvento
                        ? 0.7
                        : 1,
                  },
                ]}
                onPress={
                  handleCrearEvento
                }
                disabled={
                  guardandoEvento
                }
              >
                {guardandoEvento ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Publicar Evento
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}


// ============================================================
// ESTILOS
// ============================================================

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


  // ==========================================================
  // CARGA
  // ==========================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },


  loadingText: {
    fontSize: 14,
  },


  // ==========================================================
  // EVENTOS
  // ==========================================================

  eventCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },


  cardHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 8,
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


  // ==========================================================
  // BOTÓN UNIRSE
  // ==========================================================

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


  // ==========================================================
  // INSCRIPCIÓN ACTIVA
  // ==========================================================

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


  // ==========================================================
  // ORGANIZADOR
  // ==========================================================

  organizerBadge: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },


  organizerBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
  },


  // ==========================================================
  // CANCELAR PARTICIPACIÓN
  // ==========================================================

  cancelBtn: {
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
  },


  cancelBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },


  // ==========================================================
  // EVENTO COMPLETO
  // ==========================================================

  fullBadge: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },


  fullBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
  },


  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },


  // ==========================================================
  // BOTÓN FLOTANTE
  // ==========================================================

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


  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    justifyContent:
      'flex-end',
  },


  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },


  modalHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
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
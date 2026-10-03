// ============================================================
// FITMATCH - EVENTOS DEPORTIVOS
// ============================================================
//
// Esta pantalla permite:
//
// - Cargar eventos reales desde Supabase.
// - Crear nuevos eventos.
// - Ver eventos disponibles.
// - Ver eventos creados por el usuario.
// - Ver eventos a los que el usuario se ha unido.
// - Unirse a eventos.
// - Cancelar participación con confirmación.
// - Calcular cupos restantes.
// - Buscar y filtrar eventos.
// - Abrir el detalle completo de cada evento.
// - Mostrar estados de carga.
// - Mostrar estados vacíos contextuales.
// - Mostrar errores comprensibles.
// - Permitir reintentar cuando falla la carga.
// - Mantener compatibilidad con modo claro / oscuro.
//
// Tablas:
//
// public.events
// public.event_participants
//
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

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  supabase,
} from '../../lib/supabase';

import {
  useTheme,
} from '../../lib/ThemeContext';


// ============================================================
// INTERFAZ DE EVENTO
// ============================================================

interface Evento {
  id: string;

  titulo: string;

  deporte: string;

  lugar: string;

  fecha: string;

  // Cupos actualmente disponibles.
  cupos: number;

  // Cupos originalmente publicados.
  cuposTotales: number;

  // UUID del organizador.
  creatorId: string;

  // Indica si el usuario actual creó el evento.
  esMio: boolean;

  // Indica si el usuario actual participa.
  unido: boolean;
}


// ============================================================
// ESTADO VACÍO
// ============================================================

interface EstadoVacio {
  icono: string;

  titulo: string;

  descripcion: string;

  accion?:
    | 'reintentar'
    | 'crear'
    | 'limpiar'
    | 'disponibles';

  textoAccion?: string;
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EventosScreen() {
  const router =
    useRouter();


  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS GENERALES
  // ==========================================================

  const [
    vista,
    setVista,
  ] =
    useState<
      'disponibles' |
      'mis_eventos'
    >(
      'disponibles'
    );


  const [
    filtroDeporte,
    setFiltroDeporte,
  ] =
    useState<string>(
      'Todos'
    );


  const [
    busqueda,
    setBusqueda,
  ] =
    useState<string>(
      ''
    );


  const [
    modalCrear,
    setModalCrear,
  ] =
    useState<boolean>(
      false
    );


  const [
    eventos,
    setEventos,
  ] =
    useState<Evento[]>(
      []
    );


  const [
    cargandoEventos,
    setCargandoEventos,
  ] =
    useState(
      true
    );


  const [
    guardandoEvento,
    setGuardandoEvento,
  ] =
    useState(
      false
    );


  const [
    eventoProcesando,
    setEventoProcesando,
  ] =
    useState<
      string |
      null
    >(
      null
    );


  // ==========================================================
  // RF18 - ERROR DE CARGA
  // ==========================================================
  //
  // En lugar de dejar una pantalla vacía después de un error,
  // conservamos un estado visible que permite reintentar.
  // ==========================================================

  const [
    errorCarga,
    setErrorCarga,
  ] =
    useState<
      string |
      null
    >(
      null
    );


  // ==========================================================
  // FORMULARIO CREAR EVENTO
  // ==========================================================

  const [
    titulo,
    setTitulo,
  ] =
    useState(
      ''
    );


  const [
    deporte,
    setDeporte,
  ] =
    useState(
      'Fútbol'
    );


  const [
    lugar,
    setLugar,
  ] =
    useState(
      ''
    );


  const [
    fecha,
    setFecha,
  ] =
    useState(
      ''
    );


  const [
    cupos,
    setCupos,
  ] =
    useState(
      ''
    );


  // ==========================================================
  // RECARGAR EVENTOS AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(
      () => {
        cargarEventos();
      },
      []
    )
  );


  // ==========================================================
  // CARGAR EVENTOS
  // ==========================================================

  async function cargarEventos() {
    try {
      setCargandoEventos(
        true
      );


      setErrorCarga(
        null
      );


      // ------------------------------------------------------
      // 1. USUARIO AUTENTICADO
      // ------------------------------------------------------

      const {
        data: {
          user,
        },

        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError
      ) {
        throw userError;
      }


      if (
        !user
      ) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );


        router.replace(
          '/login'
        );


        return;
      }


      // ------------------------------------------------------
      // 2. OBTENER EVENTOS
      // ------------------------------------------------------

      const {
        data:
          eventosData,

        error:
          eventosError,
      } =
        await supabase
          .from(
            'events'
          )
          .select(`
            id,
            creator_id,
            title,
            sport,
            location,
            date_text,
            slots,
            created_at
          `)
          .order(
            'created_at',
            {
              ascending:
                false,
            }
          );


      if (
        eventosError
      ) {
        throw eventosError;
      }


      // ------------------------------------------------------
      // SIN EVENTOS
      // ------------------------------------------------------

      if (
        !eventosData ||
        eventosData.length ===
          0
      ) {
        setEventos(
          []
        );


        return;
      }


      // ------------------------------------------------------
      // 3. PARTICIPANTES
      // ------------------------------------------------------

      const {
        data:
          participantesData,

        error:
          participantesError,
      } =
        await supabase
          .from(
            'event_participants'
          )
          .select(`
            event_id,
            user_id
          `);


      if (
        participantesError
      ) {
        throw participantesError;
      }


      const participantes =
        participantesData ??
        [];


      // ------------------------------------------------------
      // 4. TRANSFORMAR EVENTOS
      // ------------------------------------------------------

      const eventosTransformados:
        Evento[] =
        eventosData.map(
          (
            evento
          ) => {
            const participantesEvento =
              participantes.filter(
                (
                  participante
                ) =>
                  participante.event_id ===
                  evento.id
              );


            const cantidadParticipantes =
              participantesEvento.length;


            const cuposTotales =
              Number(
                evento.slots
              );


            const cuposRestantes =
              Math.max(
                cuposTotales -
                  cantidadParticipantes,
                0
              );


            const usuarioEstaUnido =
              participantesEvento.some(
                (
                  participante
                ) =>
                  participante.user_id ===
                  user.id
              );


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
          }
        );


      setEventos(
        eventosTransformados
      );
    } catch (
      error: any
    ) {
      // ------------------------------------------------------
      // RF18
      // ------------------------------------------------------
      //
      // El error técnico queda disponible en consola.
      //
      // Al usuario no le mostramos directamente el mensaje
      // interno entregado por Supabase.
      // ------------------------------------------------------

      console.log(
        'Error cargando eventos:',
        error
      );


      setEventos(
        []
      );


      setErrorCarga(
        'No pudimos cargar los eventos. Revisa tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setCargandoEventos(
        false
      );
    }
  }


  // ==========================================================
  // CREAR EVENTO
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
        'Completa el título, lugar, fecha/hora y cantidad de cupos antes de publicar.'
      );


      return;
    }


    // --------------------------------------------------------
    // VALIDAR CUPOS
    // --------------------------------------------------------

    const cuposNumero =
      Number(
        cupos
      );


    if (
      !Number.isInteger(
        cuposNumero
      ) ||
      cuposNumero <=
        0
    ) {
      Alert.alert(
        'Cupos inválidos',
        'Ingresa un número entero mayor a 0 para los jugadores faltantes.'
      );


      return;
    }


    try {
      setGuardandoEvento(
        true
      );


      // ------------------------------------------------------
      // USUARIO
      // ------------------------------------------------------

      const {
        data: {
          user,
        },

        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError
      ) {
        throw userError;
      }


      if (
        !user
      ) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );


        router.replace(
          '/login'
        );


        return;
      }


      // ------------------------------------------------------
      // INSERTAR EVENTO
      // ------------------------------------------------------

      const {
        error:
          crearError,
      } =
        await supabase
          .from(
            'events'
          )
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
              new Date()
                .toISOString(),
          });


      if (
        crearError
      ) {
        throw crearError;
      }


      // ------------------------------------------------------
      // LIMPIAR FORMULARIO
      // ------------------------------------------------------
      //
      // Solo limpiamos los campos DESPUÉS de comprobar que
      // Supabase guardó correctamente el evento.
      //
      // Si ocurre un error, el usuario conserva lo escrito.
      // ------------------------------------------------------

      setTitulo(
        ''
      );


      setDeporte(
        'Fútbol'
      );


      setLugar(
        ''
      );


      setFecha(
        ''
      );


      setCupos(
        ''
      );


      setModalCrear(
        false
      );


      // ------------------------------------------------------
      // ACTUALIZAR LISTA
      // ------------------------------------------------------

      await cargarEventos();


      Alert.alert(
        '¡Éxito!',
        'Partido publicado correctamente.'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error creando evento:',
        error
      );


      Alert.alert(
        'No se pudo publicar',
        'Ocurrió un problema al guardar el evento. Revisa tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setGuardandoEvento(
        false
      );
    }
  }


  // ==========================================================
  // UNIRSE A EVENTO
  // ==========================================================

  async function handleUnirse(
    id: string
  ) {
    // --------------------------------------------------------
    // COMPROBAR QUE EL EVENTO SIGUE EXISTIENDO
    // --------------------------------------------------------

    const evento =
      eventos.find(
        (
          item
        ) =>
          item.id ===
          id
      );


    if (
      !evento
    ) {
      Alert.alert(
        'Evento no disponible',
        'Este partido ya no está disponible. Actualiza la lista e inténtalo nuevamente.'
      );


      return;
    }


    // --------------------------------------------------------
    // EVENTO PROPIO
    // --------------------------------------------------------

    if (
      evento.esMio
    ) {
      Alert.alert(
        'Eres el organizador',
        'No necesitas inscribirte en un partido que tú mismo organizaste.'
      );


      return;
    }


    // --------------------------------------------------------
    // YA INSCRITO
    // --------------------------------------------------------

    if (
      evento.unido
    ) {
      Alert.alert(
        'Ya estás inscrito',
        'Ya participas en este evento.'
      );


      return;
    }


    // --------------------------------------------------------
    // SIN CUPOS
    // --------------------------------------------------------

    if (
      evento.cupos <=
      0
    ) {
      Alert.alert(
        'Evento completo',
        'Este partido ya no tiene cupos disponibles.'
      );


      return;
    }


    try {
      setEventoProcesando(
        id
      );


      // ------------------------------------------------------
      // USUARIO
      // ------------------------------------------------------

      const {
        data: {
          user,
        },

        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError
      ) {
        throw userError;
      }


      if (
        !user
      ) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );


        router.replace(
          '/login'
        );


        return;
      }


      // ------------------------------------------------------
      // INSERTAR PARTICIPACIÓN
      // ------------------------------------------------------

      const {
        error:
          unirseError,
      } =
        await supabase
          .from(
            'event_participants'
          )
          .insert({
            event_id:
              id,

            user_id:
              user.id,
          });


      if (
        unirseError
      ) {
        // ----------------------------------------------------
        // 23505 = registro duplicado.
        // ----------------------------------------------------

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


      // ------------------------------------------------------
      // RECARGAR EVENTOS
      // ------------------------------------------------------

      await cargarEventos();


      Alert.alert(
        '¡Te has unido!',
        'Ahora este evento aparece en "Mis Partidos".'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error uniéndose al evento:',
        error
      );


      Alert.alert(
        'No se pudo completar la inscripción',
        'Ocurrió un problema al inscribirte. Revisa tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setEventoProcesando(
        null
      );
    }
  }


  // ==========================================================
  // CONFIRMAR CANCELACIÓN
  // ==========================================================
  //
  // RF18:
  //
  // Una acción que elimina una participación no debe
  // producirse accidentalmente con un solo toque.
  // ==========================================================

  function confirmarCancelarParticipacion(
    id: string
  ) {
    const evento =
      eventos.find(
        (
          item
        ) =>
          item.id ===
          id
      );


    if (
      !evento
    ) {
      Alert.alert(
        'Evento no disponible',
        'Este partido ya no está disponible. Actualiza la lista e inténtalo nuevamente.'
      );


      return;
    }


    Alert.alert(
      'Cancelar participación',

      `¿Seguro que quieres salir de "${evento.titulo}"?`,

      [
        {
          text:
            'Volver',

          style:
            'cancel',
        },

        {
          text:
            'Sí, cancelar',

          style:
            'destructive',

          onPress: () =>
            handleCancelarParticipacion(
              id
            ),
        },
      ]
    );
  }


  // ==========================================================
  // CANCELAR PARTICIPACIÓN
  // ==========================================================

  async function handleCancelarParticipacion(
    id: string
  ) {
    try {
      setEventoProcesando(
        id
      );


      // ------------------------------------------------------
      // USUARIO
      // ------------------------------------------------------

      const {
        data: {
          user,
        },

        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError
      ) {
        throw userError;
      }


      if (
        !user
      ) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );


        router.replace(
          '/login'
        );


        return;
      }


      // ------------------------------------------------------
      // ELIMINAR PARTICIPACIÓN
      // ------------------------------------------------------

      const {
        error:
          cancelarError,
      } =
        await supabase
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


      if (
        cancelarError
      ) {
        throw cancelarError;
      }


      // ------------------------------------------------------
      // ACTUALIZAR
      // ------------------------------------------------------

      await cargarEventos();


      Alert.alert(
        'Participación cancelada',
        'Ya no estás inscrito en este partido.'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error cancelando participación:',
        error
      );


      Alert.alert(
        'No se pudo cancelar',
        'Ocurrió un problema al cancelar tu participación. Revisa tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setEventoProcesando(
        null
      );
    }
  }


  // ==========================================================
  // ABRIR DETALLE
  // ==========================================================

  function abrirDetalleEvento(
    id: string
  ) {
    router.push({
      pathname:
        '/evento/[eventId]',

      params: {
        eventId:
          id,
      },
    });
  }


  // ==========================================================
  // FILTRAR EVENTOS
  // ==========================================================

  const eventosFiltrados =
    eventos.filter(
      (
        ev
      ) => {
        // ----------------------------------------------------
        // FILTRO DE DEPORTE
        // ----------------------------------------------------

        const coincideFiltro =
          filtroDeporte ===
            'Todos' ||
          ev.deporte ===
            filtroDeporte;


        // ----------------------------------------------------
        // TEXTO DE BÚSQUEDA
        // ----------------------------------------------------

        const textoBusqueda =
          busqueda
            .trim()
            .toLowerCase();


        const coincideBusqueda =
          ev.titulo
            .toLowerCase()
            .includes(
              textoBusqueda
            ) ||
          ev.lugar
            .toLowerCase()
            .includes(
              textoBusqueda
            );


        // ----------------------------------------------------
        // MIS EVENTOS
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // DISPONIBLES
        // ----------------------------------------------------

        return (
          coincideFiltro &&
          coincideBusqueda
        );
      }
    );


  // ==========================================================
  // RF18 - ESTADO VACÍO CONTEXTUAL
  // ==========================================================

  function obtenerEstadoVacio():
    EstadoVacio {
    // --------------------------------------------------------
    // ERROR DE CONEXIÓN / SUPABASE
    // --------------------------------------------------------

    if (
      errorCarga
    ) {
      return {
        icono:
          '⚠️',

        titulo:
          'No pudimos cargar los eventos',

        descripcion:
          errorCarga,

        accion:
          'reintentar',

        textoAccion:
          'Reintentar',
      };
    }


    // --------------------------------------------------------
    // NO EXISTE NINGÚN EVENTO
    // --------------------------------------------------------

    if (
      eventos.length ===
      0
    ) {
      return {
        icono:
          '🏟️',

        titulo:
          'Aún no hay partidos publicados',

        descripcion:
          'Puedes crear el primer evento deportivo usando el botón de abajo.',

        accion:
          'crear',

        textoAccion:
          'Crear partido',
      };
    }


    // --------------------------------------------------------
    // BÚSQUEDA SIN RESULTADOS
    // --------------------------------------------------------

    if (
      busqueda
        .trim()
        .length >
      0
    ) {
      return {
        icono:
          '🔎',

        titulo:
          'Sin resultados',

        descripcion:
          `No encontramos partidos para "${busqueda.trim()}" con la configuración actual.`,

        accion:
          'limpiar',

        textoAccion:
          'Limpiar búsqueda y filtros',
      };
    }


    // --------------------------------------------------------
    // FILTRO DE DEPORTE SIN RESULTADOS
    // --------------------------------------------------------

    if (
      filtroDeporte !==
      'Todos'
    ) {
      return {
        icono:
          '🏅',

        titulo:
          'No hay partidos con este filtro',

        descripcion:
          `No encontramos eventos de ${filtroDeporte} en esta vista.`,

        accion:
          'limpiar',

        textoAccion:
          'Mostrar todos',
      };
    }


    // --------------------------------------------------------
    // MIS PARTIDOS VACÍO
    // --------------------------------------------------------

    if (
      vista ===
      'mis_eventos'
    ) {
      return {
        icono:
          '📅',

        titulo:
          'Todavía no tienes partidos',

        descripcion:
          'Aún no organizas ni participas en ningún evento. Puedes revisar los partidos disponibles.',

        accion:
          'disponibles',

        textoAccion:
          'Ver disponibles',
      };
    }


    // --------------------------------------------------------
    // DISPONIBLES VACÍO
    // --------------------------------------------------------

    return {
      icono:
        '🏅',

      titulo:
        'No hay partidos disponibles',

      descripcion:
        'No encontramos eventos disponibles en este momento.',

      accion:
        'reintentar',

      textoAccion:
        'Actualizar',
    };
  }


  // ==========================================================
  // ACCIÓN DEL ESTADO VACÍO
  // ==========================================================

  function ejecutarAccionEstadoVacio(
    accion:
      EstadoVacio['accion']
  ) {
    switch (
      accion
    ) {
      case 'reintentar':
        cargarEventos();
        break;


      case 'crear':
        setModalCrear(
          true
        );
        break;


      case 'limpiar':
        setBusqueda(
          ''
        );

        setFiltroDeporte(
          'Todos'
        );
        break;


      case 'disponibles':
        setVista(
          'disponibles'
        );
        break;


      default:
        break;
    }
  }


  const estadoVacio =
    obtenerEstadoVacio();


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
          value={
            busqueda
          }
          onChangeText={
            setBusqueda
          }
        />


        {/* ==================================================
            FILTROS DE DEPORTE
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
          ].map(
            (
              dep
            ) => {
              const activo =
                filtroDeporte ===
                dep;


              return (
                <TouchableOpacity
                  key={
                    dep
                  }
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
            }
          )}
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
          {/* DISPONIBLES */}

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


          {/* MIS PARTIDOS */}

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
            CARGANDO
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
        ) : eventosFiltrados.length ===
          0 ? (

          // ==================================================
          // RF18 - ESTADO VACÍO / ERROR
          // ==================================================

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.emptyScrollContent
            }
          >
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor:
                    colors.card,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              {/* ICONO */}

              <Text
                style={
                  styles.emptyIcon
                }
              >
                {estadoVacio.icono}
              </Text>


              {/* TÍTULO */}

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {estadoVacio.titulo}
              </Text>


              {/* DESCRIPCIÓN */}

              <Text
                style={[
                  styles.emptyDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {estadoVacio.descripcion}
              </Text>


              {/* ACCIÓN */}

              {estadoVacio.accion &&
                estadoVacio.textoAccion && (
                  <TouchableOpacity
                    style={[
                      styles.emptyActionButton,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      ejecutarAccionEstadoVacio(
                        estadoVacio.accion
                      )
                    }
                  >
                    <Text
                      style={
                        styles.emptyActionButtonText
                      }
                    >
                      {estadoVacio.textoAccion}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </ScrollView>
        ) : (

          // ==================================================
          // LISTA DE EVENTOS
          // ==================================================

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom:
                80,
            }}
          >
            {eventosFiltrados.map(
              (
                item
              ) => (
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
                  {/* ========================================
                      CABECERA
                  ======================================== */}

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
                      ⚽ {item.deporte.toUpperCase()}
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


                  {/* ========================================
                      TÍTULO
                  ======================================== */}

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


                  {/* ========================================
                      LUGAR
                  ======================================== */}

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


                  {/* ========================================
                      FECHA
                  ======================================== */}

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
                      VER DETALLE
                  ======================================== */}

                  <TouchableOpacity
                    style={[
                      styles.detailButton,
                      {
                        borderColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      abrirDetalleEvento(
                        item.id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.detailButtonText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      Ver detalle
                    </Text>
                  </TouchableOpacity>


                  {/* ========================================
                      EVENTO PROPIO
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

                    // ========================================
                    // YA INSCRITO
                    // ========================================

                    <>
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


                      {/* CANCELAR */}

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
                          confirmarCancelarParticipacion(
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

                    // ========================================
                    // UNIRSE
                    // ========================================

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

                    // ========================================
                    // EVENTO LLENO
                    // ========================================

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
            setModalCrear(
              true
            )
          }
          accessibilityLabel="Crear nuevo partido"
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
            MODAL CREAR EVENTO
        ================================================== */}

        <Modal
          visible={
            modalCrear
          }
          animationType="slide"
          transparent
          onRequestClose={() =>
            setModalCrear(
              false
            )
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
              {/* ============================================
                  HEADER MODAL
              ============================================ */}

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
                  disabled={
                    guardandoEvento
                  }
                >
                  <Text
                    style={[
                      styles.closeButton,
                      {
                        color:
                          colors.secondaryText,

                        opacity:
                          guardandoEvento
                            ? 0.5
                            : 1,
                      },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>


              {/* ============================================
                  TÍTULO
              ============================================ */}

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
                editable={
                  !guardandoEvento
                }
              />


              {/* ============================================
                  DEPORTE
              ============================================ */}

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
                ].map(
                  (
                    dep
                  ) => {
                    const activo =
                      deporte ===
                      dep;


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

                            opacity:
                              guardandoEvento
                                ? 0.6
                                : 1,
                          },
                        ]}
                        disabled={
                          guardandoEvento
                        }
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
                  }
                )}
              </View>


              {/* ============================================
                  LUGAR
              ============================================ */}

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
                editable={
                  !guardandoEvento
                }
              />


              {/* ============================================
                  FECHA
              ============================================ */}

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
                editable={
                  !guardandoEvento
                }
              />


              {/* ============================================
                  CUPOS
              ============================================ */}

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
                editable={
                  !guardandoEvento
                }
              />


              {/* ============================================
                  PUBLICAR
              ============================================ */}

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

const styles =
  StyleSheet.create({
    // ========================================================
    // GENERAL
    // ========================================================

    safeArea: {
      flex: 1,
    },


    container: {
      flex: 1,

      padding: 16,
    },


    headerTitle: {
      fontSize: 24,

      fontWeight:
        'bold',

      marginBottom: 12,
    },


    // ========================================================
    // BUSCADOR
    // ========================================================

    searchInput: {
      borderWidth: 1,

      padding: 12,

      borderRadius: 10,

      fontSize: 14,

      marginBottom: 12,
    },


    // ========================================================
    // CATEGORÍAS
    // ========================================================

    categories: {
      flexDirection:
        'row',

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


    // ========================================================
    // PESTAÑAS
    // ========================================================

    tabHeader: {
      flexDirection:
        'row',

      borderRadius: 10,

      padding: 3,

      marginBottom: 14,

      borderWidth: 1,
    },


    tabButton: {
      flex: 1,

      paddingVertical: 8,

      alignItems:
        'center',

      borderRadius: 8,
    },


    tabText: {
      fontSize: 13,
    },


    // ========================================================
    // CARGA
    // ========================================================

    loadingContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      gap: 12,
    },


    loadingText: {
      fontSize: 14,
    },


    // ========================================================
    // RF18 - ESTADO VACÍO / ERROR
    // ========================================================

    emptyScrollContent: {
      flexGrow: 1,

      justifyContent:
        'center',

      paddingBottom: 80,
    },


    emptyCard: {
      width:
        '100%',

      maxWidth:
        520,

      alignSelf:
        'center',

      alignItems:
        'center',

      borderWidth:
        1,

      borderRadius:
        16,

      paddingHorizontal:
        22,

      paddingVertical:
        28,
    },


    emptyIcon: {
      fontSize:
        46,

      marginBottom:
        12,
    },


    emptyTitle: {
      fontSize:
        18,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    emptyDescription: {
      fontSize:
        13,

      lineHeight:
        20,

      textAlign:
        'center',

      marginTop:
        8,

      maxWidth:
        420,
    },


    emptyActionButton: {
      marginTop:
        18,

      paddingHorizontal:
        20,

      paddingVertical:
        11,

      borderRadius:
        10,
    },


    emptyActionButtonText: {
      color:
        '#FFFFFF',

      fontSize:
        13,

      fontWeight:
        'bold',
    },


    // ========================================================
    // EVENTOS
    // ========================================================

    eventCard: {
      padding:
        16,

      borderRadius:
        14,

      borderWidth:
        1,

      marginBottom:
        12,

      gap:
        4,
    },


    cardHeader: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      gap:
        8,
    },


    eventTag: {
      fontSize:
        11,

      fontWeight:
        'bold',
    },


    eventSlots: {
      fontSize:
        12,

      color:
        '#16A34A',

      fontWeight:
        'bold',
    },


    eventTitle: {
      fontSize:
        16,

      fontWeight:
        'bold',
    },


    eventDetails: {
      fontSize:
        13,
    },


    // ========================================================
    // VER DETALLE
    // ========================================================

    detailButton: {
      paddingVertical:
        9,

      borderRadius:
        8,

      borderWidth:
        1,

      alignItems:
        'center',

      marginTop:
        8,
    },


    detailButtonText: {
      fontSize:
        13,

      fontWeight:
        '700',
    },


    // ========================================================
    // UNIRSE
    // ========================================================

    joinBtn: {
      paddingVertical:
        10,

      borderRadius:
        8,

      alignItems:
        'center',

      marginTop:
        8,

      borderWidth:
        1,
    },


    joinBtnText: {
      fontWeight:
        'bold',

      fontSize:
        13,
    },


    // ========================================================
    // INSCRITO
    // ========================================================

    joinedBadge: {
      paddingVertical:
        8,

      borderRadius:
        8,

      alignItems:
        'center',

      marginTop:
        8,
    },


    joinedBadgeText: {
      fontWeight:
        'bold',

      fontSize:
        13,
    },


    // ========================================================
    // ORGANIZADOR
    // ========================================================

    organizerBadge: {
      paddingVertical:
        8,

      borderRadius:
        8,

      alignItems:
        'center',

      marginTop:
        8,
    },


    organizerBadgeText: {
      fontWeight:
        'bold',

      fontSize:
        13,
    },


    // ========================================================
    // CANCELAR
    // ========================================================

    cancelBtn: {
      paddingVertical:
        9,

      borderRadius:
        8,

      alignItems:
        'center',

      marginTop:
        6,

      borderWidth:
        1,
    },


    cancelBtnText: {
      fontWeight:
        '600',

      fontSize:
        13,
    },


    // ========================================================
    // EVENTO LLENO
    // ========================================================

    fullBadge: {
      paddingVertical:
        8,

      borderRadius:
        8,

      alignItems:
        'center',

      marginTop:
        8,
    },


    fullBadgeText: {
      fontWeight:
        'bold',

      fontSize:
        13,
    },


    // ========================================================
    // BOTÓN FLOTANTE
    // ========================================================

    fab: {
      position:
        'absolute',

      right:
        20,

      bottom:
        20,

      width:
        56,

      height:
        56,

      borderRadius:
        28,

      justifyContent:
        'center',

      alignItems:
        'center',

      elevation:
        5,

      shadowColor:
        '#000000',

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        5,
    },


    fabText: {
      color:
        '#FFFFFF',

      fontSize:
        28,

      fontWeight:
        'bold',

      lineHeight:
        30,
    },


    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex:
        1,

      backgroundColor:
        'rgba(0,0,0,0.55)',

      justifyContent:
        'flex-end',
    },


    modalContent: {
      borderTopLeftRadius:
        20,

      borderTopRightRadius:
        20,

      padding:
        20,

      gap:
        12,
    },


    modalHeader: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginBottom:
        6,
    },


    modalTitle: {
      fontSize:
        18,

      fontWeight:
        'bold',
    },


    closeButton: {
      fontSize:
        18,
    },


    input: {
      borderWidth:
        1,

      padding:
        12,

      borderRadius:
        10,

      fontSize:
        14,
    },


    deporteSelector: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        6,
    },


    depChip: {
      paddingHorizontal:
        12,

      paddingVertical:
        6,

      borderRadius:
        16,

      borderWidth:
        1,
    },


    depChipText: {
      fontSize:
        12,
    },


    primaryButton: {
      paddingVertical:
        14,

      borderRadius:
        10,

      alignItems:
        'center',

      marginTop:
        8,
    },


    primaryButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize:
        15,
    },
  });
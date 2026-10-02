// ============================================================
// FITMATCH - DETALLE DE EVENTO
// ============================================================
//
// Muestra:
// - Información real del evento.
// - Organizador.
// - Cupos.
// - Cantidad de inscritos.
// - Estado del usuario.
// - Unirse al evento.
// - Cancelar participación.
//
// Tablas:
// public.events
// public.event_participants
// public.profiles
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
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';


// ============================================================
// TIPOS
// ============================================================

interface EventoDetalle {
  id: string;
  creatorId: string;
  titulo: string;
  deporte: string;
  lugar: string;
  fecha: string;
  cuposTotales: number;
  participantes: number;
  cuposRestantes: number;
  esMio: boolean;
  unido: boolean;
  organizador: string;
}


// ============================================================
// COMPONENTE
// ============================================================

export default function EventoDetalleScreen() {
  const router = useRouter();

  const {
    eventId,
  } = useLocalSearchParams<{
    eventId: string;
  }>();

  const {
    isDark,
    colors,
  } = useTheme();


  const eventoId =
    Array.isArray(eventId)
      ? eventId[0]
      : eventId;


  const [
    evento,
    setEvento,
  ] = useState<EventoDetalle | null>(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    procesando,
    setProcesando,
  ] = useState(false);


  // ==========================================================
  // RECARGAR AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarDetalle();
    }, [eventoId])
  );


  // ==========================================================
  // CARGAR DETALLE
  // ==========================================================

  async function cargarDetalle() {
    if (!eventoId) {
      return;
    }


    try {
      setCargando(true);


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


      if (userError) {
        throw userError;
      }


      if (!user) {
        router.replace('/login');

        return;
      }


      // ------------------------------------------------------
      // EVENTO
      // ------------------------------------------------------

      const {
        data:
          eventoData,
        error:
          eventoError,
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
          slots
          `
        )
        .eq(
          'id',
          eventoId
        )
        .maybeSingle();


      if (eventoError) {
        throw eventoError;
      }


      if (!eventoData) {
        setEvento(null);

        return;
      }


      // ------------------------------------------------------
      // PARTICIPANTES
      // ------------------------------------------------------

      const {
        data:
          participantesData,
        error:
          participantesError,
      } = await supabase
        .from(
          'event_participants'
        )
        .select(
          `
          user_id
          `
        )
        .eq(
          'event_id',
          eventoId
        );


      if (participantesError) {
        throw participantesError;
      }


      const participantes =
        participantesData ??
        [];


      const cantidadParticipantes =
        participantes.length;


      const cuposTotales =
        Number(
          eventoData.slots
        );


      const cuposRestantes =
        Math.max(
          cuposTotales -
            cantidadParticipantes,
          0
        );


      const unido =
        participantes.some(
          (
            participante
          ) =>
            participante.user_id ===
            user.id
        );


      const esMio =
        eventoData.creator_id ===
        user.id;


      // ------------------------------------------------------
      // ORGANIZADOR
      // ------------------------------------------------------

      const {
        data:
          organizadorPerfil,
        error:
          organizadorError,
      } = await supabase
        .from('profiles')
        .select(
          `
          full_name
          `
        )
        .eq(
          'id',
          eventoData.creator_id
        )
        .maybeSingle();


      if (organizadorError) {
        throw organizadorError;
      }


      setEvento({
        id:
          eventoData.id,

        creatorId:
          eventoData.creator_id,

        titulo:
          eventoData.title,

        deporte:
          eventoData.sport,

        lugar:
          eventoData.location,

        fecha:
          eventoData.date_text,

        cuposTotales,

        participantes:
          cantidadParticipantes,

        cuposRestantes,

        esMio,

        unido,

        organizador:
          organizadorPerfil?.full_name ??
          'Usuario FitMatch',
      });
    } catch (
      error: any
    ) {
      console.log(
        'Error cargando detalle del evento:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo cargar el evento.'
      );
    } finally {
      setCargando(false);
    }
  }


  // ==========================================================
  // UNIRSE
  // ==========================================================

  async function handleUnirse() {
    if (
      !evento ||
      evento.esMio
    ) {
      return;
    }


    if (
      evento.cuposRestantes <=
      0
    ) {
      Alert.alert(
        'Evento completo',
        'Este partido ya no tiene cupos disponibles.'
      );

      return;
    }


    try {
      setProcesando(true);


      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        router.replace('/login');

        return;
      }


      const {
        error,
      } = await supabase
        .from(
          'event_participants'
        )
        .insert({
          event_id:
            evento.id,

          user_id:
            user.id,
        });


      if (error) {
        if (
          error.code ===
          '23505'
        ) {
          Alert.alert(
            'Ya estás inscrito',
            'Ya participas en este evento.'
          );

          return;
        }


        throw error;
      }


      await cargarDetalle();


      Alert.alert(
        '¡Te has unido!',
        'Tu inscripción quedó registrada correctamente.'
      );
    } catch (
      error: any
    ) {
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
      setProcesando(false);
    }
  }


  // ==========================================================
  // CANCELAR PARTICIPACIÓN
  // ==========================================================

  async function handleCancelar() {
    if (
      !evento
    ) {
      return;
    }


    try {
      setProcesando(true);


      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (userError) {
        throw userError;
      }


      if (!user) {
        router.replace('/login');

        return;
      }


      const {
        error,
      } = await supabase
        .from(
          'event_participants'
        )
        .delete()
        .eq(
          'event_id',
          evento.id
        )
        .eq(
          'user_id',
          user.id
        );


      if (error) {
        throw error;
      }


      await cargarDetalle();


      Alert.alert(
        'Participación cancelada',
        'Ya no estás inscrito en este evento.'
      );
    } catch (
      error: any
    ) {
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
      setProcesando(false);
    }
  }


  // ==========================================================
  // CARGANDO
  // ==========================================================

  if (cargando) {
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
            Cargando evento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // EVENTO NO ENCONTRADO
  // ==========================================================

  if (!evento) {
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
            styles.emptyContainer
          }
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            🏟️
          </Text>

          <Text
            style={[
              styles.emptyTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Evento no disponible
          </Text>

          <TouchableOpacity
            style={[
              styles.backMainButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backMainButtonText
              }
            >
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


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
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={[
                styles.backButtonText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>


          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Detalle del Evento
          </Text>
        </View>


        {/* TARJETA PRINCIPAL */}

        <View
          style={[
            styles.mainCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sportTag,
              {
                color:
                  isDark
                    ? '#93C5FD'
                    : '#2563EB',
              },
            ]}
          >
            ⚡ {evento.deporte.toUpperCase()}
          </Text>


          <Text
            style={[
              styles.eventTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {evento.titulo}
          </Text>


          <View
            style={
              styles.detailRow
            }
          >
            <Text
              style={
                styles.detailIcon
              }
            >
              📍
            </Text>

            <View
              style={
                styles.detailContent
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Lugar
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {evento.lugar}
              </Text>
            </View>
          </View>


          <View
            style={
              styles.detailRow
            }
          >
            <Text
              style={
                styles.detailIcon
              }
            >
              🕒
            </Text>

            <View
              style={
                styles.detailContent
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Fecha y hora
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {evento.fecha}
              </Text>
            </View>
          </View>


          <View
            style={
              styles.detailRow
            }
          >
            <Text
              style={
                styles.detailIcon
              }
            >
              👤
            </Text>

            <View
              style={
                styles.detailContent
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Organizador
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {evento.esMio
                  ? `${evento.organizador} (Tú)`
                  : evento.organizador}
              </Text>
            </View>
          </View>
        </View>


        {/* CUPOS */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            👥 Participación
          </Text>


          <View
            style={
              styles.statsRow
            }
          >
            <View
              style={
                styles.statBox
              }
            >
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {evento.participantes}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Inscritos
              </Text>
            </View>


            <View
              style={
                styles.statBox
              }
            >
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      evento.cuposRestantes >
                      0
                        ? '#16A34A'
                        : colors.dangerText,
                  },
                ]}
              >
                {evento.cuposRestantes}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Cupos disponibles
              </Text>
            </View>


            <View
              style={
                styles.statBox
              }
            >
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {evento.cuposTotales}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Cupos publicados
              </Text>
            </View>
          </View>
        </View>


        {/* ESTADO */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Estado
          </Text>


          {evento.esMio ? (
            <View
              style={[
                styles.statusBox,
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
                  styles.statusText,
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
          ) : evento.unido ? (
            <View
              style={[
                styles.statusBox,
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
                  styles.statusText,
                  {
                    color:
                      isDark
                        ? '#86EFAC'
                        : '#15803D',
                  },
                ]}
              >
                ✓ Estás inscrito en este evento
              </Text>
            </View>
          ) : evento.cuposRestantes >
            0 ? (
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    colors.primarySoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Hay cupos disponibles
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBox,
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
                  styles.statusText,
                  {
                    color:
                      colors.dangerText,
                  },
                ]}
              >
                Partido completo
              </Text>
            </View>
          )}
        </View>


        {/* ACCIONES */}

        {!evento.esMio &&
          evento.unido && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor:
                    colors.dangerText,
                },
              ]}
              disabled={
                procesando
              }
              onPress={
                handleCancelar
              }
            >
              {procesando ? (
                <ActivityIndicator
                  color={
                    colors.dangerText
                  }
                />
              ) : (
                <Text
                  style={[
                    styles.cancelButtonText,
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
          )}


        {!evento.esMio &&
          !evento.unido &&
          evento.cuposRestantes >
            0 && (
            <TouchableOpacity
              style={[
                styles.joinButton,
                {
                  backgroundColor:
                    colors.primary,

                  opacity:
                    procesando
                      ? 0.7
                      : 1,
                },
              ]}
              disabled={
                procesando
              }
              onPress={
                handleUnirse
              }
            >
              {procesando ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.joinButtonText
                  }
                >
                  Unirme al Partido
                </Text>
              )}
            </TouchableOpacity>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}


// ============================================================
// ESTILOS
// ============================================================

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },


    container: {
      padding: 20,

      paddingBottom: 40,
    },


    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 18,
    },


    backButton: {
      width: 40,

      height: 40,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginRight: 8,
    },


    backButtonText: {
      fontSize: 38,

      lineHeight: 38,
    },


    headerTitle: {
      fontSize: 22,

      fontWeight:
        'bold',
    },


    mainCard: {
      padding: 20,

      borderRadius: 18,

      borderWidth: 1,

      gap: 14,
    },


    sportTag: {
      fontSize: 12,

      fontWeight:
        'bold',
    },


    eventTitle: {
      fontSize: 24,

      fontWeight:
        'bold',
    },


    detailRow: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap: 10,
    },


    detailIcon: {
      fontSize: 21,

      width: 28,
    },


    detailContent: {
      flex: 1,
    },


    detailLabel: {
      fontSize: 11,
    },


    detailValue: {
      fontSize: 14,

      fontWeight:
        '600',

      marginTop: 2,
    },


    infoCard: {
      marginTop: 14,

      padding: 16,

      borderRadius: 14,

      borderWidth: 1,
    },


    sectionTitle: {
      fontSize: 15,

      fontWeight:
        'bold',

      marginBottom: 12,
    },


    statsRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      gap: 8,
    },


    statBox: {
      flex: 1,

      alignItems:
        'center',
    },


    statNumber: {
      fontSize: 22,

      fontWeight:
        'bold',
    },


    statLabel: {
      fontSize: 10,

      textAlign:
        'center',

      marginTop: 3,
    },


    statusBox: {
      padding: 12,

      borderRadius: 10,

      alignItems:
        'center',
    },


    statusText: {
      fontSize: 13,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    joinButton: {
      paddingVertical: 15,

      borderRadius: 12,

      alignItems:
        'center',

      marginTop: 18,
    },


    joinButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 15,
    },


    cancelButton: {
      paddingVertical: 14,

      borderRadius: 12,

      alignItems:
        'center',

      borderWidth: 1,

      marginTop: 18,
    },


    cancelButtonText: {
      fontWeight:
        '700',

      fontSize: 14,
    },


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


    emptyContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      padding: 30,
    },


    emptyEmoji: {
      fontSize: 60,
    },


    emptyTitle: {
      fontSize: 20,

      fontWeight:
        'bold',

      marginTop: 14,
    },


    backMainButton: {
      marginTop: 20,

      paddingHorizontal: 24,

      paddingVertical: 12,

      borderRadius: 10,
    },


    backMainButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',
    },
  });
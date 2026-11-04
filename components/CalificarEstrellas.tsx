// ============================================================
// FITMATCH - COMPONENTE DE CALIFICACIÓN CON ESTRELLAS
// ============================================================
//
// Modal reutilizable para calificar a otro deportista:
//
// - 5 estrellas táctiles (1 a 5).
// - Comentario opcional de máximo 500 caracteres.
// - Guarda en public.profile_ratings:
//
//     rater_id -> usuario actual
//     rated_id -> destinoId (quien recibe la calificación)
//     event_id -> eventId opcional (contexto del evento)
//
// - Si ya existe una calificación, la actualiza (updated_at).
//
// ============================================================

import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';


// ============================================================
// TIPOS
// ============================================================

interface Props {
  visible: boolean;

  nombreDestino: string;

  destinoId: string;

  eventId?: string | null;

  calificacionExistente?: {
    stars: number;

    comment: string | null;
  } | null;

  onGuardado?: () => void;

  onCerrar: () => void;
}


// ============================================================
// COMPONENTE
// ============================================================

export function CalificarEstrellas({
  visible,
  nombreDestino,
  destinoId,
  eventId,
  calificacionExistente,
  onGuardado,
  onCerrar,
}: Props) {
  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    estrellas,
    setEstrellas,
  ] = useState(0);


  const [
    comentario,
    setComentario,
  ] = useState('');


  const [
    guardando,
    setGuardando,
  ] = useState(false);


  // ==========================================================
  // PRECARGAR AL ABRIR
  // ==========================================================

  useEffect(
    () => {
      if (visible) {
        setEstrellas(
          calificacionExistente?.stars ?? 0
        );

        setComentario(
          calificacionExistente?.comment ?? ''
        );
      }
    },
    [
      visible,
      calificacionExistente,
    ]
  );


  // ==========================================================
  // GUARDAR CALIFICACIÓN
  // ==========================================================

  async function handleGuardar() {
    if (guardando) {
      return;
    }


    // 1. ESTRELLAS OBLIGATORIAS

    if (
      estrellas < 1 ||
      estrellas > 5
    ) {
      Alert.alert(
        'Calificación incompleta',
        'Selecciona de 1 a 5 estrellas antes de guardar.'
      );

      return;
    }


    // 2. USUARIO ACTUAL

    try {
      setGuardando(true);


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
        throw new Error(
          'Sesión no encontrada. Inicia sesión nuevamente.'
        );
      }


      // 3. ACTUALIZAR O INSERTAR

      if (calificacionExistente) {
        // ----------------------------------------------
        // YA EXISTE: actualizamos.
        // ----------------------------------------------

        let consulta = supabase
          .from('profile_ratings')
          .update({
            stars: estrellas,

            comment:
              comentario.trim() || null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'rater_id',
            user.id
          )
          .eq(
            'rated_id',
            destinoId
          );

        if (eventId) {
          consulta = consulta.eq(
            'event_id',
            eventId
          );
        } else {
          consulta = consulta.is(
            'event_id',
            null
          );
        }


        const {
          error,
        } = await consulta;

        if (error) {
          throw error;
        }
      } else {
        // ----------------------------------------------
        // NO EXISTE: insertamos una nueva.
        // ----------------------------------------------

        const {
          error,
        } = await supabase
          .from('profile_ratings')
          .insert({
            rater_id:
              user.id,

            rated_id:
              destinoId,

            event_id:
              eventId ?? null,

            stars: estrellas,

            comment:
              comentario.trim() || null,
          });

        if (error) {
          if (
            error.code ===
            '23505'
          ) {
            Alert.alert(
              'Ya calificaste',
              'Ya has calificado a esta persona. Edita tu calificación existente.'
            );

            return;
          }


          throw error;
        }
      }


      Alert.alert(
        '¡Calificación guardada!',
        `Gracias por calificar a ${nombreDestino}.`
      );


      onGuardado?.();

      onCerrar();
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando calificación:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo guardar la calificación.'
      );
    } finally {
      setGuardando(false);
    }
  }


  // ==========================================================
  // MODAL
  // ==========================================================

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={
        onCerrar
      }
    >
      <View
        style={
          styles.modalFondo
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.modalScroll
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.modalTarjeta,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >
            {/* TÍTULO */}

            <Text
              style={[
                styles.titulo,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Calificar a{' '}
              {nombreDestino}
            </Text>


            <Text
              style={[
                styles.subtitulo,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {eventId
                ? '¿Qué tal jugó en este evento?'
                : '¿Qué tal es este deportista?'}
            </Text>


            {/* ESTRELLAS */}

            <View
              style={
                styles.estrellasFila
              }
            >
              {[1, 2, 3, 4, 5].map(
                (
                  valor
                ) => (
                  <TouchableOpacity
                    key={
                      valor
                    }
                    style={
                      styles.estrellaBoton
                    }
                    disabled={
                      guardando
                    }
                    onPress={() =>
                      setEstrellas(
                        valor
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.estrellaIcono,
                        {
                          opacity:
                            valor <=
                            estrellas
                              ? 1
                              : 0.35,
                        },
                      ]}
                    >
                      {valor <=
                      estrellas
                        ? '⭐'
                        : '☆'}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>


            <Text
              style={[
                styles.estrellasTexto,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {estrellas === 0
                ? 'Toca una estrella'
                : `${estrellas} / 5`}
            </Text>


            {/* COMENTARIO */}

            <TextInput
              style={[
                styles.comentarioInput,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={
                comentario
              }
              onChangeText={
                setComentario
              }
              placeholder={
                'Comentario opcional...'
              }
              placeholderTextColor={
                colors.secondaryText
              }
              multiline
              maxLength={500}
            />


            <Text
              style={[
                styles.contador,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {comentario.length}
              /500
            </Text>


            {/* BOTONES */}

            <TouchableOpacity
              style={[
                styles.botonPrimario,
                {
                  backgroundColor:
                    colors.primary,

                  opacity:
                    guardando
                      ? 0.7
                      : 1,
                },
              ]}
              disabled={
                guardando
              }
              onPress={
                handleGuardar
              }
            >
              {guardando ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.botonPrimarioTexto
                  }
                >
                  Guardar
                </Text>
              )}
            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.botonCancelar,
                {
                  borderColor:
                    colors.border,
                },
              ]}
              disabled={
                guardando
              }
              onPress={
                onCerrar
              }
            >
              <Text
                style={[
                  styles.botonCancelarTexto,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default CalificarEstrellas;


// ============================================================
// ESTILOS
// ============================================================

const styles =
  StyleSheet.create({
    modalFondo: {
      flex: 1,

      backgroundColor:
        'rgba(0, 0, 0, 0.6)',

      justifyContent:
        'center',
    },


    modalScroll: {
      flexGrow: 1,

      justifyContent:
        'center',

      padding: 24,
    },


    modalTarjeta: {
      borderRadius: 18,

      borderWidth: 1,

      padding: 22,
    },


    titulo: {
      fontSize: 19,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    subtitulo: {
      fontSize: 13,

      textAlign:
        'center',

      marginTop: 6,
    },


    estrellasFila: {
      flexDirection:
        'row',

      justifyContent:
        'center',

      marginTop: 18,
    },


    estrellaBoton: {
      padding: 4,
    },


    estrellaIcono: {
      fontSize: 34,
    },


    estrellasTexto: {
      fontSize: 12,

      textAlign:
        'center',

      marginTop: 6,
    },


    comentarioInput: {
      marginTop: 16,

      borderWidth: 1,

      borderRadius: 12,

      padding: 12,

      minHeight: 90,

      textAlignVertical:
        'top',

      fontSize: 14,
    },


    contador: {
      fontSize: 11,

      textAlign:
        'right',

      marginTop: 4,
    },


    botonPrimario: {
      marginTop: 16,

      paddingVertical: 14,

      borderRadius: 12,

      alignItems:
        'center',
    },


    botonPrimarioTexto: {
      color: '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 15,
    },


    botonCancelar: {
      marginTop: 10,

      paddingVertical: 13,

      borderRadius: 12,

      borderWidth: 1,

      alignItems:
        'center',
    },


    botonCancelarTexto: {
      fontWeight:
        '700',

      fontSize: 14,
    },
  });

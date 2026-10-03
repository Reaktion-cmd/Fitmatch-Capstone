// ============================================================
// FITMATCH - ONBOARDING DE UBICACIÓN
// ============================================================
//
// Esta pantalla:
//
// - Permite utilizar ubicación GPS.
// - Solicita permiso solamente cuando el usuario elige GPS.
// - Guarda las coordenadas GPS en profile_locations.
// - Permite utilizar una ubicación manual.
// - Guarda comuna / sector manualmente en profiles.
// - Registra la preferencia de ubicación.
// - No expone coordenadas públicamente.
// - Permite continuar sin configurar ubicación.
//
// Tablas:
//
// public.profiles
// public.profile_locations
//
// ============================================================

import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import * as Location from 'expo-location';

import {
  useRouter,
} from 'expo-router';

import {
  useTheme,
} from '../lib/ThemeContext';

import {
  supabase,
} from '../lib/supabase';


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function OnboardingScreen() {
  const {
    isDark,
    colors,
  } = useTheme();


  const router =
    useRouter();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    loadingGps,
    setLoadingGps,
  ] = useState(false);


  const [
    loadingManual,
    setLoadingManual,
  ] = useState(false);


  const [
    mostrarManual,
    setMostrarManual,
  ] = useState(false);


  const [
    ubicacionManual,
    setUbicacionManual,
  ] = useState('');


  // ==========================================================
  // OBTENER USUARIO AUTENTICADO
  // ==========================================================

  async function obtenerUsuario() {
    const {
      data: {
        user,
      },
      error,
    } =
      await supabase.auth.getUser();


    if (error) {
      throw error;
    }


    if (!user) {
      Alert.alert(
        'Sesión no encontrada',
        'Debes iniciar sesión nuevamente.'
      );


      router.replace(
        '/login'
      );


      return null;
    }


    return user;
  }


  // ==========================================================
  // UTILIZAR UBICACIÓN GPS
  // ==========================================================

  async function requestLocationPermission() {
    try {
      setLoadingGps(
        true
      );


      // ------------------------------------------------------
      // 1. SOLICITAR PERMISO
      // ------------------------------------------------------

      const {
        status,
      } =
        await Location
          .requestForegroundPermissionsAsync();


      // ------------------------------------------------------
      // 2. PERMISO RECHAZADO
      // ------------------------------------------------------

      if (
        status !==
        'granted'
      ) {
        // Si el usuario rechaza GPS,
        // mostramos automáticamente la alternativa manual.

        setMostrarManual(
          true
        );


        Alert.alert(
          'Ubicación no autorizada',
          'No hay problema. Puedes ingresar manualmente tu comuna o sector para continuar.'
        );


        return;
      }


      // ------------------------------------------------------
      // 3. OBTENER POSICIÓN ACTUAL
      // ------------------------------------------------------

      const location =
        await Location
          .getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });


      const latitude =
        location.coords.latitude;


      const longitude =
        location.coords.longitude;


      // Por privacidad no mostramos las coordenadas
      // exactas en la interfaz.

      console.log(
        'Ubicación GPS obtenida correctamente.'
      );


      // ------------------------------------------------------
      // 4. OBTENER USUARIO
      // ------------------------------------------------------

      const user =
        await obtenerUsuario();


      if (!user) {
        return;
      }


      // ------------------------------------------------------
      // 5. GUARDAR COORDENADAS EN SUPABASE
      // ------------------------------------------------------
      //
      // upsert:
      //
      // - si no existe una ubicación, la crea;
      // - si ya existe, la actualiza.
      //
      // ------------------------------------------------------

      const {
        error:
          locationError,
      } =
        await supabase
          .from(
            'profile_locations'
          )
          .upsert(
            {
              user_id:
                user.id,

              latitude,

              longitude,

              updated_at:
                new Date()
                  .toISOString(),
            },
            {
              onConflict:
                'user_id',
            }
          );


      if (
        locationError
      ) {
        throw locationError;
      }


      // ------------------------------------------------------
      // 6. ACTUALIZAR PREFERENCIA DE UBICACIÓN
      // ------------------------------------------------------
      //
      // Si antes usaba ubicación manual:
      //
      // manual_location = null
      // location_preference = gps
      //
      // ------------------------------------------------------

      const {
        error:
          profileError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .update({
            location_preference:
              'gps',

            manual_location:
              null,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            user.id
          );


      if (
        profileError
      ) {
        throw profileError;
      }


      console.log(
        'Ubicación GPS guardada correctamente.'
      );


      // ------------------------------------------------------
      // 7. CONTINUAR AUTOMÁTICAMENTE A DEPORTES
      // ------------------------------------------------------

      router.replace(
        '/deportes'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando ubicación GPS:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo obtener o guardar la ubicación.'
      );
    } finally {
      setLoadingGps(
        false
      );
    }
  }


  // ==========================================================
  // GUARDAR UBICACIÓN MANUAL
  // ==========================================================

  async function guardarUbicacionManual() {
    const texto =
      ubicacionManual
        .trim();


    // --------------------------------------------------------
    // VALIDACIÓN
    // --------------------------------------------------------

    if (
      texto.length <
      2
    ) {
      Alert.alert(
        'Ubicación requerida',
        'Ingresa tu comuna, ciudad o sector.'
      );


      return;
    }


    try {
      setLoadingManual(
        true
      );


      // ------------------------------------------------------
      // 1. OBTENER USUARIO
      // ------------------------------------------------------

      const user =
        await obtenerUsuario();


      if (!user) {
        return;
      }


      // ------------------------------------------------------
      // 2. GUARDAR UBICACIÓN MANUAL
      // ------------------------------------------------------
      //
      // No inventamos coordenadas.
      //
      // Guardamos exactamente la comuna, ciudad
      // o sector ingresado por el usuario.
      //
      // ------------------------------------------------------

      const {
        error:
          profileError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .update({
            manual_location:
              texto,

            location_preference:
              'manual',

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            user.id
          );


      if (
        profileError
      ) {
        throw profileError;
      }


      console.log(
        'Ubicación manual guardada correctamente.'
      );


      // ------------------------------------------------------
      // 3. CONTINUAR AUTOMÁTICAMENTE A DEPORTES
      // ------------------------------------------------------
      //
      // Antes aparecía una alerta con botón "Continuar".
      //
      // Ahora, después de confirmar que Supabase guardó
      // correctamente la ubicación, avanzamos directamente
      // al siguiente paso del onboarding.
      //
      // ------------------------------------------------------

      router.replace(
        '/deportes'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando ubicación manual:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo guardar la ubicación manual.'
      );
    } finally {
      setLoadingManual(
        false
      );
    }
  }


  // ==========================================================
  // MOSTRAR / OCULTAR UBICACIÓN MANUAL
  // ==========================================================

  function toggleUbicacionManual() {
    setMostrarManual(
      (
        valorActual
      ) =>
        !valorActual
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            CONTENIDO PRINCIPAL
        ================================================== */}

        <View
          style={
            styles.content
          }
        >
          {/* ICONO */}

          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  isDark
                    ? '#1E293B'
                    : colors.primarySoft,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={
                styles.locationIcon
              }
            >
              📍
            </Text>
          </View>


          {/* TÍTULO */}

          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Configura tu Ubicación
          </Text>


          {/* DESCRIPCIÓN */}

          <Text
            style={[
              styles.description,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            FitMatch utiliza tu ubicación para ayudarte a encontrar deportistas y partidos cercanos.
          </Text>


          {/* PRIVACIDAD */}

          <Text
            style={[
              styles.privacyText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Tu ubicación exacta no se mostrará públicamente a otros usuarios.
          </Text>


          {/* ==================================================
              OPCIÓN GPS
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,

                opacity:
                  loadingGps
                    ? 0.7
                    : 1,
              },
            ]}
            onPress={
              requestLocationPermission
            }
            disabled={
              loadingGps ||
              loadingManual
            }
          >
            {loadingGps ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                📍 Usar mi ubicación actual
              </Text>
            )}
          </TouchableOpacity>


          {/* ==================================================
              SEPARADOR
          ================================================== */}

          <View
            style={
              styles.separatorContainer
            }
          >
            <View
              style={[
                styles.separatorLine,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <Text
              style={[
                styles.separatorText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              o
            </Text>

            <View
              style={[
                styles.separatorLine,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />
          </View>


          {/* ==================================================
              OPCIÓN MANUAL
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.manualToggleButton,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={
              toggleUbicacionManual
            }
            disabled={
              loadingGps ||
              loadingManual
            }
          >
            <Text
              style={[
                styles.manualToggleText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ✍️ Ingresar ubicación manualmente
            </Text>

            <Text
              style={[
                styles.manualToggleArrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {mostrarManual
                ? '▲'
                : '▼'}
            </Text>
          </TouchableOpacity>


          {/* ==================================================
              FORMULARIO MANUAL
          ================================================== */}

          {mostrarManual && (
            <View
              style={[
                styles.manualCard,
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
                  styles.manualTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Ubicación manual
              </Text>


              <Text
                style={[
                  styles.manualDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Escribe tu comuna, ciudad o sector. No necesitas ingresar una dirección exacta.
              </Text>


              <TextInput
                style={[
                  styles.manualInput,
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
                  ubicacionManual
                }
                onChangeText={
                  setUbicacionManual
                }
                placeholder="Ej: Maipú, Santiago"
                placeholderTextColor={
                  colors.secondaryText
                }
                autoCapitalize="words"
                returnKeyType="done"
                editable={
                  !loadingManual
                }
              />


              <TouchableOpacity
                style={[
                  styles.manualSaveButton,
                  {
                    backgroundColor:
                      colors.primary,

                    opacity:
                      loadingManual
                        ? 0.7
                        : 1,
                  },
                ]}
                onPress={
                  guardarUbicacionManual
                }
                disabled={
                  loadingManual ||
                  loadingGps
                }
              >
                {loadingManual ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.manualSaveButtonText
                    }
                  >
                    Guardar ubicación manual
                  </Text>
                )}
              </TouchableOpacity>


              <Text
                style={[
                  styles.manualNotice,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                La ubicación manual no utiliza tu GPS ni guarda coordenadas exactas.
              </Text>
            </View>
          )}
        </View>


        {/* ==================================================
            CONTINUAR SIN UBICACIÓN
        ================================================== */}

        <View
          style={
            styles.footer
          }
        >
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.replace(
                '/(tabs)'
              )
            }
            disabled={
              loadingGps ||
              loadingManual
            }
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Ahora no
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      flexGrow: 1,

      padding: 24,

      justifyContent:
        'space-between',
    },


    content: {
      width: '100%',

      maxWidth: 560,

      alignSelf:
        'center',

      alignItems:
        'center',

      justifyContent:
        'center',

      flexGrow: 1,

      paddingVertical: 20,
    },


    // ========================================================
    // ICONO
    // ========================================================

    iconCircle: {
      width: 100,

      height: 100,

      borderRadius: 50,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginBottom: 24,

      borderWidth: 1,
    },


    locationIcon: {
      fontSize: 50,
    },


    // ========================================================
    // TEXTOS
    // ========================================================

    title: {
      fontSize: 26,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    description: {
      fontSize: 15,

      textAlign:
        'center',

      marginTop: 12,

      lineHeight: 22,

      paddingHorizontal: 16,

      maxWidth: 500,
    },


    privacyText: {
      fontSize: 12,

      textAlign:
        'center',

      marginTop: 14,

      lineHeight: 18,

      paddingHorizontal: 24,

      maxWidth: 460,
    },


    // ========================================================
    // BOTÓN GPS
    // ========================================================

    primaryButton: {
      width: '100%',

      paddingVertical: 16,

      borderRadius: 12,

      alignItems:
        'center',

      marginTop: 28,
    },


    primaryButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 16,
    },


    // ========================================================
    // SEPARADOR
    // ========================================================

    separatorContainer: {
      width: '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginVertical: 18,

      gap: 12,
    },


    separatorLine: {
      flex: 1,

      height: 1,
    },


    separatorText: {
      fontSize: 13,

      fontWeight:
        '600',
    },


    // ========================================================
    // UBICACIÓN MANUAL
    // ========================================================

    manualToggleButton: {
      width: '100%',

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      paddingHorizontal: 16,

      paddingVertical: 14,

      borderRadius: 12,

      borderWidth: 1,
    },


    manualToggleText: {
      flex: 1,

      fontSize: 14,

      fontWeight:
        '700',
    },


    manualToggleArrow: {
      fontSize: 11,

      marginLeft: 10,
    },


    manualCard: {
      width: '100%',

      padding: 16,

      borderWidth: 1,

      borderRadius: 12,

      marginTop: 12,
    },


    manualTitle: {
      fontSize: 15,

      fontWeight:
        'bold',
    },


    manualDescription: {
      fontSize: 12,

      lineHeight: 18,

      marginTop: 5,
    },


    manualInput: {
      width: '100%',

      borderWidth: 1,

      borderRadius: 10,

      paddingHorizontal: 12,

      paddingVertical: 12,

      fontSize: 14,

      marginTop: 14,
    },


    manualSaveButton: {
      width: '100%',

      paddingVertical: 13,

      borderRadius: 10,

      alignItems:
        'center',

      marginTop: 12,
    },


    manualSaveButtonText: {
      color:
        '#FFFFFF',

      fontSize: 14,

      fontWeight:
        'bold',
    },


    manualNotice: {
      fontSize: 11,

      lineHeight: 16,

      marginTop: 10,

      textAlign:
        'center',
    },


    // ========================================================
    // FOOTER
    // ========================================================

    footer: {
      width: '100%',

      maxWidth: 560,

      alignSelf:
        'center',

      marginBottom: 20,
    },


    secondaryButton: {
      width: '100%',

      paddingVertical: 14,

      alignItems:
        'center',

      borderRadius: 12,

      borderWidth: 1,
    },


    secondaryButtonText: {
      fontWeight:
        '600',

      fontSize: 15,
    },
  });
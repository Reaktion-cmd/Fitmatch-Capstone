// ============================================================
// FITMATCH - ONBOARDING DE UBICACIÓN
// ============================================================
//
// Esta pantalla:
//
// - Solicita permiso de ubicación.
// - Obtiene latitud y longitud mediante expo-location.
// - Guarda la ubicación del usuario autenticado en Supabase.
// - Si ya existía una ubicación, la actualiza.
// - Luego continúa hacia la selección de deportes.
//
// Tabla:
//
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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as Location from 'expo-location';

import { useRouter } from 'expo-router';

import { useTheme } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';


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
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================================
  // SOLICITAR UBICACIÓN
  // ==========================================================

  async function requestLocationPermission() {
    try {
      setLoading(true);


      // ------------------------------------------------------
      // 1. SOLICITAR PERMISO
      // ------------------------------------------------------

      const {
        status,
      } =
        await Location.requestForegroundPermissionsAsync();


      // ------------------------------------------------------
      // 2. PERMISO RECHAZADO
      // ------------------------------------------------------

      if (
        status !==
        'granted'
      ) {
        Alert.alert(
          'Ubicación no autorizada',
          'FitMatch utiliza tu ubicación para calcular la distancia con otros deportistas y eventos cercanos. Puedes activarla más adelante desde la configuración del teléfono.'
        );

        return;
      }


      // ------------------------------------------------------
      // 3. OBTENER POSICIÓN ACTUAL
      // ------------------------------------------------------

      const location =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });


      const latitude =
        location.coords.latitude;


      const longitude =
        location.coords.longitude;


      console.log(
        'Ubicación obtenida:',
        latitude,
        longitude
      );


      // ------------------------------------------------------
      // 4. OBTENER USUARIO AUTENTICADO
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
      // 5. GUARDAR UBICACIÓN EN SUPABASE
      // ------------------------------------------------------
      //
      // Usamos upsert porque:
      //
      // - si no existe → la crea;
      // - si ya existe → la actualiza.
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
                new Date().toISOString(),
            },
            {
              onConflict:
                'user_id',
            }
          );


      if (locationError) {
        throw locationError;
      }


      console.log(
        'Ubicación guardada correctamente.'
      );


      // ------------------------------------------------------
      // 6. CONTINUAR A DEPORTES
      // ------------------------------------------------------

      router.replace(
        '/deportes'
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando ubicación:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo obtener o guardar la ubicación.'
      );
    } finally {
      setLoading(false);
    }
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
      <View
        style={
          styles.container
        }
      >
        {/* ==================================================
            CONTENIDO
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
            Activa tu Ubicación
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
            Para conectarte con deportistas y partidos cercanos,
            FitMatch utiliza tu ubicación para calcular distancias.
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
        </View>


        {/* ==================================================
            BOTONES
        ================================================== */}

        <View
          style={
            styles.footer
          }
        >
          {/* PERMITIR UBICACIÓN */}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,

                opacity:
                  loading
                    ? 0.7
                    : 1,
              },
            ]}
            onPress={
              requestLocationPermission
            }
            disabled={
              loading
            }
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Permitir Ubicación
              </Text>
            )}
          </TouchableOpacity>


          {/* OMITIR */}

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
              loading
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
      </View>
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
      flex: 1,

      padding: 24,

      justifyContent:
        'space-between',
    },


    content: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


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


    footer: {
      gap: 12,

      marginBottom: 20,
    },


    primaryButton: {
      paddingVertical: 16,

      borderRadius: 12,

      alignItems:
        'center',
    },


    primaryButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 16,
    },


    secondaryButton: {
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
// ============================================================
// FITMATCH - DETALLE DE DEPORTISTA
// ============================================================
//
// RF13
//
// Esta pantalla:
//
// - Obtiene el perfil real desde Supabase.
// - Muestra información deportiva ampliada.
// - Calcula deportes compartidos.
// - Compara nivel deportivo.
// - Obtiene distancia mediante la función segura.
// - Nunca consulta coordenadas exactas de otros usuarios.
// - Permite volver al Match para decidir Like / Pass.
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
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  supabase,
} from '../../lib/supabase';

import {
  useTheme,
} from '../../lib/ThemeContext';


// ============================================================
// TIPOS
// ============================================================

interface PerfilDetalle {
  id: string;

  full_name: string | null;

  age: number | null;

  bio: string | null;

  favorite_team: string | null;

  instagram: string | null;

  sports: string[] | null;

  skill_level: string | null;
}


interface DistanciaPerfil {
  target_id: string;

  distance_km: number;
}


// ============================================================
// DEPORTES
// ============================================================

const DEPORTES_DISPONIBLES = [
  {
    id: 'futbol',
    nombre: 'Fútbol',
    icono: '⚽',
  },

  {
    id: 'padel',
    nombre: 'Pádel',
    icono: '🎾',
  },

  {
    id: 'tenis',
    nombre: 'Tenis',
    icono: '🎾',
  },

  {
    id: 'basquet',
    nombre: 'Básquetbol',
    icono: '🏀',
  },

  {
    id: 'running',
    nombre: 'Running',
    icono: '🏃',
  },

  {
    id: 'gym',
    nombre: 'Gimnasio',
    icono: '🏋️',
  },

  {
    id: 'volley',
    nombre: 'Vóleibol',
    icono: '🏐',
  },

  {
    id: 'ciclismo',
    nombre: 'Ciclismo',
    icono: '🚴',
  },
];


// ============================================================
// COMPONENTE
// ============================================================

export default function DeportistaDetalleScreen() {
  const router =
    useRouter();


  const params =
    useLocalSearchParams<{
      profileId?:
        string |
        string[];
    }>();


  const {
    isDark,
    colors,
  } = useTheme();


  const profileId =
    Array.isArray(
      params.profileId
    )
      ? params.profileId[0]
      : params.profileId;


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    perfil,
    setPerfil,
  ] =
    useState<PerfilDetalle | null>(
      null
    );


  const [
    distanceKm,
    setDistanceKm,
  ] =
    useState<number | null>(
      null
    );


  const [
    deportesEnComun,
    setDeportesEnComun,
  ] =
    useState<string[]>([]);


  const [
    mismoNivel,
    setMismoNivel,
  ] =
    useState(false);


  // ==========================================================
  // CARGAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [profileId])
  );


  // ==========================================================
  // CARGAR PERFIL COMPLETO
  // ==========================================================

  async function cargarPerfil() {
    if (!profileId) {
      Alert.alert(
        'Perfil no encontrado',
        'No se recibió un identificador de deportista válido.'
      );


      router.back();


      return;
    }


    try {
      setCargando(
        true
      );


      // ------------------------------------------------------
      // 1. USUARIO ACTUAL
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
        router.replace(
          '/login'
        );


        return;
      }


      // ------------------------------------------------------
      // 2. MIS DATOS DEPORTIVOS
      // ------------------------------------------------------

      const {
        data:
          miPerfil,

        error:
          miPerfilError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .select(`
            sports,
            skill_level
          `)
          .eq(
            'id',
            user.id
          )
          .maybeSingle();


      if (miPerfilError) {
        throw miPerfilError;
      }


      // ------------------------------------------------------
      // 3. PERFIL DEL DEPORTISTA
      // ------------------------------------------------------

      const {
        data:
          perfilData,

        error:
          perfilError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .select(`
            id,
            full_name,
            age,
            bio,
            favorite_team,
            instagram,
            sports,
            skill_level
          `)
          .eq(
            'id',
            profileId
          )
          .maybeSingle();


      if (perfilError) {
        throw perfilError;
      }


      if (!perfilData) {
        Alert.alert(
          'Perfil no disponible',
          'Este deportista ya no está disponible.'
        );


        router.back();


        return;
      }


      setPerfil(
        perfilData
      );


      // ------------------------------------------------------
      // 4. COMPATIBILIDAD
      // ------------------------------------------------------

      const misDeportes: string[] =
        Array.isArray(
          miPerfil?.sports
        )
          ? miPerfil.sports
          : [];


      const deportesPerfil: string[] =
        Array.isArray(
          perfilData.sports
        )
          ? perfilData.sports
          : [];


      const compartidos =
        misDeportes.filter(
          (
            deporte
          ) =>
            deportesPerfil.includes(
              deporte
            )
        );


      setDeportesEnComun(
        compartidos
      );


      const nivelCoincide =
        Boolean(
          miPerfil?.skill_level &&
          perfilData.skill_level &&
          miPerfil.skill_level ===
            perfilData.skill_level
        );


      setMismoNivel(
        nivelCoincide
      );


      // ------------------------------------------------------
      // 5. DISTANCIA SEGURA
      // ------------------------------------------------------
      //
      // Solo recibimos:
      //
      // target_id
      // distance_km
      //
      // No obtenemos las coordenadas del otro usuario.
      //
      // ------------------------------------------------------

      const {
        data:
          distanciasData,

        error:
          distanciasError,
      } =
        await supabase.rpc(
          'get_profile_distances'
        );


      if (
        distanciasError
      ) {
        throw distanciasError;
      }


      const resultadoDistancia =
        (
          (
            distanciasData ??
            []
          ) as DistanciaPerfil[]
        ).find(
          (
            item
          ) =>
            item.target_id ===
            profileId
        );


      setDistanceKm(
        resultadoDistancia
          ? Number(
              resultadoDistancia.distance_km
            )
          : null
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error cargando detalle del deportista:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo cargar el perfil del deportista.'
      );
    } finally {
      setCargando(
        false
      );
    }
  }


  // ==========================================================
  // DEPORTES
  // ==========================================================

  function obtenerNombreDeporte(
    deporteId:
      string
  ) {
    const deporte =
      DEPORTES_DISPONIBLES.find(
        (
          item
        ) =>
          item.id ===
          deporteId
      );


    if (!deporte) {
      return deporteId;
    }


    return `${deporte.icono} ${deporte.nombre}`;
  }


  function obtenerDeportes(
    sports:
      string[] |
      null
  ) {
    if (
      !sports ||
      sports.length ===
        0
    ) {
      return 'No configurados';
    }


    return sports
      .map(
        obtenerNombreDeporte
      )
      .join(
        ' · '
      );
  }


  // ==========================================================
  // DISTANCIA
  // ==========================================================

  function obtenerTextoDistancia() {
    if (
      distanceKm ===
      null
    ) {
      return 'Distancia no disponible';
    }


    if (
      distanceKm <
      1
    ) {
      return 'A menos de 1 km de ti';
    }


    return `A ${distanceKm.toFixed(
      1
    )} km de ti`;
  }


  // ==========================================================
  // INSTAGRAM
  // ==========================================================

  function obtenerInstagram() {
    const instagram =
      perfil?.instagram
        ?.trim();


    if (!instagram) {
      return 'No especificado';
    }


    if (
      instagram.startsWith(
        '@'
      )
    ) {
      return instagram;
    }


    return `@${instagram}`;
  }


  // ==========================================================
  // CARGANDO
  // ==========================================================

  if (
    cargando
  ) {
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
            Cargando perfil deportivo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // PERFIL NO DISPONIBLE
  // ==========================================================

  if (!perfil) {
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
          <Text
            style={[
              styles.emptyText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            No fue posible cargar este perfil.
          </Text>


          <TouchableOpacity
            style={[
              styles.primaryButton,
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
                styles.primaryButtonText
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
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={[
                styles.backButtonText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ←
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
            Perfil deportivo
          </Text>


          <View
            style={
              styles.headerSpacer
            }
          />
        </View>


        {/* ==================================================
            PERFIL
        ================================================== */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  colors.primarySoft,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={
                styles.avatarEmoji
              }
            >
              🧢
            </Text>
          </View>


          <Text
            style={[
              styles.name,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {perfil.full_name ??
              'Usuario FitMatch'}

            {perfil.age
              ? `, ${perfil.age}`
              : ''}
          </Text>


          <Text
            style={[
              styles.distance,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            📍 {obtenerTextoDistancia()}
          </Text>


          {/* ==================================================
              COMPATIBILIDAD
          ================================================== */}

          <View
            style={[
              styles.compatibilityCard,
              {
                backgroundColor:
                  colors.primarySoft,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.compatibilityTitle,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              🎯 Compatibilidad deportiva
            </Text>


            {deportesEnComun.length >
            0 ? (
              <>
                <Text
                  style={[
                    styles.compatibilityText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {deportesEnComun
                    .map(
                      obtenerNombreDeporte
                    )
                    .join(
                      ' · '
                    )}
                </Text>


                <Text
                  style={[
                    styles.compatibilityDescription,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  {deportesEnComun.length ===
                  1
                    ? 'Tienen 1 deporte en común.'
                    : `Tienen ${deportesEnComun.length} deportes en común.`}
                </Text>
              </>
            ) : (
              <Text
                style={[
                  styles.compatibilityDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                No tienen deportes en común configurados.
              </Text>
            )}


            {mismoNivel && (
              <Text
                style={[
                  styles.sameLevel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                ✓ También tienen el mismo nivel deportivo
              </Text>
            )}
          </View>


          {/* ==================================================
              INFORMACIÓN
          ================================================== */}

          <View
            style={
              styles.infoContainer
            }
          >
            <View
              style={[
                styles.infoSection,
                {
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Deportes
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {obtenerDeportes(
                  perfil.sports
                )}
              </Text>
            </View>


            <View
              style={[
                styles.infoSection,
                {
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Nivel deportivo
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {perfil.skill_level ??
                  'No especificado'}
              </Text>
            </View>


            <View
              style={[
                styles.infoSection,
                {
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Biografía
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {perfil.bio ??
                  'Este usuario todavía no ha agregado una biografía.'}
              </Text>
            </View>


            <View
              style={[
                styles.infoSection,
                {
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Equipo favorito
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {perfil.favorite_team ??
                  'No especificado'}
              </Text>
            </View>


            <View
              style={[
                styles.infoSection,
                styles.lastInfoSection,
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Instagram
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {obtenerInstagram()}
              </Text>
            </View>
          </View>
        </View>


        {/* ==================================================
            VOLVER
        ================================================== */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
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
              styles.primaryButtonText
            }
          >
            Volver a Match
          </Text>
        </TouchableOpacity>


        <Text
          style={[
            styles.privacyText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          FitMatch muestra únicamente la distancia aproximada cuando está disponible. Las coordenadas exactas de otros usuarios no se muestran.
        </Text>
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
      width: '100%',

      maxWidth: 680,

      alignSelf:
        'center',

      paddingHorizontal: 20,

      paddingTop: 12,

      paddingBottom: 30,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      width: '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom: 20,
    },


    backButton: {
      width: 42,

      height: 42,

      borderRadius: 12,

      borderWidth: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    backButtonText: {
      fontSize: 24,

      fontWeight:
        '600',
    },


    headerTitle: {
      fontSize: 20,

      fontWeight:
        'bold',

      textAlign:
        'center',

      flex: 1,
    },


    headerSpacer: {
      width: 42,
    },


    // ========================================================
    // PERFIL
    // ========================================================

    profileCard: {
      width: '100%',

      borderWidth: 1,

      borderRadius: 20,

      padding: 20,

      alignItems:
        'center',
    },


    avatar: {
      width: 110,

      height: 110,

      borderRadius: 55,

      justifyContent:
        'center',

      alignItems:
        'center',

      borderWidth: 1,

      marginBottom: 14,
    },


    avatarEmoji: {
      fontSize: 58,
    },


    name: {
      fontSize: 24,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    distance: {
      fontSize: 13,

      fontWeight:
        '600',

      marginTop: 7,

      textAlign:
        'center',
    },


    // ========================================================
    // COMPATIBILIDAD
    // ========================================================

    compatibilityCard: {
      width: '100%',

      borderWidth: 1,

      borderRadius: 14,

      padding: 14,

      marginTop: 20,

      alignItems:
        'center',
    },


    compatibilityTitle: {
      fontSize: 14,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    compatibilityText: {
      fontSize: 14,

      fontWeight:
        '600',

      marginTop: 9,

      textAlign:
        'center',

      lineHeight: 21,
    },


    compatibilityDescription: {
      fontSize: 12,

      marginTop: 7,

      textAlign:
        'center',
    },


    sameLevel: {
      fontSize: 12,

      marginTop: 7,

      textAlign:
        'center',
    },


    // ========================================================
    // INFORMACIÓN
    // ========================================================

    infoContainer: {
      width: '100%',

      marginTop: 20,
    },


    infoSection: {
      width: '100%',

      paddingVertical: 14,

      borderBottomWidth: 1,
    },


    lastInfoSection: {
      borderBottomWidth: 0,
    },


    infoLabel: {
      fontSize: 12,

      fontWeight:
        '600',

      marginBottom: 5,
    },


    infoValue: {
      fontSize: 15,

      lineHeight: 22,
    },


    // ========================================================
    // BOTÓN
    // ========================================================

    primaryButton: {
      width: '100%',

      paddingVertical: 14,

      borderRadius: 12,

      alignItems:
        'center',

      marginTop: 18,
    },


    primaryButtonText: {
      color:
        '#FFFFFF',

      fontSize: 15,

      fontWeight:
        'bold',
    },


    privacyText: {
      fontSize: 11,

      lineHeight: 17,

      textAlign:
        'center',

      marginTop: 16,

      paddingHorizontal: 15,
    },


    // ========================================================
    // CARGA / ERROR
    // ========================================================

    loadingContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal: 24,

      gap: 12,
    },


    loadingText: {
      fontSize: 14,

      textAlign:
        'center',
    },


    emptyText: {
      fontSize: 14,

      textAlign:
        'center',
    },
  });
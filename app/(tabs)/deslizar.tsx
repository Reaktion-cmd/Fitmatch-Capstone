// ============================================================
// FITMATCH - MATCH DEPORTIVO 1V1
// ============================================================
//
// Esta pantalla:
//
// - Obtiene perfiles reales desde Supabase.
// - Nunca muestra al usuario autenticado.
// - No vuelve a mostrar perfiles que ya recibieron Like o Pass.
// - Prioriza perfiles con deportes en común.
// - Como criterio secundario considera el nivel deportivo.
// - ❌ registra un "pass".
// - 💚 registra un "like".
// - Si ambos usuarios se dieron Like, Supabase crea un Match.
// - Mantiene compatibilidad con modo claro / oscuro.
//
// IMPORTANTE:
//
// El puntaje utilizado NO es un porcentaje de compatibilidad.
// Solamente sirve para ordenar los perfiles.
//
// Regla interna:
//
// +10 puntos por cada deporte en común.
// +2 puntos si ambos tienen el mismo nivel.
//
// Tablas utilizadas:
//
// public.profiles
// public.profile_swipes
// public.matches
//
// Función utilizada:
//
// public.register_swipe(...)
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
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';


// ============================================================
// TIPO DE PERFIL
// ============================================================

interface PerfilMatch {
  id: string;

  full_name: string | null;

  age: number | null;

  bio: string | null;

  sports: string[] | null;

  skill_level: string | null;


  // ==========================================================
  // DATOS CALCULADOS PARA MATCH
  // ==========================================================

  deportesEnComun: string[];

  mismoNivel: boolean;

  puntajeOrden: number;
}


// ============================================================
// CATÁLOGO DE DEPORTES
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
// COMPONENTE PRINCIPAL
// ============================================================

export default function MatchScreen() {
  const router = useRouter();


  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    perfiles,
    setPerfiles,
  ] = useState<PerfilMatch[]>([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    procesando,
    setProcesando,
  ] = useState(false);


  // ==========================================================
  // PERFIL ACTUAL
  // ==========================================================
  //
  // Los perfiles ya vienen ordenados por afinidad.
  //
  // Por eso siempre mostramos perfiles[0].
  // ==========================================================

  const perfilActual =
    perfiles.length > 0
      ? perfiles[0]
      : null;


  // ==========================================================
  // CARGAR PERFILES AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfiles();
    }, [])
  );


  // ==========================================================
  // CARGAR PERFILES REALES
  // ==========================================================

  async function cargarPerfiles() {
    try {
      setCargando(true);


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
      // 2. OBTENER MI PERFIL
      // ------------------------------------------------------
      //
      // Necesitamos conocer:
      //
      // - mis deportes;
      // - mi nivel.
      //
      // Con esos datos calcularemos la afinidad.
      // ------------------------------------------------------

      const {
        data: miPerfil,
        error: miPerfilError,
      } = await supabase
        .from('profiles')
        .select(
          `
          sports,
          skill_level
          `
        )
        .eq(
          'id',
          user.id
        )
        .maybeSingle();


      if (miPerfilError) {
        throw miPerfilError;
      }


      // Deportes del usuario autenticado.

      const misDeportes: string[] =
        Array.isArray(
          miPerfil?.sports
        )
          ? miPerfil.sports
          : [];


      // Nivel del usuario autenticado.

      const miNivel: string | null =
        miPerfil?.skill_level ??
        null;


      // ------------------------------------------------------
      // 3. OBTENER SWIPES YA REALIZADOS
      // ------------------------------------------------------
      //
      // Esto evita volver a mostrar perfiles que ya recibieron:
      //
      // Like
      //
      // o
      //
      // Pass
      // ------------------------------------------------------

      const {
        data: swipesData,
        error: swipesError,
      } = await supabase
        .from('profile_swipes')
        .select(
          'target_id'
        )
        .eq(
          'swiper_id',
          user.id
        );


      if (swipesError) {
        throw swipesError;
      }


      const perfilesYaEvaluados =
        new Set(
          (
            swipesData ??
            []
          ).map(
            (swipe) =>
              swipe.target_id
          )
        );


      // ------------------------------------------------------
      // 4. OBTENER LOS OTROS PERFILES
      // ------------------------------------------------------

      const {
        data: perfilesData,
        error: perfilesError,
      } = await supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          age,
          bio,
          sports,
          skill_level
          `
        )
        .neq(
          'id',
          user.id
        );


      if (perfilesError) {
        throw perfilesError;
      }


      // ------------------------------------------------------
      // 5. QUITAR PERFILES YA EVALUADOS
      // ------------------------------------------------------

      const perfilesDisponibles =
        (
          perfilesData ??
          []
        ).filter(
          (perfil) =>
            !perfilesYaEvaluados.has(
              perfil.id
            )
        );


      // ------------------------------------------------------
      // 6. CALCULAR AFINIDAD DEPORTIVA
      // ------------------------------------------------------

      const perfilesConAfinidad: PerfilMatch[] =
        perfilesDisponibles.map(
          (perfil) => {
            // Deportes del candidato.

            const deportesPerfil: string[] =
              Array.isArray(
                perfil.sports
              )
                ? perfil.sports
                : [];


            // ----------------------------------------------
            // DEPORTES EN COMÚN
            // ----------------------------------------------

            const deportesEnComun =
              misDeportes.filter(
                (deporteId) =>
                  deportesPerfil.includes(
                    deporteId
                  )
              );


            // ----------------------------------------------
            // MISMO NIVEL
            // ----------------------------------------------
            //
            // Solamente contamos como coincidencia si ambos
            // tienen un nivel configurado.
            // ----------------------------------------------

            const mismoNivel =
              Boolean(
                miNivel &&
                perfil.skill_level &&
                miNivel ===
                  perfil.skill_level
              );


            // ----------------------------------------------
            // PUNTAJE INTERNO DE ORDEN
            // ----------------------------------------------
            //
            // NO se muestra como porcentaje.
            //
            // Cada deporte compartido pesa mucho más que
            // compartir solamente el nivel.
            // ----------------------------------------------

            const puntajeOrden =
              (
                deportesEnComun.length *
                10
              ) +
              (
                mismoNivel
                  ? 2
                  : 0
              );


            return {
              id:
                perfil.id,

              full_name:
                perfil.full_name,

              age:
                perfil.age,

              bio:
                perfil.bio,

              sports:
                perfil.sports,

              skill_level:
                perfil.skill_level,

              deportesEnComun,

              mismoNivel,

              puntajeOrden,
            };
          }
        );


      // ------------------------------------------------------
      // 7. ORDENAR POR AFINIDAD
      // ------------------------------------------------------
      //
      // Mayor puntaje primero.
      //
      // Ejemplo:
      //
      // Persona A:
      // 2 deportes comunes + mismo nivel = 22
      //
      // Persona B:
      // 1 deporte común = 10
      //
      // Persona C:
      // mismo nivel solamente = 2
      //
      // Persona D:
      // sin coincidencias = 0
      //
      // Resultado:
      //
      // A → B → C → D
      // ------------------------------------------------------

      perfilesConAfinidad.sort(
        (
          perfilA,
          perfilB
        ) => {
          // Primero:
          // mayor puntaje.

          if (
            perfilB.puntajeOrden !==
            perfilA.puntajeOrden
          ) {
            return (
              perfilB.puntajeOrden -
              perfilA.puntajeOrden
            );
          }


          // Segundo criterio:
          // cantidad de deportes compartidos.

          if (
            perfilB.deportesEnComun.length !==
            perfilA.deportesEnComun.length
          ) {
            return (
              perfilB.deportesEnComun.length -
              perfilA.deportesEnComun.length
            );
          }


          // Tercer criterio:
          // nombre, simplemente para tener
          // un resultado estable.

          return (
            perfilA.full_name ??
            ''
          ).localeCompare(
            perfilB.full_name ??
              ''
          );
        }
      );


      // ------------------------------------------------------
      // 8. GUARDAR PERFILES ORDENADOS
      // ------------------------------------------------------

      setPerfiles(
        perfilesConAfinidad
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error cargando perfiles:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron cargar perfiles para Match.'
      );


      setPerfiles([]);
    } finally {
      setCargando(false);
    }
  }


  // ==========================================================
  // OBTENER TEXTO DE DEPORTES
  // ==========================================================

  function obtenerDeportes(
    sports: string[] | null
  ) {
    if (
      !sports ||
      sports.length === 0
    ) {
      return 'Deportes no configurados';
    }


    return sports
      .map(
        (deporteId) => {
          const deporte =
            DEPORTES_DISPONIBLES.find(
              (item) =>
                item.id ===
                deporteId
            );


          if (!deporte) {
            return deporteId;
          }


          return `${deporte.icono} ${deporte.nombre}`;
        }
      )
      .join(' / ');
  }


  // ==========================================================
  // OBTENER DEPORTES EN COMÚN
  // ==========================================================

  function obtenerDeportesEnComun(
    sports: string[]
  ) {
    if (
      sports.length === 0
    ) {
      return '';
    }


    return sports
      .map(
        (deporteId) => {
          const deporte =
            DEPORTES_DISPONIBLES.find(
              (item) =>
                item.id ===
                deporteId
            );


          if (!deporte) {
            return deporteId;
          }


          return `${deporte.icono} ${deporte.nombre}`;
        }
      )
      .join(' · ');
  }


  // ==========================================================
  // REGISTRAR LIKE O PASS
  // ==========================================================

  async function registrarDecision(
    decision: 'like' | 'pass'
  ) {
    if (!perfilActual) {
      return;
    }


    try {
      setProcesando(true);


      // ------------------------------------------------------
      // LLAMAR RPC DE SUPABASE
      // ------------------------------------------------------
      //
      // register_swipe:
      //
      // - guarda Like o Pass;
      // - comprueba Like recíproco;
      // - crea Match si corresponde.
      // ------------------------------------------------------

      const {
        data,
        error,
      } = await supabase.rpc(
        'register_swipe',
        {
          p_target_id:
            perfilActual.id,

          p_decision:
            decision,
        }
      );


      if (error) {
        throw error;
      }


      // ------------------------------------------------------
      // COMPROBAR MATCH
      // ------------------------------------------------------

      const resultado =
        Array.isArray(data)
          ? data[0]
          : null;


      const huboMatch =
        resultado?.is_match ===
        true;


      // ------------------------------------------------------
      // QUITAR PERFIL ACTUAL
      // ------------------------------------------------------

      setPerfiles(
        (
          perfilesActuales
        ) =>
          perfilesActuales.filter(
            (perfil) =>
              perfil.id !==
              perfilActual.id
          )
      );


      // ------------------------------------------------------
      // MATCH MUTUO
      // ------------------------------------------------------

      if (huboMatch) {
        Alert.alert(
          '💚 ¡Hicieron Match!',
          `Tú y ${
            perfilActual.full_name ??
            'este usuario'
          } se dieron Me gusta mutuamente.`
        );


        return;
      }


      // ------------------------------------------------------
      // LIKE REGISTRADO SIN MATCH
      // ------------------------------------------------------

      if (
        decision ===
        'like'
      ) {
        console.log(
          'Like registrado correctamente.'
        );
      }
    } catch (
      error: any
    ) {
      console.log(
        'Error registrando decisión:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo registrar tu decisión.'
      );
    } finally {
      setProcesando(false);
    }
  }


  // ==========================================================
  // PANTALLA DE CARGA
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
            Buscando deportistas compatibles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // SIN PERFILES
  // ==========================================================

  if (!perfilActual) {
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
            🏅
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
            No hay más perfiles por ahora
          </Text>


          <Text
            style={[
              styles.emptyDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Ya revisaste todos los deportistas disponibles.
            Cuando aparezcan nuevos usuarios podrás encontrarlos aquí.
          </Text>


          <TouchableOpacity
            style={[
              styles.reloadButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={
              cargarPerfiles
            }
          >
            <Text
              style={
                styles.reloadButtonText
              }
            >
              Buscar nuevamente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // INTERFAZ PRINCIPAL
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
            TÍTULO
        ================================================== */}

        <View
          style={
            styles.headerContainer
          }
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Match Deportivo 1v1
          </Text>


          <Text
            style={[
              styles.headerSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Perfiles priorizados según tus preferencias deportivas
          </Text>
        </View>


        {/* ==================================================
            TARJETA DEL USUARIO
        ================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          {/* Avatar temporal */}

          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor:
                  colors.primarySoft,

                borderColor:
                  isDark
                    ? colors.border
                    : 'transparent',
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


          {/* Nombre + Edad */}

          <Text
            style={[
              styles.userName,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {perfilActual.full_name ??
              'Usuario FitMatch'}

            {perfilActual.age
              ? `, ${perfilActual.age}`
              : ''}
          </Text>


          {/* ==================================================
              AFINIDAD
          ================================================== */}

          {perfilActual.deportesEnComun.length >
          0 ? (
            <View
              style={[
                styles.compatibilityBox,
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
                🎯{' '}
                {
                  perfilActual
                    .deportesEnComun
                    .length
                }{' '}
                {perfilActual
                  .deportesEnComun
                  .length === 1
                  ? 'deporte en común'
                  : 'deportes en común'}
              </Text>


              <Text
                style={[
                  styles.compatibilitySports,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {obtenerDeportesEnComun(
                  perfilActual.deportesEnComun
                )}
              </Text>


              {perfilActual.mismoNivel && (
                <Text
                  style={[
                    styles.sameLevelText,
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
          ) : (
            <View
              style={[
                styles.compatibilityBox,
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
                  styles.noCommonSports,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {perfilActual.mismoNivel
                  ? '🎯 Mismo nivel deportivo, sin deportes en común configurados.'
                  : 'Sin deportes en común configurados.'}
              </Text>
            </View>
          )}


          {/* Deportes */}

          <Text
            style={[
              styles.userSport,
              {
                color:
                  isDark
                    ? '#93C5FD'
                    : '#2563EB',
              },
            ]}
          >
            {obtenerDeportes(
              perfilActual.sports
            )}
          </Text>


          {/* Nivel */}

          <Text
            style={[
              styles.userLevel,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Nivel:{' '}

            {perfilActual.skill_level ??
              'No especificado'}
          </Text>


          {/* Biografía */}

          <Text
            style={[
              styles.userBio,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {perfilActual.bio
              ? `"${perfilActual.bio}"`
              : 'Este usuario todavía no ha agregado una biografía.'}
          </Text>
        </View>


        {/* ==================================================
            BOTONES LIKE / PASS
        ================================================== */}

        <View
          style={
            styles.actions
          }
        >
          {/* PASS */}

          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor:
                  '#EF4444',

                backgroundColor:
                  colors.card,

                opacity:
                  procesando
                    ? 0.6
                    : 1,
              },
            ]}
            disabled={
              procesando
            }
            onPress={() =>
              registrarDecision(
                'pass'
              )
            }
            accessibilityLabel="Descartar perfil"
          >
            {procesando ? (
              <ActivityIndicator
                size="small"
                color="#EF4444"
              />
            ) : (
              <Text
                style={
                  styles.actionEmoji
                }
              >
                ❌
              </Text>
            )}
          </TouchableOpacity>


          {/* LIKE */}

          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor:
                  '#22C55E',

                backgroundColor:
                  colors.card,

                opacity:
                  procesando
                    ? 0.6
                    : 1,
              },
            ]}
            disabled={
              procesando
            }
            onPress={() =>
              registrarDecision(
                'like'
              )
            }
            accessibilityLabel="Dar me gusta al perfil"
          >
            {procesando ? (
              <ActivityIndicator
                size="small"
                color="#22C55E"
              />
            ) : (
              <Text
                style={
                  styles.actionEmoji
                }
              >
                💚
              </Text>
            )}
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

      padding: 20,

      justifyContent:
        'space-between',

      alignItems:
        'center',
    },


    // ========================================================
    // ENCABEZADO
    // ========================================================

    headerContainer: {
      alignItems:
        'center',

      width: '100%',
    },


    headerTitle: {
      fontSize: 22,

      fontWeight:
        'bold',

      marginTop: 10,

      textAlign:
        'center',
    },


    headerSubtitle: {
      fontSize: 12,

      marginTop: 5,

      textAlign:
        'center',
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
    // TARJETA
    // ========================================================

    card: {
      width: '100%',

      maxWidth: 520,

      minHeight: '58%',

      borderRadius: 20,

      padding: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      elevation: 4,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.12,

      shadowRadius: 5,
    },


    avatarPlaceholder: {
      width: 100,

      height: 100,

      borderRadius: 50,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginBottom: 14,

      borderWidth: 1,
    },


    avatarEmoji: {
      fontSize: 54,
    },


    userName: {
      fontSize: 22,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    // ========================================================
    // AFINIDAD
    // ========================================================

    compatibilityBox: {
      width: '100%',

      maxWidth: 390,

      borderWidth: 1,

      borderRadius: 12,

      paddingHorizontal: 12,

      paddingVertical: 10,

      marginTop: 14,

      alignItems:
        'center',
    },


    compatibilityTitle: {
      fontSize: 13,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    compatibilitySports: {
      fontSize: 12,

      fontWeight:
        '600',

      textAlign:
        'center',

      marginTop: 5,

      lineHeight: 18,
    },


    sameLevelText: {
      fontSize: 11,

      textAlign:
        'center',

      marginTop: 5,
    },


    noCommonSports: {
      fontSize: 12,

      textAlign:
        'center',

      lineHeight: 18,
    },


    // ========================================================
    // INFORMACIÓN
    // ========================================================

    userSport: {
      fontSize: 14,

      fontWeight:
        '600',

      marginTop: 12,

      textAlign:
        'center',

      lineHeight: 21,
    },


    userLevel: {
      fontSize: 13,

      marginTop: 7,

      fontWeight:
        '600',
    },


    userBio: {
      fontSize: 14,

      textAlign:
        'center',

      marginTop: 14,

      paddingHorizontal: 10,

      lineHeight: 20,
    },


    // ========================================================
    // ACCIONES
    // ========================================================

    actions: {
      flexDirection:
        'row',

      gap: 30,

      marginBottom: 10,
    },


    circleBtn: {
      width: 65,

      height: 65,

      borderRadius: 33,

      borderWidth: 2,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    actionEmoji: {
      fontSize: 24,
    },


    // ========================================================
    // SIN PERFILES
    // ========================================================

    emptyContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal: 30,
    },


    emptyEmoji: {
      fontSize: 64,

      marginBottom: 18,
    },


    emptyTitle: {
      fontSize: 21,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    emptyDescription: {
      fontSize: 14,

      textAlign:
        'center',

      lineHeight: 21,

      marginTop: 10,

      maxWidth: 420,
    },


    reloadButton: {
      marginTop: 22,

      paddingHorizontal: 22,

      paddingVertical: 12,

      borderRadius: 10,
    },


    reloadButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 14,
    },
  });
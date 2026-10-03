// ============================================================
// FITMATCH - MATCH DEPORTIVO 1V1
// ============================================================
//
// Esta pantalla:
//
// - Obtiene perfiles reales desde Supabase.
// - Excluye al usuario autenticado.
// - Excluye perfiles ya evaluados con Like / Pass.
// - Prioriza deportes en común.
// - Considera nivel deportivo.
// - Calcula distancia sin obtener coordenadas ajenas.
// - Respeta el radio de búsqueda configurado.
// - Permite abrir el detalle completo del deportista.
// - Registra Like / Pass.
// - Detecta Match mutuo.
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

interface PerfilMatch {
  id: string;

  full_name: string | null;

  age: number | null;

  bio: string | null;

  sports: string[] | null;

  skill_level: string | null;

  deportesEnComun: string[];

  mismoNivel: boolean;

  puntajeOrden: number;

  distanceKm: number | null;
}


interface DistanciaPerfil {
  target_id: string;

  distance_km: number;
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
  const router =
    useRouter();


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


  const [
    radioBusqueda,
    setRadioBusqueda,
  ] = useState(25);


  // ==========================================================
  // PERFIL ACTUAL
  // ==========================================================

  const perfilActual =
    perfiles.length > 0
      ? perfiles[0]
      : null;


  // ==========================================================
  // RECARGAR AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfiles();
    }, [])
  );


  // ==========================================================
  // CARGAR PERFILES
  // ==========================================================

  async function cargarPerfiles() {
    try {
      setCargando(
        true
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
      // 2. MIS PREFERENCIAS
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
            skill_level,
            search_radius_km
          `)
          .eq(
            'id',
            user.id
          )
          .maybeSingle();


      if (miPerfilError) {
        throw miPerfilError;
      }


      const misDeportes: string[] =
        Array.isArray(
          miPerfil?.sports
        )
          ? miPerfil.sports
          : [];


      const miNivel: string | null =
        miPerfil?.skill_level ??
        null;


      // ------------------------------------------------------
      // 3. RADIO DE BÚSQUEDA
      // ------------------------------------------------------

      const radioActual =
        typeof miPerfil
          ?.search_radius_km ===
          'number'
          ? miPerfil.search_radius_km
          : 25;


      setRadioBusqueda(
        radioActual
      );


      // ------------------------------------------------------
      // 4. DISTANCIAS
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


      if (distanciasError) {
        throw distanciasError;
      }


      const mapaDistancias =
        new Map<
          string,
          number
        >();


      (
        (
          distanciasData ??
          []
        ) as DistanciaPerfil[]
      ).forEach(
        (
          distancia
        ) => {
          mapaDistancias.set(
            distancia.target_id,

            Number(
              distancia.distance_km
            )
          );
        }
      );


      // ------------------------------------------------------
      // 5. SWIPES YA REALIZADOS
      // ------------------------------------------------------

      const {
        data:
          swipesData,

        error:
          swipesError,
      } =
        await supabase
          .from(
            'profile_swipes'
          )
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
            (
              swipe
            ) =>
              swipe.target_id
          )
        );


      // ------------------------------------------------------
      // 6. OBTENER PERFILES
      // ------------------------------------------------------

      const {
        data:
          perfilesData,

        error:
          perfilesError,
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
            sports,
            skill_level
          `)
          .neq(
            'id',
            user.id
          );


      if (perfilesError) {
        throw perfilesError;
      }


      // ------------------------------------------------------
      // 7. EXCLUIR LOS YA EVALUADOS
      // ------------------------------------------------------

      const perfilesSinEvaluar =
        (
          perfilesData ??
          []
        ).filter(
          (
            perfil
          ) =>
            !perfilesYaEvaluados.has(
              perfil.id
            )
        );


      // ------------------------------------------------------
      // 8. APLICAR RADIO
      // ------------------------------------------------------

      const perfilesDentroDelRadio =
        perfilesSinEvaluar.filter(
          (
            perfil
          ) => {
            // Sin límite.

            if (
              radioActual ===
              0
            ) {
              return true;
            }


            const distancia =
              mapaDistancias.get(
                perfil.id
              );


            // Si existe un límite y no conocemos
            // la distancia, no podemos garantizar
            // que esté dentro del radio.

            if (
              distancia ===
              undefined
            ) {
              return false;
            }


            return (
              distancia <=
              radioActual
            );
          }
        );


      // ------------------------------------------------------
      // 9. AFINIDAD
      // ------------------------------------------------------

      const perfilesConAfinidad: PerfilMatch[] =
        perfilesDentroDelRadio.map(
          (
            perfil
          ) => {
            const deportesPerfil: string[] =
              Array.isArray(
                perfil.sports
              )
                ? perfil.sports
                : [];


            const deportesEnComun =
              misDeportes.filter(
                (
                  deporteId
                ) =>
                  deportesPerfil.includes(
                    deporteId
                  )
              );


            const mismoNivel =
              Boolean(
                miNivel &&
                perfil.skill_level &&
                miNivel ===
                  perfil.skill_level
              );


            // +10 por deporte compartido.
            // +2 por mismo nivel.
            //
            // Esto es solamente criterio de orden,
            // no un porcentaje de compatibilidad.

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


            const distanceKm =
              mapaDistancias.get(
                perfil.id
              ) ??
              null;


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

              distanceKm,
            };
          }
        );


      // ------------------------------------------------------
      // 10. ORDENAR
      // ------------------------------------------------------

      perfilesConAfinidad.sort(
        (
          perfilA,
          perfilB
        ) => {
          // Afinidad.

          if (
            perfilB.puntajeOrden !==
            perfilA.puntajeOrden
          ) {
            return (
              perfilB.puntajeOrden -
              perfilA.puntajeOrden
            );
          }


          // Deportes compartidos.

          if (
            perfilB.deportesEnComun.length !==
            perfilA.deportesEnComun.length
          ) {
            return (
              perfilB.deportesEnComun.length -
              perfilA.deportesEnComun.length
            );
          }


          // Distancia.

          if (
            perfilA.distanceKm !==
              null &&
            perfilB.distanceKm !==
              null &&
            perfilA.distanceKm !==
              perfilB.distanceKm
          ) {
            return (
              perfilA.distanceKm -
              perfilB.distanceKm
            );
          }


          // Perfiles con distancia primero.

          if (
            perfilA.distanceKm !==
              null &&
            perfilB.distanceKm ===
              null
          ) {
            return -1;
          }


          if (
            perfilA.distanceKm ===
              null &&
            perfilB.distanceKm !==
              null
          ) {
            return 1;
          }


          // Nombre.

          return (
            perfilA.full_name ??
            ''
          ).localeCompare(
            perfilB.full_name ??
            ''
          );
        }
      );


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


      setPerfiles(
        []
      );
    } finally {
      setCargando(
        false
      );
    }
  }


  // ==========================================================
  // TEXTO RADIO
  // ==========================================================

  function obtenerTextoRadio() {
    if (
      radioBusqueda ===
      0
    ) {
      return 'Sin límite de distancia';
    }


    return `Hasta ${radioBusqueda} km`;
  }


  // ==========================================================
  // DEPORTES
  // ==========================================================

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
      return 'Deportes no configurados';
    }


    return sports
      .map(
        (
          deporteId
        ) => {
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
      )
      .join(
        ' / '
      );
  }


  // ==========================================================
  // DEPORTES COMPARTIDOS
  // ==========================================================

  function obtenerDeportesEnComun(
    sports:
      string[]
  ) {
    return sports
      .map(
        (
          deporteId
        ) => {
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
      )
      .join(
        ' · '
      );
  }


  // ==========================================================
  // DISTANCIA
  // ==========================================================

  function obtenerTextoDistancia(
    distanceKm:
      number |
      null
  ) {
    if (
      distanceKm ===
      null
    ) {
      return '📍 Distancia no disponible';
    }


    if (
      distanceKm <
      1
    ) {
      return '📍 A menos de 1 km de ti';
    }


    return `📍 A ${distanceKm.toFixed(
      1
    )} km de ti`;
  }


  // ==========================================================
  // ABRIR DETALLE DEL DEPORTISTA
  // ==========================================================

  function abrirDetallePerfil() {
    if (!perfilActual) {
      return;
    }


    router.push({
      pathname:
        '/deportista/[profileId]',

      params: {
        profileId:
          perfilActual.id,
      },
    });
  }


  // ==========================================================
  // LIKE / PASS
  // ==========================================================

  async function registrarDecision(
    decision:
      'like' |
      'pass'
  ) {
    if (!perfilActual) {
      return;
    }


    try {
      setProcesando(
        true
      );


      const {
        data,
        error,
      } =
        await supabase.rpc(
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


      const resultado =
        Array.isArray(
          data
        )
          ? data[0]
          : null;


      const huboMatch =
        resultado
          ?.is_match ===
        true;


      // Eliminar la tarjeta actual.

      setPerfiles(
        (
          perfilesActuales
        ) =>
          perfilesActuales.filter(
            (
              perfil
            ) =>
              perfil.id !==
              perfilActual.id
          )
      );


      // Match mutuo.

      if (
        huboMatch
      ) {
        Alert.alert(
          '💚 ¡Hicieron Match!',
          `Tú y ${
            perfilActual.full_name ??
            'este usuario'
          } se dieron Me gusta mutuamente.`
        );


        return;
      }


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
      setProcesando(
        false
      );
    }
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
            Buscando deportistas compatibles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // SIN PERFILES
  // ==========================================================

  if (
    !perfilActual
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
            No hay perfiles disponibles
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
            No encontramos más deportistas disponibles dentro de tu configuración actual.
          </Text>


          <Text
            style={[
              styles.emptyRadiusText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            📍 {obtenerTextoRadio()}
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


          <TouchableOpacity
            style={[
              styles.profileSettingsButton,
              {
                borderColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              router.push(
                '/(tabs)/perfil'
              )
            }
          >
            <Text
              style={[
                styles.profileSettingsText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              Cambiar radio de búsqueda
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
            ENCABEZADO
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
            Perfiles priorizados por deporte, nivel y cercanía
          </Text>


          <View
            style={[
              styles.radiusBadge,
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
                styles.radiusBadgeText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              📍 {obtenerTextoRadio()}
            </Text>
          </View>
        </View>


        {/* ==================================================
            TARJETA
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
          {/* AVATAR */}

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


          {/* NOMBRE */}

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


          {/* DISTANCIA */}

          <Text
            style={[
              styles.distanceText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {obtenerTextoDistancia(
              perfilActual.distanceKm
            )}
          </Text>


          {/* ==================================================
              COMPATIBILIDAD
          ================================================== */}

          {perfilActual
            .deportesEnComun
            .length > 0 ? (
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
                  perfilActual
                    .deportesEnComun
                )}
              </Text>


              {perfilActual
                .mismoNivel && (
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
                {perfilActual
                  .mismoNivel
                  ? '🎯 Mismo nivel deportivo, sin deportes en común configurados.'
                  : 'Sin deportes en común configurados.'}
              </Text>
            </View>
          )}


          {/* DEPORTES */}

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


          {/* NIVEL */}

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


          {/* BIO */}

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


          {/* ==================================================
              RF13 - VER PERFIL COMPLETO
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.detailButton,
              {
                borderColor:
                  colors.primary,

                backgroundColor:
                  colors.primarySoft,
              },
            ]}
            onPress={
              abrirDetallePerfil
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
              Ver perfil completo
            </Text>
          </TouchableOpacity>
        </View>


        {/* ==================================================
            LIKE / PASS
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
      flexGrow: 1,

      width: '100%',

      padding: 20,

      alignItems:
        'center',

      justifyContent:
        'space-between',
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


    radiusBadge: {
      marginTop: 8,

      paddingHorizontal: 12,

      paddingVertical: 6,

      borderRadius: 16,

      borderWidth: 1,
    },


    radiusBadgeText: {
      fontSize: 11,

      fontWeight:
        '700',
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

      borderRadius: 20,

      padding: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      marginTop: 24,

      marginBottom: 22,

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


    distanceText: {
      fontSize: 12,

      fontWeight:
        '600',

      marginTop: 7,

      textAlign:
        'center',
    },


    // ========================================================
    // COMPATIBILIDAD
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
    // DETALLE DE PERFIL
    // ========================================================

    detailButton: {
      width: '100%',

      maxWidth: 300,

      borderWidth: 1,

      borderRadius: 10,

      paddingVertical: 11,

      alignItems:
        'center',

      marginTop: 18,
    },


    detailButtonText: {
      fontSize: 13,

      fontWeight:
        '700',
    },


    // ========================================================
    // BOTONES
    // ========================================================

    actions: {
      flexDirection:
        'row',

      gap: 30,

      marginBottom: 16,
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
    // SIN RESULTADOS
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


    emptyRadiusText: {
      fontSize: 13,

      fontWeight:
        '600',

      marginTop: 12,

      textAlign:
        'center',
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


    profileSettingsButton: {
      marginTop: 10,

      paddingHorizontal: 20,

      paddingVertical: 10,

      borderRadius: 10,

      borderWidth: 1,
    },


    profileSettingsText: {
      fontSize: 13,

      fontWeight:
        '600',
    },
  });
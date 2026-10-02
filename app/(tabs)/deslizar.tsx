// ============================================================
// FITMATCH - MATCH DEPORTIVO 1V1
// ============================================================
// Esta pantalla:
//
// - Obtiene perfiles reales desde Supabase.
// - Nunca muestra al usuario autenticado.
// - No vuelve a mostrar perfiles que ya recibieron Like o Pass.
// - ❌ registra un "pass".
// - 💚 registra un "like".
// - Si ambos usuarios se dieron Like, Supabase crea un Match.
// - Mantiene compatibilidad con modo claro / oscuro.
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
}


// ============================================================
// CATÁLOGO DE DEPORTES
// ============================================================
// Los IDs coinciden con los valores guardados actualmente
// en profiles.sports.
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

  // Perfiles disponibles para Match.
  const [
    perfiles,
    setPerfiles,
  ] = useState<PerfilMatch[]>([]);


  // Estado mientras consultamos Supabase.
  const [
    cargando,
    setCargando,
  ] = useState(true);


  // Estado mientras registramos Like / Pass.
  const [
    procesando,
    setProcesando,
  ] = useState(false);


  // ==========================================================
  // PERFIL ACTUAL
  // ==========================================================
  //
  // Siempre mostramos el primer perfil disponible.
  //
  // Al dar Like o Pass lo eliminamos de la lista y automáticamente
  // aparece el siguiente.
  // ==========================================================

  const perfilActual =
    perfiles.length > 0
      ? perfiles[0]
      : null;


  // ==========================================================
  // CARGAR PERFILES AL ENTRAR A LA PANTALLA
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
      // 2. OBTENER SWIPES QUE YA REALIZÓ EL USUARIO
      // ------------------------------------------------------
      //
      // Esto evita volver a mostrar perfiles a los que ya
      // dimos Like o Pass.
      // ------------------------------------------------------

      const {
        data: swipesData,
        error: swipesError,
      } = await supabase
        .from('profile_swipes')
        .select('target_id')
        .eq(
          'swiper_id',
          user.id
        );


      if (swipesError) {
        throw swipesError;
      }


      const perfilesYaEvaluados =
        new Set(
          (swipesData ?? []).map(
            (swipe) =>
              swipe.target_id
          )
        );


      // ------------------------------------------------------
      // 3. OBTENER PERFILES
      // ------------------------------------------------------
      //
      // Excluimos al propio usuario.
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
      // 4. QUITAR LOS PERFILES YA EVALUADOS
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


      setPerfiles(
        perfilesDisponibles
      );
    } catch (error: any) {
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


    const nombres =
      sports.map(
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
      );


    return nombres.join(
      ' / '
    );
  }


  // ==========================================================
  // REGISTRAR LIKE O PASS
  // ==========================================================

  async function registrarDecision(
    decision: 'like' | 'pass'
  ) {
    // Si no existe un perfil actual, no hacemos nada.
    if (!perfilActual) {
      return;
    }


    try {
      setProcesando(true);


      // ------------------------------------------------------
      // LLAMAR FUNCIÓN DE SUPABASE
      // ------------------------------------------------------
      //
      // register_swipe:
      //
      // - guarda Like o Pass;
      // - comprueba si existe Like de vuelta;
      // - crea Match automáticamente si corresponde.
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
      // COMPROBAR SI HUBO MATCH
      // ------------------------------------------------------
      //
      // La función devuelve algo similar a:
      //
      // [
      //   {
      //     is_match: true,
      //     match_id: "uuid..."
      //   }
      // ]
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
      //
      // El siguiente perfil aparecerá automáticamente.
      // ------------------------------------------------------

      setPerfiles(
        (perfilesActuales) =>
          perfilesActuales.filter(
            (perfil) =>
              perfil.id !==
              perfilActual.id
          )
      );


      // ------------------------------------------------------
      // SI HUBO MATCH
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
      // LIKE SIN MATCH
      // ------------------------------------------------------

      if (
        decision ===
        'like'
      ) {
        console.log(
          'Like registrado correctamente.'
        );
      }
    } catch (error: any) {
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
            Buscando deportistas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // SIN PERFILES DISPONIBLES
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

const styles = StyleSheet.create({
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


  headerTitle: {
    fontSize: 22,

    fontWeight: 'bold',

    marginTop: 10,

    textAlign:
      'center',
  },


  // ==========================================================
  // CARGA
  // ==========================================================

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


  // ==========================================================
  // TARJETA
  // ==========================================================

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
    width: 110,

    height: 110,

    borderRadius: 55,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginBottom: 16,

    borderWidth: 1,
  },


  avatarEmoji: {
    fontSize: 60,
  },


  userName: {
    fontSize: 22,

    fontWeight: 'bold',

    textAlign:
      'center',
  },


  userSport: {
    fontSize: 14,

    fontWeight: '600',

    marginTop: 8,

    textAlign:
      'center',

    lineHeight: 21,
  },


  userLevel: {
    fontSize: 13,

    marginTop: 7,

    fontWeight: '600',
  },


  userBio: {
    fontSize: 14,

    textAlign:
      'center',

    marginTop: 14,

    paddingHorizontal: 10,

    lineHeight: 20,
  },


  // ==========================================================
  // ACCIONES
  // ==========================================================

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


  // ==========================================================
  // SIN PERFILES
  // ==========================================================

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

    fontWeight: 'bold',

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
    color: '#FFFFFF',

    fontWeight: 'bold',

    fontSize: 14,
  },
});
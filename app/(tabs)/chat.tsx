// ============================================================
// FITMATCH - LISTA DE CHATS
// ============================================================
//
// Esta pantalla:
//
// - Obtiene al usuario autenticado.
// - Consulta sus Matches reales desde Supabase.
// - Identifica quién es el otro usuario de cada Match.
// - Obtiene el perfil real del otro usuario.
// - Muestra una conversación por cada Match.
// - Permite abrir la conversación individual.
//
// Tablas utilizadas:
//
// public.matches
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
// TIPO DE CHAT
// ============================================================

interface ChatMatch {
  matchId: string;

  userId: string;

  nombre: string;

  edad: number | null;

  deportes: string[];

  nivel: string | null;

  createdAt: string;
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

export default function ChatScreen() {
  const router = useRouter();

  const {
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    chats,
    setChats,
  ] = useState<ChatMatch[]>([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  // ==========================================================
  // RECARGAR AL ENTRAR A LA PESTAÑA
  // ==========================================================
  //
  // Cuando se cree un Match real y luego regreses a
  // Mensajes, la lista se actualizará automáticamente.
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarChats();
    }, [])
  );


  // ==========================================================
  // CARGAR MATCHES REALES
  // ==========================================================

  async function cargarChats() {
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
      // 2. OBTENER LOS MATCHES DEL USUARIO
      // ------------------------------------------------------
      //
      // Un Match puede guardar al usuario como:
      //
      // user_a
      //
      // o
      //
      // user_b
      //
      // ------------------------------------------------------

      const {
        data: matchesData,
        error: matchesError,
      } = await supabase
        .from('matches')
        .select(
          `
          id,
          user_a,
          user_b,
          created_at
          `
        )
        .or(
          `user_a.eq.${user.id},user_b.eq.${user.id}`
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );


      if (matchesError) {
        throw matchesError;
      }


      // ------------------------------------------------------
      // 3. SI NO HAY MATCHES
      // ------------------------------------------------------

      if (
        !matchesData ||
        matchesData.length === 0
      ) {
        setChats([]);

        return;
      }


      // ------------------------------------------------------
      // 4. OBTENER LOS IDS DE LOS OTROS USUARIOS
      // ------------------------------------------------------

      const otrosUsuariosIds =
        matchesData.map(
          (match) => {
            return match.user_a ===
              user.id
              ? match.user_b
              : match.user_a;
          }
        );


      // ------------------------------------------------------
      // 5. OBTENER LOS PERFILES
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
          sports,
          skill_level
          `
        )
        .in(
          'id',
          otrosUsuariosIds
        );


      if (perfilesError) {
        throw perfilesError;
      }


      // ------------------------------------------------------
      // 6. CREAR LA LISTA DE CHATS
      // ------------------------------------------------------

      const chatsReales: ChatMatch[] =
        matchesData.map(
          (match) => {
            // Descubrir cuál de los dos usuarios
            // es la otra persona.

            const otroUsuarioId =
              match.user_a ===
              user.id
                ? match.user_b
                : match.user_a;


            // Buscar su perfil.

            const perfil =
              (
                perfilesData ??
                []
              ).find(
                (item) =>
                  item.id ===
                  otroUsuarioId
              );


            return {
              matchId:
                match.id,

              userId:
                otroUsuarioId,

              nombre:
                perfil?.full_name ??
                'Usuario FitMatch',

              edad:
                perfil?.age ??
                null,

              deportes:
                Array.isArray(
                  perfil?.sports
                )
                  ? perfil.sports
                  : [],

              nivel:
                perfil?.skill_level ??
                null,

              createdAt:
                match.created_at,
            };
          }
        );


      setChats(
        chatsReales
      );
    } catch (error: any) {
      console.log(
        'Error cargando chats:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron cargar tus conversaciones.'
      );


      setChats([]);
    } finally {
      setCargando(false);
    }
  }


  // ==========================================================
  // MOSTRAR DEPORTES
  // ==========================================================

  function obtenerDeportes(
    deportes: string[]
  ) {
    if (
      deportes.length === 0
    ) {
      return 'Deportes no configurados';
    }


    return deportes
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
  // PANTALLA
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
          Mensajes
        </Text>


        {/* ==================================================
            CARGANDO
        ================================================== */}

        {cargando ? (
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
              Cargando conversaciones...
            </Text>
          </View>
        ) : chats.length === 0 ? (
          /* ==================================================
             SIN MATCHES
          ================================================== */

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
            <Text
              style={
                styles.icon
              }
            >
              💬
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
              Aún no tienes chats activos
            </Text>


            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Cuando tú y otro deportista se den Me gusta
              mutuamente, su conversación aparecerá aquí.
            </Text>
          </View>
        ) : (
          /* ==================================================
             LISTA DE MATCHES
          ================================================== */

          <View
            style={
              styles.chatList
            }
          >
            {chats.map(
              (chat) => (
                <TouchableOpacity
                  key={
                    chat.matchId
                  }
                  style={[
                    styles.chatCard,
                    {
                      backgroundColor:
                        colors.card,

                      borderColor:
                        colors.border,
                    },
                  ]}
                  activeOpacity={0.8}

                  // ==========================================
                  // ABRIR CONVERSACIÓN INDIVIDUAL
                  // ==========================================
                  //
                  // Envía el ID del Match a:
                  //
                  // app/conversacion/[matchId].tsx
                  //
                  // ==========================================

                  onPress={() =>
                    router.push({
                      pathname:
                        '/conversacion/[matchId]',

                      params: {
                        matchId:
                          chat.matchId,
                      },
                    })
                  }
                >
                  {/* ==========================================
                      AVATAR
                  ========================================== */}

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


                  {/* ==========================================
                      INFORMACIÓN
                  ========================================== */}

                  <View
                    style={
                      styles.chatInfo
                    }
                  >
                    <Text
                      style={[
                        styles.chatName,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {chat.nombre}

                      {chat.edad
                        ? `, ${chat.edad}`
                        : ''}
                    </Text>


                    <Text
                      style={[
                        styles.chatSports,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {obtenerDeportes(
                        chat.deportes
                      )}
                    </Text>


                    <Text
                      style={[
                        styles.chatLevel,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Nivel:{' '}

                      {chat.nivel ??
                        'No especificado'}
                    </Text>
                  </View>


                  {/* ==========================================
                      FLECHA
                  ========================================== */}

                  <Text
                    style={[
                      styles.chevron,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
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
    },


    headerTitle: {
      fontSize: 22,

      fontWeight:
        'bold',
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
    // SIN CHATS
    // ========================================================

    emptyCard: {
      marginTop: 20,

      padding: 24,

      borderRadius: 14,

      borderWidth: 1,

      alignItems:
        'center',
    },


    icon: {
      fontSize: 38,

      marginBottom: 12,
    },


    emptyTitle: {
      fontSize: 16,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    emptyText: {
      fontSize: 13,

      textAlign:
        'center',

      marginTop: 6,

      lineHeight: 19,

      maxWidth: 360,
    },


    // ========================================================
    // LISTA DE CHATS
    // ========================================================

    chatList: {
      marginTop: 18,

      gap: 10,
    },


    chatCard: {
      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderRadius: 14,

      padding: 14,
    },


    avatar: {
      width: 55,

      height: 55,

      borderRadius:
        28,

      justifyContent:
        'center',

      alignItems:
        'center',

      borderWidth: 1,

      marginRight: 12,
    },


    avatarEmoji: {
      fontSize: 28,
    },


    chatInfo: {
      flex: 1,
    },


    chatName: {
      fontSize: 15,

      fontWeight:
        '700',
    },


    chatSports: {
      fontSize: 12,

      marginTop: 4,
    },


    chatLevel: {
      fontSize: 11,

      marginTop: 3,
    },


    chevron: {
      fontSize: 28,

      marginLeft: 8,
    },
  });
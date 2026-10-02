// ============================================================
// FITMATCH - CONVERSACIÓN PRIVADA
// ============================================================
// Esta pantalla:
//
// - Recibe el ID de un Match.
// - Comprueba que el usuario pertenece al Match.
// - Obtiene el perfil de la otra persona.
// - Carga los mensajes guardados en Supabase.
// - Permite enviar nuevos mensajes.
// - Los mensajes quedan persistidos en public.messages.
//
// Tablas utilizadas:
//
// public.matches
// public.profiles
// public.messages
// ============================================================

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';


// ============================================================
// TIPO DE MENSAJE
// ============================================================

interface Mensaje {
  id: string;

  match_id: string;

  sender_id: string;

  content: string;

  created_at: string;
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ConversacionScreen() {
  const router = useRouter();

  const {
    matchId,
  } = useLocalSearchParams<{
    matchId: string;
  }>();


  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    usuarioActualId,
    setUsuarioActualId,
  ] = useState('');


  const [
    nombreOtroUsuario,
    setNombreOtroUsuario,
  ] = useState(
    'Usuario FitMatch'
  );


  const [
    mensajes,
    setMensajes,
  ] = useState<Mensaje[]>([]);


  const [
    nuevoMensaje,
    setNuevoMensaje,
  ] = useState('');


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    enviando,
    setEnviando,
  ] = useState(false);


  // ==========================================================
  // NORMALIZAR MATCH ID
  // ==========================================================

  const matchIdActual =
    Array.isArray(matchId)
      ? matchId[0]
      : matchId;


  // ==========================================================
  // CARGAR CONVERSACIÓN
  // ==========================================================

  const cargarConversacion =
    useCallback(
      async () => {
        if (!matchIdActual) {
          return;
        }


        try {
          setCargando(true);


          // --------------------------------------------------
          // 1. OBTENER USUARIO AUTENTICADO
          // --------------------------------------------------

          const {
            data: { user },
            error: userError,
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


          setUsuarioActualId(
            user.id
          );


          // --------------------------------------------------
          // 2. OBTENER MATCH
          // --------------------------------------------------
          //
          // Gracias a RLS, solamente podremos consultar
          // Matches donde participa el usuario.
          // --------------------------------------------------

          const {
            data: match,
            error: matchError,
          } = await supabase
            .from('matches')
            .select(
              `
              id,
              user_a,
              user_b
              `
            )
            .eq(
              'id',
              matchIdActual
            )
            .maybeSingle();


          if (matchError) {
            throw matchError;
          }


          if (!match) {
            Alert.alert(
              'Conversación no disponible',
              'No se encontró este Match.'
            );

            router.back();

            return;
          }


          // --------------------------------------------------
          // 3. IDENTIFICAR AL OTRO USUARIO
          // --------------------------------------------------

          const otroUsuarioId =
            match.user_a ===
            user.id
              ? match.user_b
              : match.user_a;


          // --------------------------------------------------
          // 4. OBTENER PERFIL DEL OTRO USUARIO
          // --------------------------------------------------

          const {
            data: perfil,
            error: perfilError,
          } = await supabase
            .from('profiles')
            .select(
              `
              id,
              full_name
              `
            )
            .eq(
              'id',
              otroUsuarioId
            )
            .maybeSingle();


          if (perfilError) {
            throw perfilError;
          }


          setNombreOtroUsuario(
            perfil?.full_name ??
              'Usuario FitMatch'
          );


          // --------------------------------------------------
          // 5. CARGAR MENSAJES
          // --------------------------------------------------

          await cargarMensajes(
            matchIdActual
          );
        } catch (error: any) {
          console.log(
            'Error cargando conversación:',
            error
          );


          Alert.alert(
            'Error',
            error?.message ??
              'No se pudo cargar la conversación.'
          );
        } finally {
          setCargando(false);
        }
      },
      [
        matchIdActual,
        router,
      ]
    );


  // ==========================================================
  // CARGAR MENSAJES
  // ==========================================================

  async function cargarMensajes(
    idMatch: string
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('messages')
      .select(
        `
        id,
        match_id,
        sender_id,
        content,
        created_at
        `
      )
      .eq(
        'match_id',
        idMatch
      )
      .order(
        'created_at',
        {
          ascending: true,
        }
      );


    if (error) {
      throw error;
    }


    setMensajes(
      data ?? []
    );
  }


  // ==========================================================
  // CARGAR AL ENTRAR
  // ==========================================================

  useEffect(() => {
    cargarConversacion();
  }, [
    cargarConversacion,
  ]);


  // ==========================================================
  // ENVIAR MENSAJE
  // ==========================================================

  async function enviarMensaje() {
    const contenido =
      nuevoMensaje.trim();


    // No enviar mensajes vacíos.
    if (!contenido) {
      return;
    }


    // Protección adicional.
    if (
      !matchIdActual ||
      !usuarioActualId
    ) {
      return;
    }


    try {
      setEnviando(true);


      // ------------------------------------------------------
      // INSERTAR MENSAJE
      // ------------------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from('messages')
        .insert({
          match_id:
            matchIdActual,

          sender_id:
            usuarioActualId,

          content:
            contenido,
        })
        .select(
          `
          id,
          match_id,
          sender_id,
          content,
          created_at
          `
        )
        .single();


      if (error) {
        throw error;
      }


      // ------------------------------------------------------
      // LIMPIAR INPUT
      // ------------------------------------------------------

      setNuevoMensaje('');


      // ------------------------------------------------------
      // AGREGAR MENSAJE LOCALMENTE
      // ------------------------------------------------------
      //
      // Así aparece inmediatamente sin esperar otra consulta.
      // ------------------------------------------------------

      if (data) {
        setMensajes(
          (mensajesActuales) => [
            ...mensajesActuales,
            data,
          ]
        );
      }
    } catch (error: any) {
      console.log(
        'Error enviando mensaje:',
        error
      );


      Alert.alert(
        'Error al enviar',
        error?.message ??
          'No se pudo enviar el mensaje.'
      );
    } finally {
      setEnviando(false);
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
            Cargando conversación...
          </Text>
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
      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={[
            styles.header,
            {
              backgroundColor:
                colors.card,

              borderBottomColor:
                colors.border,
            },
          ]}
        >
          {/* Volver */}

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


          {/* Avatar */}

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


          {/* Nombre */}

          <View
            style={
              styles.headerInfo
            }
          >
            <Text
              style={[
                styles.headerName,
                {
                  color:
                    colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {nombreOtroUsuario}
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
              Match deportivo
            </Text>
          </View>
        </View>


        {/* ==================================================
            MENSAJES
        ================================================== */}

        <FlatList
          data={
            mensajes
          }
          keyExtractor={(
            item
          ) => item.id}
          contentContainerStyle={
            mensajes.length === 0
              ? styles.emptyMessagesContainer
              : styles.messagesContainer
          }
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => {
            const esMio =
              item.sender_id ===
              usuarioActualId;


            return (
              <View
                style={[
                  styles.messageRow,

                  esMio
                    ? styles.messageRowMine
                    : styles.messageRowOther,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,

                    {
                      backgroundColor:
                        esMio
                          ? colors.primary
                          : colors.card,

                      borderColor:
                        esMio
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color:
                          esMio
                            ? '#FFFFFF'
                            : colors.text,
                      },
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              style={
                styles.emptyMessages
              }
            >
              <Text
                style={
                  styles.emptyEmoji
                }
              >
                👋
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
                ¡Hicieron Match!
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
                Envía el primer mensaje y coordinen su próxima
                actividad deportiva.
              </Text>
            </View>
          }
        />


        {/* ==================================================
            INPUT DEL MENSAJE
        ================================================== */}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor:
                colors.card,

              borderTopColor:
                colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
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
              nuevoMensaje
            }
            onChangeText={
              setNuevoMensaje
            }
            placeholder="Escribe un mensaje..."
            placeholderTextColor={
              colors.secondaryText
            }
            multiline
            maxLength={1000}
          />


          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  colors.primary,

                opacity:
                  enviando ||
                  !nuevoMensaje.trim()
                    ? 0.5
                    : 1,
              },
            ]}
            disabled={
              enviando ||
              !nuevoMensaje.trim()
            }
            onPress={
              enviarMensaje
            }
          >
            {enviando ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.sendButtonText
                }
              >
                ➤
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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


    keyboardContainer: {
      flex: 1,
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
    // HEADER
    // ========================================================

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      borderBottomWidth:
        1,
    },


    backButton: {
      width: 38,

      height: 38,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginRight: 4,
    },


    backButtonText: {
      fontSize: 38,

      lineHeight: 38,

      fontWeight: '300',
    },


    avatar: {
      width: 44,

      height: 44,

      borderRadius: 22,

      justifyContent:
        'center',

      alignItems:
        'center',

      borderWidth: 1,

      marginRight: 10,
    },


    avatarEmoji: {
      fontSize: 23,
    },


    headerInfo: {
      flex: 1,
    },


    headerName: {
      fontSize: 16,

      fontWeight: '700',
    },


    headerSubtitle: {
      fontSize: 11,

      marginTop: 2,
    },


    // ========================================================
    // MENSAJES
    // ========================================================

    messagesContainer: {
      padding: 14,

      paddingBottom: 22,
    },


    emptyMessagesContainer: {
      flexGrow: 1,

      padding: 20,

      justifyContent:
        'center',
    },


    messageRow: {
      width: '100%',

      marginBottom: 9,
    },


    messageRowMine: {
      alignItems:
        'flex-end',
    },


    messageRowOther: {
      alignItems:
        'flex-start',
    },


    messageBubble: {
      maxWidth: '80%',

      paddingHorizontal:
        13,

      paddingVertical:
        9,

      borderRadius: 16,

      borderWidth: 1,
    },


    messageText: {
      fontSize: 14,

      lineHeight: 20,
    },


    // ========================================================
    // CHAT VACÍO
    // ========================================================

    emptyMessages: {
      alignItems:
        'center',

      paddingHorizontal:
        20,
    },


    emptyEmoji: {
      fontSize: 46,

      marginBottom: 12,
    },


    emptyTitle: {
      fontSize: 18,

      fontWeight: '700',

      textAlign:
        'center',
    },


    emptyText: {
      fontSize: 13,

      lineHeight: 19,

      textAlign:
        'center',

      marginTop: 7,

      maxWidth: 320,
    },


    // ========================================================
    // INPUT
    // ========================================================

    inputContainer: {
      flexDirection:
        'row',

      alignItems:
        'flex-end',

      padding: 10,

      gap: 8,

      borderTopWidth: 1,
    },


    messageInput: {
      flex: 1,

      minHeight: 44,

      maxHeight: 110,

      borderRadius: 22,

      borderWidth: 1,

      paddingHorizontal:
        15,

      paddingTop: 11,

      paddingBottom: 11,

      fontSize: 14,
    },


    sendButton: {
      width: 44,

      height: 44,

      borderRadius: 22,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    sendButtonText: {
      color: '#FFFFFF',

      fontSize: 19,

      fontWeight: 'bold',
    },
  });
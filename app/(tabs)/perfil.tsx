// ============================================================
// FITMATCH - PANTALLA DE PERFIL
// ============================================================
// Esta pantalla:
// - Obtiene al usuario autenticado desde Supabase Auth.
// - Carga sus datos desde public.profiles.
// - Permite editar información personal.
// - Muestra los deportes guardados en Supabase.
// - Muestra el nivel de juego guardado en Supabase.
// - Permite volver a editar preferencias deportivas.
// - Mantiene el modo claro / oscuro.
// - Permite cerrar sesión.
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
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';

// SafeAreaView recomendado actualmente para Expo / React Native.
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo Router.
import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

// Cliente de Supabase.
import { supabase } from '../../lib/supabase';

// Sistema global de tema de FitMatch.
import { useTheme } from '../../lib/ThemeContext';


// ============================================================
// CATÁLOGO DE DEPORTES
// ============================================================
// Los IDs coinciden con los valores que guardamos en
// profiles.sports.
//
// Ejemplo guardado en Supabase:
// {futbol,padel,running}
//
// Gracias a este arreglo podemos transformar:
// "futbol" -> "⚽ Fútbol"
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

export default function PerfilScreen() {
  // Navegación.
  const router = useRouter();

  // Tema global.
  const {
    isDark,
    colors,
    setTheme,
  } = useTheme();


  // ==========================================================
  // ESTADOS GENERALES DE LA PANTALLA
  // ==========================================================

  // Indica si estamos viendo o editando el perfil.
  const [modoEdicion, setModoEdicion] =
    useState(false);

  // Estado utilizado mientras Supabase carga el perfil.
  const [cargandoPerfil, setCargandoPerfil] =
    useState(true);

  // Estado utilizado mientras guardamos cambios.
  const [guardando, setGuardando] =
    useState(false);


  // ==========================================================
  // DATOS PERSONALES DEL USUARIO
  // ==========================================================

  const [nombre, setNombre] =
    useState('');

  const [edad, setEdad] =
    useState('');

  const [bio, setBio] =
    useState('');

  const [equipo, setEquipo] =
    useState('');

  const [instagram, setInstagram] =
    useState('');

  // El correo viene desde Supabase Auth.
  const [email, setEmail] =
    useState('');


  // ==========================================================
  // PREFERENCIAS DEPORTIVAS
  // ==========================================================
  // Estos datos YA NO son simulados.
  //
  // sports:
  // ['futbol', 'padel', 'running']
  //
  // skill_level:
  // 'Principiante'
  // 'Intermedio'
  // 'Avanzado'
  // ==========================================================

  const [deportes, setDeportes] =
    useState<string[]>([]);

  const [nivelJuego, setNivelJuego] =
    useState('');


  // ==========================================================
  // CARGAR PERFIL CUANDO ENTRAMOS A ESTA PANTALLA
  // ==========================================================
  //
  // useFocusEffect permite que el perfil se vuelva a consultar
  // cada vez que regresamos a esta pestaña.
  //
  // Esto es útil porque si modificamos deportes en deportes.tsx
  // y después volvemos al perfil, veremos los cambios nuevos.
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [])
  );


  // ==========================================================
  // CARGAR DATOS DESDE SUPABASE
  // ==========================================================

  async function cargarPerfil() {
    try {
      setCargandoPerfil(true);


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


      // Si no existe sesión, enviamos al login.
      if (!user) {
        Alert.alert(
          'Sesión no encontrada',
          'Debes iniciar sesión nuevamente.'
        );

        router.replace('/login');

        return;
      }


      // El correo está almacenado en Supabase Auth.
      setEmail(user.email ?? '');


      // ------------------------------------------------------
      // 2. BUSCAR PERFIL DEL USUARIO
      // ------------------------------------------------------
      //
      // La relación se realiza mediante:
      //
      // auth.users.id
      //        =
      // profiles.id
      //
      // Ahora también consultamos:
      // sports
      // skill_level
      // ------------------------------------------------------

      const {
        data: perfil,
        error: perfilError,
      } = await supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          age,
          bio,
          favorite_team,
          instagram,
          sports,
          skill_level
          `
        )
        .eq('id', user.id)
        .maybeSingle();


      if (perfilError) {
        throw perfilError;
      }


      // ------------------------------------------------------
      // 3. SI EXISTE PERFIL, CARGAR LOS DATOS
      // ------------------------------------------------------

      if (perfil) {
        // Nombre.
        setNombre(
          perfil.full_name ??
            user.user_metadata?.full_name ??
            ''
        );


        // Edad.
        setEdad(
          perfil.age !== null &&
          perfil.age !== undefined
            ? String(perfil.age)
            : ''
        );


        // Información personal.
        setBio(
          perfil.bio ?? ''
        );

        setEquipo(
          perfil.favorite_team ?? ''
        );

        setInstagram(
          perfil.instagram ?? ''
        );


        // ----------------------------------------------------
        // DEPORTES REALES DESDE SUPABASE
        // ----------------------------------------------------

        setDeportes(
          Array.isArray(perfil.sports)
            ? perfil.sports
            : []
        );


        // ----------------------------------------------------
        // NIVEL REAL DESDE SUPABASE
        // ----------------------------------------------------

        setNivelJuego(
          perfil.skill_level ?? ''
        );
      } else {
        // ----------------------------------------------------
        // RESPALDO
        // ----------------------------------------------------
        // Esto solamente debería ocurrir si existe el usuario
        // en Auth, pero todavía no existe una fila en profiles.
        // ----------------------------------------------------

        const nombreInicial =
          user.user_metadata?.full_name ?? '';


        setNombre(nombreInicial);


        const {
          error: crearError,
        } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name:
              nombreInicial || null,
          });


        if (crearError) {
          throw crearError;
        }
      }
    } catch (error: any) {
      console.log(
        'Error cargando perfil:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo cargar la información del perfil.'
      );
    } finally {
      setCargandoPerfil(false);
    }
  }


  // ==========================================================
  // GUARDAR INFORMACIÓN PERSONAL
  // ==========================================================

  async function handleGuardar() {
    // Nombre y edad son obligatorios.
    if (
      !nombre.trim() ||
      !edad.trim()
    ) {
      Alert.alert(
        'Campos requeridos',
        'Por favor ingresa tu nombre y edad.'
      );

      return;
    }


    // Convertimos la edad desde string a número.
    const edadNumero =
      Number(edad);


    // Validación básica de edad.
    if (
      !Number.isInteger(edadNumero) ||
      edadNumero <= 0 ||
      edadNumero > 120
    ) {
      Alert.alert(
        'Edad inválida',
        'Ingresa una edad válida.'
      );

      return;
    }


    try {
      setGuardando(true);


      // ------------------------------------------------------
      // OBTENER USUARIO ACTUAL
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
      // ACTUALIZAR PERFIL
      // ------------------------------------------------------
      //
      // Importante:
      // Aquí NO modificamos sports ni skill_level.
      //
      // Esos valores se administran desde deportes.tsx.
      // ------------------------------------------------------

      const {
        error: perfilError,
      } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,

            full_name:
              nombre.trim(),

            age:
              edadNumero,

            bio:
              bio.trim() || null,

            favorite_team:
              equipo.trim() || null,

            instagram:
              instagram.trim() || null,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        );


      if (perfilError) {
        throw perfilError;
      }


      // Volvemos al modo vista.
      setModoEdicion(false);


      Alert.alert(
        '¡Perfil actualizado!',
        'Tus cambios se guardaron correctamente en FitMatch.'
      );
    } catch (error: any) {
      console.log(
        'Error guardando perfil:',
        error
      );


      Alert.alert(
        'Error al guardar',
        error?.message ??
          'No se pudieron guardar los cambios.'
      );
    } finally {
      setGuardando(false);
    }
  }


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  async function handleLogout() {
    const {
      error,
    } = await supabase.auth.signOut();


    if (error) {
      Alert.alert(
        'Error',
        'No se pudo cerrar la sesión.'
      );

      return;
    }


    // Volver al login.
    router.replace('/login');
  }


  // ==========================================================
  // CAMBIAR TEMA
  // ==========================================================

  async function handleCambiarTema(
    value: boolean
  ) {
    await setTheme(
      value ? 'dark' : 'light'
    );
  }


  // ==========================================================
  // PANTALLA DE CARGA
  // ==========================================================

  if (cargandoPerfil) {
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
            color={colors.primary}
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
            Cargando perfil...
          </Text>
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
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            HEADER / INFORMACIÓN PRINCIPAL
        ================================================== */}

        <View style={styles.header}>
          {/* Avatar */}

          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor:
                  colors.primarySoft,

                borderColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={
                styles.avatarEmoji
              }
            >
              🏃‍♂️
            </Text>
          </View>


          {/* Nombre + edad */}

          <Text
            style={[
              styles.userName,
              {
                color: colors.text,
              },
            ]}
          >
            {nombre ||
              'Usuario FitMatch'}

            {edad
              ? `, ${edad}`
              : ''}
          </Text>


          {/* Correo */}

          <Text
            style={[
              styles.userEmail,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {email}
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
            {bio
              ? `"${bio}"`
              : 'Aún no has agregado una biografía.'}
          </Text>


          {/* Botón editar perfil */}

          <TouchableOpacity
            style={[
              styles.editToggleBtn,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              setModoEdicion(
                !modoEdicion
              )
            }
          >
            <Text
              style={[
                styles.editToggleText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {modoEdicion
                ? 'Cancelar'
                : '✏️ Editar Perfil'}
            </Text>
          </TouchableOpacity>
        </View>


        {/* ==================================================
            MODO EDICIÓN
        ================================================== */}

        {modoEdicion ? (
          <View
            style={[
              styles.formCard,
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
                  color: colors.text,
                },
              ]}
            >
              Editar Información
            </Text>


            {/* Nombre */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Nombre Completo
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={nombre}
              onChangeText={
                setNombre
              }
              placeholder="Tu nombre"
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* Edad */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Edad
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              placeholder="Tu edad"
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* Biografía */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Biografía / Descripción
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Cuéntanos algo sobre ti..."
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* Equipo favorito */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Equipo Favorito / Hincha de
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={equipo}
              onChangeText={
                setEquipo
              }
              placeholder="Ej: Colo-Colo, Lakers..."
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* Instagram */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Instagram / Red Social
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,

                  color:
                    colors.text,
                },
              ]}
              value={instagram}
              onChangeText={
                setInstagram
              }
              placeholder="@usuario"
              placeholderTextColor={
                colors.secondaryText
              }
              autoCapitalize="none"
            />


            {/* Guardar */}

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor:
                    colors.primary,

                  opacity:
                    guardando
                      ? 0.7
                      : 1,
                },
              ]}
              onPress={
                handleGuardar
              }
              disabled={
                guardando
              }
            >
              {guardando ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.saveBtnText
                  }
                >
                  Guardar Cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ================================================
             MODO VISTA
          ================================================ */

          <View
            style={
              styles.cardsContainer
            }
          >
            {/* ==============================================
                MIS DEPORTES
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                ⚡ Mis Deportes
              </Text>


              <View
                style={
                  styles.chipContainer
                }
              >
                {deportes.length > 0 ? (
                  deportes.map(
                    (deporteId) => {
                      // Buscamos la información visual
                      // correspondiente al ID guardado.

                      const deporte =
                        DEPORTES_DISPONIBLES.find(
                          (item) =>
                            item.id ===
                            deporteId
                        );


                      return (
                        <View
                          key={
                            deporteId
                          }
                          style={[
                            styles.sportChip,
                            {
                              backgroundColor:
                                colors.primarySoft,

                              borderColor:
                                colors.primary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sportChipText,
                              {
                                color:
                                  colors.primary,
                              },
                            ]}
                          >
                            {deporte
                              ? `${deporte.icono} ${deporte.nombre}`
                              : deporteId}
                          </Text>
                        </View>
                      );
                    }
                  )
                ) : (
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    No has seleccionado deportes.
                  </Text>
                )}
              </View>
            </View>


            {/* ==============================================
                NIVEL DE JUEGO
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                🎯 Nivel de Juego
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {nivelJuego ||
                  'No especificado'}
              </Text>


              {/* Volver a deportes.tsx */}

              <TouchableOpacity
                style={[
                  styles.editSportsBtn,
                  {
                    borderColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  router.push(
                    '/deportes'
                  )
                }
              >
                <Text
                  style={[
                    styles.editSportsText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  Editar preferencias deportivas
                </Text>
              </TouchableOpacity>
            </View>


            {/* ==============================================
                EQUIPO FAVORITO
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                ⚽ Equipo Favorito
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {equipo ||
                  'No especificado'}
              </Text>
            </View>


            {/* ==============================================
                REDES SOCIALES
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                📲 Redes Sociales
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Instagram:{' '}
                {instagram ||
                  'No configurado'}
              </Text>
            </View>


            {/* ==============================================
                CUENTA
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                👤 Cuenta
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {email ||
                  'Correo no disponible'}
              </Text>
            </View>


            {/* ==============================================
                CONFIGURACIÓN
            ============================================== */}

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
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                ⚙️ Configuración
              </Text>


              <View
                style={
                  styles.settingRow
                }
              >
                <View
                  style={
                    styles.settingTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.settingTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    🌙 Modo oscuro
                  </Text>

                  <Text
                    style={[
                      styles.settingDescription,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Cambia la apariencia de FitMatch
                  </Text>
                </View>


                <Switch
                  value={isDark}
                  onValueChange={
                    handleCambiarTema
                  }
                  trackColor={{
                    false:
                      '#CBD5E1',

                    true:
                      colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>


            {/* ==============================================
                CERRAR SESIÓN
            ============================================== */}

            <TouchableOpacity
              style={[
                styles.logoutBtn,
                {
                  backgroundColor:
                    colors.dangerBackground,
                },
              ]}
              onPress={
                handleLogout
              }
            >
              <Text
                style={[
                  styles.logoutText,
                  {
                    color:
                      colors.dangerText,
                  },
                ]}
              >
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  // Contenedor principal.
  safeArea: {
    flex: 1,
  },


  // Contenido desplazable.
  container: {
    padding: 20,
  },


  // Pantalla de carga.
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },


  loadingText: {
    fontSize: 14,
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },


  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },


  avatarEmoji: {
    fontSize: 50,
  },


  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },


  userEmail: {
    fontSize: 12,
    marginTop: 4,
  },


  userBio: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },


  editToggleBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },


  editToggleText: {
    fontWeight: '600',
    fontSize: 13,
  },


  // ==========================================================
  // TARJETAS
  // ==========================================================

  cardsContainer: {
    gap: 16,
  },


  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },


  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },


  infoText: {
    fontSize: 14,
  },


  // ==========================================================
  // DEPORTES
  // ==========================================================

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },


  sportChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },


  // Botón para volver a deportes.tsx.
  editSportsBtn: {
    marginTop: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },


  editSportsText: {
    fontSize: 13,
    fontWeight: '600',
  },


  // ==========================================================
  // FORMULARIO DE EDICIÓN
  // ==========================================================

  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },


  label: {
    fontSize: 12,
    fontWeight: '600',
  },


  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },


  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },


  saveBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },


  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },


  // ==========================================================
  // CONFIGURACIÓN
  // ==========================================================

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 12,
  },


  settingTextContainer: {
    flex: 1,
  },


  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },


  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  logoutBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },


  logoutText: {
    fontWeight: 'bold',
  },
});
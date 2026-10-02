// ============================================================
// FITMATCH - PERFIL
// ============================================================
//
// Funciones:
//
// - Carga el perfil real desde Supabase.
// - Permite editar información personal.
// - Muestra deportes y nivel.
// - Permite modificar deportes.
// - Permite configurar radio de búsqueda.
// - Permite cambiar modo claro / oscuro.
// - Permite cerrar sesión.
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
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';


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
// RADIOS DISPONIBLES
// ============================================================
//
// 0 representa "Sin límite".
//
// ============================================================

const RADIOS_BUSQUEDA = [
  {
    value: 5,
    label: '5 km',
  },
  {
    value: 10,
    label: '10 km',
  },
  {
    value: 25,
    label: '25 km',
  },
  {
    value: 50,
    label: '50 km',
  },
  {
    value: 0,
    label: 'Sin límite',
  },
];


// ============================================================
// COMPONENTE
// ============================================================

export default function PerfilScreen() {
  const router =
    useRouter();


  const {
    isDark,
    colors,
    setTheme,
  } = useTheme();


  // ==========================================================
  // ESTADOS GENERALES
  // ==========================================================

  const [
    modoEdicion,
    setModoEdicion,
  ] = useState(false);


  const [
    cargandoPerfil,
    setCargandoPerfil,
  ] = useState(true);


  const [
    guardando,
    setGuardando,
  ] = useState(false);


  const [
    guardandoRadio,
    setGuardandoRadio,
  ] = useState(false);


  // ==========================================================
  // DATOS PERSONALES
  // ==========================================================

  const [
    nombre,
    setNombre,
  ] = useState('');


  const [
    edad,
    setEdad,
  ] = useState('');


  const [
    bio,
    setBio,
  ] = useState('');


  const [
    equipo,
    setEquipo,
  ] = useState('');


  const [
    instagram,
    setInstagram,
  ] = useState('');


  const [
    email,
    setEmail,
  ] = useState('');


  // ==========================================================
  // PREFERENCIAS DEPORTIVAS
  // ==========================================================

  const [
    deportes,
    setDeportes,
  ] = useState<string[]>([]);


  const [
    nivelJuego,
    setNivelJuego,
  ] = useState('');


  // ==========================================================
  // RADIO DE BÚSQUEDA
  // ==========================================================
  //
  // Por defecto:
  //
  // 25 kilómetros.
  //
  // ==========================================================

  const [
    radioBusqueda,
    setRadioBusqueda,
  ] = useState(25);


  // ==========================================================
  // RECARGAR AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [])
  );


  // ==========================================================
  // CARGAR PERFIL
  // ==========================================================

  async function cargarPerfil() {
    try {
      setCargandoPerfil(true);


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


      // Correo desde Auth.

      setEmail(
        user.email ??
          ''
      );


      // ------------------------------------------------------
      // 2. PERFIL
      // ------------------------------------------------------

      const {
        data: perfil,
        error:
          perfilError,
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
          skill_level,
          search_radius_km
          `
        )
        .eq(
          'id',
          user.id
        )
        .maybeSingle();


      if (perfilError) {
        throw perfilError;
      }


      // ------------------------------------------------------
      // 3. PERFIL EXISTENTE
      // ------------------------------------------------------

      if (perfil) {
        setNombre(
          perfil.full_name ??
            user.user_metadata
              ?.full_name ??
            ''
        );


        setEdad(
          perfil.age !== null &&
          perfil.age !== undefined
            ? String(
                perfil.age
              )
            : ''
        );


        setBio(
          perfil.bio ??
            ''
        );


        setEquipo(
          perfil.favorite_team ??
            ''
        );


        setInstagram(
          perfil.instagram ??
            ''
        );


        setDeportes(
          Array.isArray(
            perfil.sports
          )
            ? perfil.sports
            : []
        );


        setNivelJuego(
          perfil.skill_level ??
            ''
        );


        // ----------------------------------------------
        // RADIO REAL DESDE SUPABASE
        // ----------------------------------------------

        setRadioBusqueda(
          typeof perfil.search_radius_km ===
            'number'
            ? perfil.search_radius_km
            : 25
        );
      } else {
        // ----------------------------------------------------
        // RESPALDO:
        // usuario existe en Auth pero no en profiles.
        // ----------------------------------------------------

        const nombreInicial =
          user.user_metadata
            ?.full_name ??
          '';


        setNombre(
          nombreInicial
        );


        const {
          error:
            crearError,
        } = await supabase
          .from('profiles')
          .insert({
            id:
              user.id,

            full_name:
              nombreInicial ||
              null,

            search_radius_km:
              25,
          });


        if (crearError) {
          throw crearError;
        }


        setRadioBusqueda(
          25
        );
      }
    } catch (
      error: any
    ) {
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
      setCargandoPerfil(
        false
      );
    }
  }


  // ==========================================================
  // GUARDAR INFORMACIÓN PERSONAL
  // ==========================================================

  async function handleGuardar() {
    // Nombre y edad obligatorios.

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


    const edadNumero =
      Number(
        edad
      );


    if (
      !Number.isInteger(
        edadNumero
      ) ||
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
      setGuardando(
        true
      );


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


      const {
        error:
          perfilError,
      } = await supabase
        .from('profiles')
        .upsert(
          {
            id:
              user.id,

            full_name:
              nombre.trim(),

            age:
              edadNumero,

            bio:
              bio.trim() ||
              null,

            favorite_team:
              equipo.trim() ||
              null,

            instagram:
              instagram.trim() ||
              null,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              'id',
          }
        );


      if (perfilError) {
        throw perfilError;
      }


      setModoEdicion(
        false
      );


      Alert.alert(
        '¡Perfil actualizado!',
        'Tus cambios se guardaron correctamente en FitMatch.'
      );
    } catch (
      error: any
    ) {
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
      setGuardando(
        false
      );
    }
  }


  // ==========================================================
  // CAMBIAR RADIO DE BÚSQUEDA
  // ==========================================================

  async function handleCambiarRadio(
    nuevoRadio: number
  ) {
    // Si seleccionó el mismo valor,
    // no hacemos otra consulta.

    if (
      nuevoRadio ===
      radioBusqueda
    ) {
      return;
    }


    try {
      setGuardandoRadio(
        true
      );


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
      // GUARDAR EN PROFILES
      // ------------------------------------------------------

      const {
        error:
          radioError,
      } = await supabase
        .from('profiles')
        .update({
          search_radius_km:
            nuevoRadio,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          user.id
        );


      if (radioError) {
        throw radioError;
      }


      // Actualizamos la interfaz solo cuando
      // Supabase confirma el cambio.

      setRadioBusqueda(
        nuevoRadio
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando radio:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo guardar el radio de búsqueda.'
      );
    } finally {
      setGuardandoRadio(
        false
      );
    }
  }


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  async function handleLogout() {
    const {
      error,
    } =
      await supabase.auth.signOut();


    if (error) {
      Alert.alert(
        'Error',
        'No se pudo cerrar la sesión.'
      );

      return;
    }


    router.replace(
      '/login'
    );
  }


  // ==========================================================
  // CAMBIAR TEMA
  // ==========================================================

  async function handleCambiarTema(
    value: boolean
  ) {
    await setTheme(
      value
        ? 'dark'
        : 'light'
    );
  }


  // ==========================================================
  // CARGANDO
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
            Cargando perfil...
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


          <Text
            style={[
              styles.userName,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {nombre ||
              'Usuario FitMatch'}

            {edad
              ? `, ${edad}`
              : ''}
          </Text>


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
            EDICIÓN
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
                  color:
                    colors.text,
                },
              ]}
            >
              Editar Información
            </Text>


            {/* NOMBRE */}

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
              value={
                nombre
              }
              onChangeText={
                setNombre
              }
              placeholder="Tu nombre"
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* EDAD */}

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
              value={
                edad
              }
              onChangeText={
                setEdad
              }
              keyboardType="numeric"
              placeholder="Tu edad"
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* BIO */}

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
              value={
                bio
              }
              onChangeText={
                setBio
              }
              multiline
              placeholder="Cuéntanos algo sobre ti..."
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* EQUIPO */}

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
              value={
                equipo
              }
              onChangeText={
                setEquipo
              }
              placeholder="Ej: Colo-Colo, Lakers..."
              placeholderTextColor={
                colors.secondaryText
              }
            />


            {/* INSTAGRAM */}

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
              value={
                instagram
              }
              onChangeText={
                setInstagram
              }
              placeholder="@usuario"
              placeholderTextColor={
                colors.secondaryText
              }
              autoCapitalize="none"
            />


            {/* GUARDAR */}

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
          // ==================================================
          // MODO VISTA
          // ==================================================

          <View
            style={
              styles.cardsContainer
            }
          >
            {/* ================================================
                MIS DEPORTES
            ================================================ */}

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
                {deportes.length >
                0 ? (
                  deportes.map(
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


            {/* ================================================
                NIVEL
            ================================================ */}

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


            {/* ================================================
                EQUIPO
            ================================================ */}

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


            {/* ================================================
                RED SOCIAL
            ================================================ */}

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


            {/* ================================================
                CUENTA
            ================================================ */}

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


            {/* ================================================
                CONFIGURACIÓN
            ================================================ */}

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


              {/* ==============================================
                  RADIO DE BÚSQUEDA
              ============================================== */}

              <View
                style={
                  styles.radiusSection
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
                  📍 Radio de búsqueda
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
                  Define a qué distancia quieres encontrar deportistas.
                </Text>


                <View
                  style={
                    styles.radiusOptions
                  }
                >
                  {RADIOS_BUSQUEDA.map(
                    (
                      opcion
                    ) => {
                      const seleccionado =
                        radioBusqueda ===
                        opcion.value;


                      return (
                        <TouchableOpacity
                          key={
                            opcion.value
                          }
                          style={[
                            styles.radiusButton,
                            {
                              backgroundColor:
                                seleccionado
                                  ? colors.primarySoft
                                  : colors.background,

                              borderColor:
                                seleccionado
                                  ? colors.primary
                                  : colors.border,

                              opacity:
                                guardandoRadio
                                  ? 0.65
                                  : 1,
                            },
                          ]}
                          disabled={
                            guardandoRadio
                          }
                          onPress={() =>
                            handleCambiarRadio(
                              opcion.value
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.radiusButtonText,
                              {
                                color:
                                  seleccionado
                                    ? colors.primary
                                    : colors.text,
                              },
                            ]}
                          >
                            {opcion.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>


                {guardandoRadio && (
                  <View
                    style={
                      styles.savingRadius
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.savingRadiusText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Guardando radio...
                    </Text>
                  </View>
                )}
              </View>


              {/* DIVISOR */}

              <View
                style={[
                  styles.settingDivider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />


              {/* ==============================================
                  MODO OSCURO
              ============================================== */}

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
                  value={
                    isDark
                  }
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


            {/* ================================================
                LOGOUT
            ================================================ */}

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

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },


    container: {
      padding: 20,
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
      alignItems:
        'center',

      marginBottom: 20,
    },


    avatarContainer: {
      width: 90,

      height: 90,

      borderRadius: 45,

      borderWidth: 2,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginBottom: 12,
    },


    avatarEmoji: {
      fontSize: 50,
    },


    userName: {
      fontSize: 22,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    userEmail: {
      fontSize: 12,

      marginTop: 4,
    },


    userBio: {
      fontSize: 13,

      textAlign:
        'center',

      marginTop: 8,

      paddingHorizontal: 20,

      fontStyle:
        'italic',
    },


    editToggleBtn: {
      marginTop: 12,

      paddingHorizontal: 16,

      paddingVertical: 8,

      borderRadius: 20,

      borderWidth: 1,
    },


    editToggleText: {
      fontWeight:
        '600',

      fontSize: 13,
    },


    // ========================================================
    // TARJETAS
    // ========================================================

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

      fontWeight:
        'bold',
    },


    infoText: {
      fontSize: 14,
    },


    // ========================================================
    // DEPORTES
    // ========================================================

    chipContainer: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

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

      fontWeight:
        'bold',
    },


    editSportsBtn: {
      marginTop: 6,

      paddingVertical: 9,

      paddingHorizontal: 12,

      borderRadius: 10,

      borderWidth: 1,

      alignItems:
        'center',
    },


    editSportsText: {
      fontSize: 13,

      fontWeight:
        '600',
    },


    // ========================================================
    // FORMULARIO
    // ========================================================

    formCard: {
      padding: 16,

      borderRadius: 16,

      borderWidth: 1,

      gap: 12,
    },


    sectionTitle: {
      fontSize: 16,

      fontWeight:
        'bold',

      marginBottom: 4,
    },


    label: {
      fontSize: 12,

      fontWeight:
        '600',
    },


    input: {
      borderWidth: 1,

      padding: 10,

      borderRadius: 8,

      fontSize: 14,
    },


    bioInput: {
      height: 80,

      textAlignVertical:
        'top',
    },


    saveBtn: {
      paddingVertical: 12,

      borderRadius: 10,

      alignItems:
        'center',

      marginTop: 8,
    },


    saveBtnText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 14,
    },


    // ========================================================
    // CONFIGURACIÓN
    // ========================================================

    settingRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      gap: 12,
    },


    settingTextContainer: {
      flex: 1,
    },


    settingTitle: {
      fontSize: 14,

      fontWeight:
        '600',
    },


    settingDescription: {
      fontSize: 12,

      marginTop: 2,

      lineHeight: 18,
    },


    settingDivider: {
      height: 1,

      width: '100%',

      marginVertical: 8,
    },


    // ========================================================
    // RADIO DE BÚSQUEDA
    // ========================================================

    radiusSection: {
      width: '100%',
    },


    radiusOptions: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap: 8,

      marginTop: 12,
    },


    radiusButton: {
      paddingHorizontal: 14,

      paddingVertical: 9,

      borderRadius: 18,

      borderWidth: 1,
    },


    radiusButtonText: {
      fontSize: 12,

      fontWeight:
        '700',
    },


    savingRadius: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 7,

      marginTop: 10,
    },


    savingRadiusText: {
      fontSize: 11,
    },


    // ========================================================
    // LOGOUT
    // ========================================================

    logoutBtn: {
      padding: 16,

      borderRadius: 12,

      alignItems:
        'center',

      marginTop: 10,
    },


    logoutText: {
      fontWeight:
        'bold',
    },
  });
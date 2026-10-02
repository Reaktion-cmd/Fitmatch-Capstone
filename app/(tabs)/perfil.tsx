import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();

  const { isDark, colors, setTheme } = useTheme();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Datos reales del perfil
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [bio, setBio] = useState('');
  const [equipo, setEquipo] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');

  // Por ahora los deportes siguen siendo locales.
  // Más adelante los conectaremos a Supabase.
  const [deportes] = useState([
    '🎾 Pádel',
    '⚽ Fútbol 7',
    '🏃 Running',
  ]);

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      setCargandoPerfil(true);

      // 1. Obtener usuario autenticado
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

      setEmail(user.email ?? '');

      // 2. Buscar perfil usando el mismo UUID de auth.users
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select(
          'id, full_name, age, bio, favorite_team, instagram'
        )
        .eq('id', user.id)
        .maybeSingle();

      if (perfilError) {
        throw perfilError;
      }

      // 3. Si existe, cargar datos reales
      if (perfil) {
        setNombre(
          perfil.full_name ??
            user.user_metadata?.full_name ??
            ''
        );

        setEdad(
          perfil.age !== null && perfil.age !== undefined
            ? String(perfil.age)
            : ''
        );

        setBio(perfil.bio ?? '');
        setEquipo(perfil.favorite_team ?? '');
        setInstagram(perfil.instagram ?? '');
      } else {
        // Respaldo por si existe un usuario de Auth
        // pero todavía no tiene fila en profiles.
        const nombreInicial =
          user.user_metadata?.full_name ?? '';

        setNombre(nombreInicial);

        const { error: crearError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: nombreInicial || null,
          });

        if (crearError) {
          throw crearError;
        }
      }
    } catch (error: any) {
      console.log('Error cargando perfil:', error);

      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo cargar la información del perfil.'
      );
    } finally {
      setCargandoPerfil(false);
    }
  }

  async function handleGuardar() {
    if (!nombre.trim() || !edad.trim()) {
      Alert.alert(
        'Campos requeridos',
        'Por favor ingresa tu nombre y edad.'
      );

      return;
    }

    const edadNumero = Number(edad);

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

      const { error: perfilError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: nombre.trim(),
            age: edadNumero,
            bio: bio.trim() || null,
            favorite_team: equipo.trim() || null,
            instagram: instagram.trim() || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        );

      if (perfilError) {
        throw perfilError;
      }

      setModoEdicion(false);

      Alert.alert(
        '¡Perfil actualizado!',
        'Tus cambios se guardaron correctamente en FitMatch.'
      );
    } catch (error: any) {
      console.log('Error guardando perfil:', error);

      Alert.alert(
        'Error al guardar',
        error?.message ??
          'No se pudieron guardar los cambios.'
      );
    } finally {
      setGuardando(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert(
        'Error',
        'No se pudo cerrar la sesión.'
      );

      return;
    }

    router.replace('/login');
  }

  async function handleCambiarTema(value: boolean) {
    await setTheme(value ? 'dark' : 'light');
  }

  if (cargandoPerfil) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Avatar */}

        <View style={styles.header}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>
              🏃‍♂️
            </Text>
          </View>

          <Text
            style={[
              styles.userName,
              {
                color: colors.text,
              },
            ]}
          >
            {nombre || 'Usuario FitMatch'}
            {edad ? `, ${edad}` : ''}
          </Text>

          <Text
            style={[
              styles.userEmail,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            {email}
          </Text>

          <Text
            style={[
              styles.userBio,
              {
                color: colors.secondaryText,
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
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              setModoEdicion(!modoEdicion)
            }
          >
            <Text
              style={[
                styles.editToggleText,
                {
                  color: colors.text,
                },
              ]}
            >
              {modoEdicion
                ? 'Cancelar'
                : '✏️ Editar Perfil'}
            </Text>
          </TouchableOpacity>
        </View>

        {modoEdicion ? (
          /* MODO EDICIÓN */

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
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

            <Text
              style={[
                styles.label,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Nombre Completo
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={
                colors.secondaryText
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Edad
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
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

            <Text
              style={[
                styles.label,
                {
                  color: colors.secondaryText,
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
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
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

            <Text
              style={[
                styles.label,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Equipo Favorito / Hincha de
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={equipo}
              onChangeText={setEquipo}
              placeholder="Ej: Colo-Colo, Lakers..."
              placeholderTextColor={
                colors.secondaryText
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Instagram / Red Social
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="@usuario"
              placeholderTextColor={
                colors.secondaryText
              }
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: guardando ? 0.7 : 1,
                },
              ]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  Guardar Cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* MODO VISTA */

          <View style={styles.cardsContainer}>
            {/* Deportes */}

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                ⚡ Mis Deportes
              </Text>

              <View style={styles.chipContainer}>
                {deportes.map((dep, index) => (
                  <View
                    key={index}
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
                          color: colors.primary,
                        },
                      ]}
                    >
                      {dep}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Equipo */}

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                ⚽ Equipo Favorito
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                {equipo || 'No especificado'}
              </Text>
            </View>

            {/* Redes Sociales */}

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                📲 Redes Sociales
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Instagram:{' '}
                {instagram || 'No configurado'}
              </Text>
            </View>

            {/* Cuenta */}

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                👤 Cuenta
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                {email || 'Correo no disponible'}
              </Text>
            </View>

            {/* Configuración */}

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                ⚙️ Configuración
              </Text>

              <View style={styles.settingRow}>
                <View
                  style={styles.settingTextContainer}
                >
                  <Text
                    style={[
                      styles.settingTitle,
                      {
                        color: colors.text,
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
                    false: '#CBD5E1',
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Cerrar Sesión */}

            <TouchableOpacity
              style={[
                styles.logoutBtn,
                {
                  backgroundColor:
                    colors.dangerBackground,
                },
              ]}
              onPress={handleLogout}
            >
              <Text
                style={[
                  styles.logoutText,
                  {
                    color: colors.dangerText,
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
  },

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

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
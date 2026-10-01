import React, { useState } from 'react';
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
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();

  const { isDark, colors, setTheme } = useTheme();

  const [modoEdicion, setModoEdicion] = useState(false);

  // Estados del perfil de usuario
  const [nombre, setNombre] = useState('Juan Pérez');
  const [edad, setEdad] = useState('25');

  const [bio, setBio] = useState(
    'Apasionado por el deporte. Buscando rivales para pádel los fines de semana.'
  );

  const [equipo, setEquipo] = useState('Real Madrid / Lakers');

  const [instagram, setInstagram] = useState('@juanperez_fit');

  const [deportes] = useState([
    '🎾 Pádel',
    '⚽ Fútbol 7',
    '🏃 Running',
  ]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  function handleGuardar() {
    if (!nombre || !edad) {
      Alert.alert(
        'Campos requeridos',
        'Por favor ingresa tu nombre y edad.'
      );

      return;
    }

    setModoEdicion(false);

    Alert.alert(
      '¡Perfil actualizado!',
      'Tus cambios se han guardado correctamente.'
    );
  }

  async function handleCambiarTema(value: boolean) {
    await setTheme(value ? 'dark' : 'light');
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
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
            <Text style={{ fontSize: 50 }}>🏃‍♂️</Text>
          </View>

          <Text
            style={[
              styles.userName,
              { color: colors.text },
            ]}
          >
            {nombre}, {edad}
          </Text>

          <Text
            style={[
              styles.userBio,
              { color: colors.secondaryText },
            ]}
          >
            "{bio}"
          </Text>

          <TouchableOpacity
            style={[
              styles.editToggleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setModoEdicion(!modoEdicion)}
          >
            <Text
              style={[
                styles.editToggleText,
                { color: colors.text },
              ]}
            >
              {modoEdicion
                ? 'Cancelar'
                : '✏️ Editar Perfil'}
            </Text>
          </TouchableOpacity>

        </View>

        {modoEdicion ? (

          /* MODO EDICIÓN DE PERFIL */

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
                { color: colors.text },
              ]}
            >
              Editar Información
            </Text>

            <Text
              style={[
                styles.label,
                { color: colors.secondaryText },
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
              placeholderTextColor={colors.secondaryText}
            />

            <Text
              style={[
                styles.label,
                { color: colors.secondaryText },
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
              placeholderTextColor={colors.secondaryText}
            />

            <Text
              style={[
                styles.label,
                { color: colors.secondaryText },
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
              placeholderTextColor={colors.secondaryText}
            />

            <Text
              style={[
                styles.label,
                { color: colors.secondaryText },
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
              placeholderTextColor={colors.secondaryText}
            />

            <Text
              style={[
                styles.label,
                { color: colors.secondaryText },
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
              placeholderTextColor={colors.secondaryText}
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleGuardar}
            >
              <Text style={styles.saveBtnText}>
                Guardar Cambios
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          /* MODO VISTA PREVIA */

          <View style={styles.cardsContainer}>

            {/* Tarjeta 1: Deportes */}

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
                  { color: colors.text },
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
                        backgroundColor: colors.primarySoft,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sportChipText,
                        { color: colors.primary },
                      ]}
                    >
                      {dep}
                    </Text>
                  </View>

                ))}

              </View>
            </View>

            {/* Tarjeta 2: Equipo */}

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
                  { color: colors.text },
                ]}
              >
                ⚽ Equipo Favorito
              </Text>

              <Text
                style={[
                  styles.infoText,
                  { color: colors.secondaryText },
                ]}
              >
                {equipo || 'No especificado'}
              </Text>
            </View>

            {/* Tarjeta 3: Redes Sociales */}

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
                  { color: colors.text },
                ]}
              >
                📲 Redes Sociales
              </Text>

              <Text
                style={[
                  styles.infoText,
                  { color: colors.secondaryText },
                ]}
              >
                Instagram: {instagram || 'No configurado'}
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
                  { color: colors.text },
                ]}
              >
                ⚙️ Configuración
              </Text>

              <View style={styles.settingRow}>

                <View style={styles.settingTextContainer}>

                  <Text
                    style={[
                      styles.settingTitle,
                      { color: colors.text },
                    ]}
                  >
                    🌙 Modo oscuro
                  </Text>

                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.secondaryText },
                    ]}
                  >
                    Cambia la apariencia de FitMatch
                  </Text>

                </View>

                <Switch
                  value={isDark}
                  onValueChange={handleCambiarTema}
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
                  backgroundColor: colors.dangerBackground,
                },
              ]}
              onPress={handleLogout}
            >
              <Text
                style={[
                  styles.logoutText,
                  { color: colors.dangerText },
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

  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  userBio: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
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

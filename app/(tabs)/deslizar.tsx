import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../lib/ThemeContext';

export default function MatchScreen() {
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.container}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Match Deportivo 1v1
        </Text>

        {/* Tarjeta simulada tipo Tinder */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: colors.primarySoft,
                borderColor: isDark
                  ? colors.border
                  : 'transparent',
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>🧢</Text>
          </View>

          <Text
            style={[
              styles.userName,
              {
                color: colors.text,
              },
            ]}
          >
            Carlos Mendoza, 24
          </Text>

          <Text
            style={[
              styles.userSport,
              {
                color: isDark
                  ? '#93C5FD'
                  : '#2563EB',
              },
            ]}
          >
            ⚡ Tenis / Padel • Nivel Intermedio
          </Text>

          <Text
            style={[
              styles.userBio,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            "Buscando con quién jugar un partido este fin de semana por las
            tardes."
          </Text>
        </View>

        {/* Botones de Liked / Disliked */}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor: '#EF4444',
                backgroundColor: colors.card,
              },
            ]}
            accessibilityLabel="Descartar perfil"
          >
            <Text style={styles.actionEmoji}>❌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor: '#22C55E',
                backgroundColor: colors.card,
              },
            ]}
            accessibilityLabel="Dar me gusta al perfil"
          >
            <Text style={styles.actionEmoji}>💚</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },

  card: {
    width: '100%',
    height: '65%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,

    elevation: 4,

    shadowColor: '#000000',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },

  avatarEmoji: {
    fontSize: 60,
  },

  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  userSport: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  userBio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 10,
  },

  circleBtn: {
    width: 65,
    height: 65,
    borderRadius: 33,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionEmoji: {
    fontSize: 24,
  },
});
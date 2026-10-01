import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { useTheme } from '../lib/ThemeContext';

export default function ChatScreen() {
  const { colors } = useTheme();

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
          Mensajes
        </Text>

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.icon}>💬</Text>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Aún no tienes chats activos
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Tus conversaciones de Match o Eventos aparecerán aquí.
          </Text>
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
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  emptyCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },

  icon: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});
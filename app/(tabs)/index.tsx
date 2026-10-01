import React, { useMemo, useState } from 'react';

import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/ThemeContext';

// Pantalla de demostración visual:
// las categorías y los eventos son datos locales.
// Sustituir EVENTOS_EJEMPLO por datos de Supabase
// cuando se implemente el catálogo.

type Categoria = {
  id: string;
  nombre: string;
  icono: string;
};

type Evento = {
  id: string;
  nombre: string;
  fecha: string;
  deporte: string;
  icono: string;
  descripcion: string;
};

const CATEGORIAS: Categoria[] = [
  { id: 'futbol', nombre: 'Fútbol', icono: '⚽' },
  { id: 'basket', nombre: 'Básquet', icono: '🏀' },
  { id: 'voley', nombre: 'Vóley', icono: '🏐' },
  { id: 'karate', nombre: 'Karate', icono: '🥋' },
  { id: 'natacion', nombre: 'Natación', icono: '🏊' },
  { id: 'esgrima', nombre: 'Esgrima', icono: '🤺' },
  { id: 'running', nombre: 'Running', icono: '🏃' },
  { id: 'padel', nombre: 'Pádel', icono: '🎾' },
];

const EVENTOS_EJEMPLO: Evento[] = [
  {
    id: 'ejemplo-1',
    nombre: 'Infinity Run',
    fecha: 'Fecha por confirmar',
    deporte: 'running',
    icono: '🏃',
    descripcion: 'Encuentro de running',
  },
  {
    id: 'ejemplo-2',
    nombre: 'Pichanga Amigos',
    fecha: 'Fecha por confirmar',
    deporte: 'futbol',
    icono: '⚽',
    descripcion: 'Partido amistoso',
  },
];

function textoCoincide(texto: string, busqueda: string) {
  return texto
    .toLocaleLowerCase('es')
    .includes(busqueda.toLocaleLowerCase('es'));
}

export default function ExplorarScreen() {
  const router = useRouter();

  const { isDark, colors } = useTheme();

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [verTodas, setVerTodas] = useState(false);

  const categoriasVisibles = verTodas
    ? CATEGORIAS
    : CATEGORIAS.slice(0, 6);

  const eventosVisibles = useMemo(() => {
    const termino = busqueda.trim();

    return EVENTOS_EJEMPLO.filter((evento) => {
      const coincideCategoria =
        categoria === null || evento.deporte === categoria;

      const nombreDeporte =
        CATEGORIAS.find(
          (item) => item.id === evento.deporte
        )?.nombre ?? '';

      const coincideTexto =
        !termino ||
        textoCoincide(
          `${evento.nombre} ${nombreDeporte}`,
          termino
        );

      return coincideCategoria && coincideTexto;
    });
  }, [busqueda, categoria]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={['top']}
    >
      <View
        style={[
          styles.marco,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CABECERA */}

          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <View style={styles.bienvenida}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={26}
                  color={colors.primary}
                />
              </View>

              <View style={styles.bienvenidaTexto}>
                <Text style={styles.welcome}>
                  Welcome
                </Text>

                <Text style={styles.usuario}>
                  a FitMatch
                </Text>
              </View>

              <Ionicons
                name="notifications-outline"
                size={23}
                color="#FFFFFF"
              />
            </View>

            {/* BUSCADOR */}

            <View
              style={[
                styles.buscador,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark
                    ? colors.border
                    : 'transparent',
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar deporte o evento"
                placeholderTextColor={
                  colors.secondaryText
                }
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                returnKeyType="search"
                accessibilityLabel="Buscar deporte o evento"
              />

              {busqueda.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setBusqueda('')}
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={23}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              ) : (
                <Ionicons
                  name="search-outline"
                  size={25}
                  color={colors.primary}
                />
              )}
            </View>
          </View>

          {/* CATEGORÍAS */}

          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Text
                style={[
                  styles.tituloSeccion,
                  { color: colors.text },
                ]}
              >
                Categorías
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setVerTodas((actual) => !actual);
                  setCategoria(null);
                }}
                accessibilityLabel={
                  verTodas
                    ? 'Mostrar menos categorías'
                    : 'Mostrar todas las categorías'
                }
              >
                <Text
                  style={[
                    styles.mostrarTodas,
                    { color: colors.text },
                  ]}
                >
                  {verTodas
                    ? 'Ver menos'
                    : 'Mostrar todas'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categorias}>
              {categoriasVisibles.map((item) => {
                const activa =
                  categoria === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoria,
                      {
                        backgroundColor: activa
                          ? isDark
                            ? '#27346A'
                            : '#E9EDFF'
                          : colors.card,

                        borderColor: activa
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setCategoria(
                        activa ? null : item.id
                      )
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: activa,
                    }}
                    accessibilityLabel={`Filtrar por ${item.nombre}`}
                  >
                    <Text style={styles.emoji}>
                      {item.icono}
                    </Text>

                    <Text
                      style={[
                        styles.nombreCategoria,
                        {
                          color: activa
                            ? colors.primary
                            : colors.secondaryText,
                          fontWeight: activa
                            ? '700'
                            : '400',
                        },
                      ]}
                    >
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* EVENTOS */}

          <View
            style={[
              styles.seccion,
              styles.seccionEventos,
            ]}
          >
            <View style={styles.encabezadoSeccion}>
              <Text
                style={[
                  styles.tituloSeccion,
                  { color: colors.text },
                ]}
              >
                Top Eventos
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push('/(tabs)/eventos')
                }
              >
                <Text
                  style={[
                    styles.mostrarTodas,
                    { color: colors.text },
                  ]}
                >
                  Ver eventos
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.nota,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Vista de ejemplo · Los eventos reales se
              consultarán en el módulo Eventos.
            </Text>

            {eventosVisibles.map((evento) => (
              <TouchableOpacity
                key={evento.id}
                style={[
                  styles.evento,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  router.push('/(tabs)/eventos')
                }
                accessibilityRole="button"
                accessibilityLabel={`Ir al módulo Eventos desde ${evento.nombre}`}
              >
                <View
                  style={[
                    styles.eventoImagen,
                    {
                      backgroundColor:
                        colors.primarySoft,
                    },
                  ]}
                >
                  <Text style={styles.eventoIcono}>
                    {evento.icono}
                  </Text>
                </View>

                <View style={styles.eventoContenido}>
                  <Text
                    style={[
                      styles.eventoTitulo,
                      { color: colors.text },
                    ]}
                  >
                    {evento.nombre}
                  </Text>

                  <Text
                    style={[
                      styles.eventoFecha,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {evento.fecha}
                  </Text>

                  <Text
                    style={[
                      styles.eventoDescripcion,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {evento.descripcion}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            ))}

            {/* SIN RESULTADOS */}

            {eventosVisibles.length === 0 && (
              <View
                style={[
                  styles.sinResultados,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={27}
                  color={colors.secondaryText}
                />

                <Text
                  style={[
                    styles.sinResultadosTitulo,
                    { color: colors.text },
                  ]}
                >
                  Sin resultados de ejemplo
                </Text>

                <Text
                  style={[
                    styles.sinResultadosTexto,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Prueba otra categoría o abre el
                  módulo Eventos para ver los partidos
                  disponibles.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.botonEventos,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={() =>
                    router.push('/(tabs)/eventos')
                  }
                >
                  <Text
                    style={styles.botonEventosTexto}
                  >
                    Ir a Eventos
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  marco: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    alignSelf: 'center',

    ...Platform.select({
      web: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
      },

      default: {},
    }),
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  hero: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 21,
    paddingTop: 34,
    paddingBottom: 30,
    minHeight: 205,
  },

  bienvenida: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    backgroundColor: '#FFFFFF',
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  bienvenidaTexto: {
    flex: 1,
  },

  welcome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  usuario: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },

  buscador: {
    borderRadius: 7,
    marginTop: 23,
    height: 45,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 9,
  },

  seccion: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tituloSeccion: {
    fontSize: 15,
    fontWeight: '700',
  },

  mostrarTodas: {
    fontSize: 13,
    fontWeight: '500',
  },

  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },

  categoria: {
    width: '31%',
    flexGrow: 1,
    height: 84,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },

  emoji: {
    fontSize: 34,
    lineHeight: 40,
  },

  nombreCategoria: {
    fontSize: 12,
    marginTop: 3,
  },

  seccionEventos: {
    paddingTop: 18,
  },

  nota: {
    fontSize: 10,
    marginBottom: 10,
    lineHeight: 14,
  },

  evento: {
    minHeight: 73,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },

  eventoImagen: {
    width: 55,
    height: 53,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  eventoIcono: {
    fontSize: 31,
  },

  eventoContenido: {
    flex: 1,
  },

  eventoTitulo: {
    fontSize: 13,
    fontWeight: '700',
  },

  eventoFecha: {
    fontSize: 11,
    marginTop: 2,
  },

  eventoDescripcion: {
    fontSize: 10,
    marginTop: 2,
  },

  sinResultados: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
  },

  sinResultadosTitulo: {
    fontWeight: '700',
  },

  sinResultadosTexto: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },

  botonEventos: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  botonEventosTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

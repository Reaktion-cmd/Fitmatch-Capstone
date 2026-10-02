// ============================================================
// FITMATCH - EXPLORAR
// ============================================================
// Esta pantalla:
//
// - Muestra las categorías deportivas.
// - Permite buscar deportes o eventos.
// - Permite filtrar eventos por categoría.
// - Consulta eventos REALES desde Supabase.
// - Muestra eventos recientes en "Top Eventos".
// - Permite entrar al módulo completo de Eventos.
// - Mantiene compatibilidad con modo claro / oscuro.
//
// Tabla utilizada:
//
// public.events
// ============================================================

import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../lib/ThemeContext';
import { supabase } from '../../lib/supabase';


// ============================================================
// TIPOS
// ============================================================

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


// ============================================================
// CATEGORÍAS
// ============================================================

const CATEGORIAS: Categoria[] = [
  {
    id: 'futbol',
    nombre: 'Fútbol',
    icono: '⚽',
  },

  {
    id: 'basket',
    nombre: 'Básquet',
    icono: '🏀',
  },

  {
    id: 'voley',
    nombre: 'Vóley',
    icono: '🏐',
  },

  {
    id: 'karate',
    nombre: 'Karate',
    icono: '🥋',
  },

  {
    id: 'natacion',
    nombre: 'Natación',
    icono: '🏊',
  },

  {
    id: 'esgrima',
    nombre: 'Esgrima',
    icono: '🤺',
  },

  {
    id: 'running',
    nombre: 'Running',
    icono: '🏃',
  },

  {
    id: 'padel',
    nombre: 'Pádel',
    icono: '🎾',
  },
];


// ============================================================
// NORMALIZAR NOMBRE DEL DEPORTE
// ============================================================
//
// En events.sport actualmente guardamos valores como:
//
// "Fútbol"
// "Pádel"
// "Tenis"
// "Básquet"
//
// Pero las categorías de esta pantalla utilizan IDs como:
//
// futbol
// padel
// basket
//
// Esta función convierte el texto de Supabase al ID utilizado
// por la interfaz.
// ============================================================

function normalizarDeporte(
  deporte: string
) {
  const valor = deporte
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );


  if (
    valor === 'futbol'
  ) {
    return 'futbol';
  }


  if (
    valor === 'padel'
  ) {
    return 'padel';
  }


  if (
    valor === 'basquet' ||
    valor === 'basquetbol'
  ) {
    return 'basket';
  }


  if (
    valor === 'voley' ||
    valor === 'voleibol'
  ) {
    return 'voley';
  }


  if (
    valor === 'natacion'
  ) {
    return 'natacion';
  }


  if (
    valor === 'karate'
  ) {
    return 'karate';
  }


  if (
    valor === 'esgrima'
  ) {
    return 'esgrima';
  }


  if (
    valor === 'running'
  ) {
    return 'running';
  }


  if (
    valor === 'tenis'
  ) {
    return 'tenis';
  }


  return valor;
}


// ============================================================
// OBTENER ICONO SEGÚN DEPORTE
// ============================================================

function obtenerIconoDeporte(
  deporte: string
) {
  const deporteNormalizado =
    normalizarDeporte(
      deporte
    );


  const categoria =
    CATEGORIAS.find(
      (item) =>
        item.id ===
        deporteNormalizado
    );


  // Tenis todavía no está en la grilla principal,
  // pero puede existir en events.
  if (
    deporteNormalizado ===
    'tenis'
  ) {
    return '🎾';
  }


  return (
    categoria?.icono ??
    '🏅'
  );
}


// ============================================================
// UTILIDAD PARA BUSCADOR
// ============================================================

function textoCoincide(
  texto: string,
  busqueda: string
) {
  return texto
    .toLocaleLowerCase('es')
    .includes(
      busqueda.toLocaleLowerCase(
        'es'
      )
    );
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ExplorarScreen() {
  const router =
    useRouter();


  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS DE INTERFAZ
  // ==========================================================

  const [
    busqueda,
    setBusqueda,
  ] = useState('');


  const [
    categoria,
    setCategoria,
  ] = useState<
    string | null
  >(null);


  const [
    verTodas,
    setVerTodas,
  ] = useState(false);


  // ==========================================================
  // EVENTOS REALES DE SUPABASE
  // ==========================================================

  const [
    eventos,
    setEventos,
  ] = useState<Evento[]>([]);


  const [
    cargandoEventos,
    setCargandoEventos,
  ] = useState(true);


  // ==========================================================
  // CATEGORÍAS VISIBLES
  // ==========================================================

  const categoriasVisibles =
    verTodas
      ? CATEGORIAS
      : CATEGORIAS.slice(
          0,
          6
        );


  // ==========================================================
  // CARGAR EVENTOS AL ENTRAR / VOLVER A EXPLORAR
  // ==========================================================
  //
  // Esto hace que si creamos un evento desde Eventos y luego
  // volvemos a Explorar, aparezca automáticamente.
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarEventos();
    }, [])
  );


  // ==========================================================
  // CONSULTAR EVENTOS DESDE SUPABASE
  // ==========================================================

  async function cargarEventos() {
    try {
      setCargandoEventos(
        true
      );


      const {
        data,
        error,
      } = await supabase
        .from('events')
        .select(
          `
          id,
          title,
          sport,
          location,
          date_text,
          created_at
          `
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          }
        );


      if (error) {
        throw error;
      }


      const eventosReales: Evento[] =
        (data ?? []).map(
          (evento) => {
            return {
              id:
                evento.id,

              nombre:
                evento.title,

              fecha:
                evento.date_text,

              deporte:
                normalizarDeporte(
                  evento.sport
                ),

              icono:
                obtenerIconoDeporte(
                  evento.sport
                ),

              descripcion:
                evento.location,
            };
          }
        );


      setEventos(
        eventosReales
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error cargando eventos en Explorar:',
        error
      );


      setEventos([]);
    } finally {
      setCargandoEventos(
        false
      );
    }
  }


  // ==========================================================
  // FILTRAR EVENTOS
  // ==========================================================

  const eventosVisibles =
    useMemo(() => {
      const termino =
        busqueda.trim();


      return eventos.filter(
        (evento) => {
          // ----------------------------------------------
          // FILTRO POR CATEGORÍA
          // ----------------------------------------------

          const coincideCategoria =
            categoria ===
              null ||
            evento.deporte ===
              categoria;


          // ----------------------------------------------
          // BUSCAR NOMBRE DEL DEPORTE
          // ----------------------------------------------

          const nombreDeporte =
            CATEGORIAS.find(
              (item) =>
                item.id ===
                evento.deporte
            )?.nombre ?? '';


          // ----------------------------------------------
          // FILTRO POR TEXTO
          // ----------------------------------------------

          const coincideTexto =
            !termino ||
            textoCoincide(
              `
              ${evento.nombre}
              ${nombreDeporte}
              ${evento.descripcion}
              `,
              termino
            );


          return (
            coincideCategoria &&
            coincideTexto
          );
        }
      );
    }, [
      eventos,
      busqueda,
      categoria,
    ]);


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
      edges={['top']}
    >
      <View
        style={[
          styles.marco,
          {
            backgroundColor:
              colors.background,

            borderColor:
              colors.border,
          },
        ]}
      >
        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              CABECERA
          ================================================== */}

          <View
            style={[
              styles.hero,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <View
              style={
                styles.bienvenida
              }
            >
              {/* Avatar */}

              <View
                style={
                  styles.avatar
                }
              >
                <Ionicons
                  name="person"
                  size={26}
                  color={
                    colors.primary
                  }
                />
              </View>


              {/* Bienvenida */}

              <View
                style={
                  styles.bienvenidaTexto
                }
              >
                <Text
                  style={
                    styles.welcome
                  }
                >
                  Welcome
                </Text>

                <Text
                  style={
                    styles.usuario
                  }
                >
                  a FitMatch
                </Text>
              </View>


              {/* Notificaciones */}

              <Ionicons
                name="notifications-outline"
                size={23}
                color="#FFFFFF"
              />
            </View>


            {/* ==================================================
                BUSCADOR
            ================================================== */}

            <View
              style={[
                styles.buscador,
                {
                  backgroundColor:
                    colors.card,

                  borderColor:
                    isDark
                      ? colors.border
                      : 'transparent',

                  borderWidth:
                    isDark
                      ? 1
                      : 0,
                },
              ]}
            >
              <TextInput
                value={
                  busqueda
                }
                onChangeText={
                  setBusqueda
                }
                placeholder="Buscar deporte o evento"
                placeholderTextColor={
                  colors.secondaryText
                }
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                returnKeyType="search"
                accessibilityLabel="Buscar deporte o evento"
              />


              {busqueda.length >
              0 ? (
                <TouchableOpacity
                  onPress={() =>
                    setBusqueda('')
                  }
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={23}
                    color={
                      colors.primary
                    }
                  />
                </TouchableOpacity>
              ) : (
                <Ionicons
                  name="search-outline"
                  size={25}
                  color={
                    colors.primary
                  }
                />
              )}
            </View>
          </View>


          {/* ==================================================
              CATEGORÍAS
          ================================================== */}

          <View
            style={
              styles.seccion
            }
          >
            <View
              style={
                styles.encabezadoSeccion
              }
            >
              <Text
                style={[
                  styles.tituloSeccion,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Categorías
              </Text>


              <TouchableOpacity
                onPress={() => {
                  setVerTodas(
                    (actual) =>
                      !actual
                  );

                  setCategoria(
                    null
                  );
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
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {verTodas
                    ? 'Ver menos'
                    : 'Mostrar todas'}
                </Text>
              </TouchableOpacity>
            </View>


            {/* Grilla categorías */}

            <View
              style={
                styles.categorias
              }
            >
              {categoriasVisibles.map(
                (item) => {
                  const activa =
                    categoria ===
                    item.id;


                  return (
                    <TouchableOpacity
                      key={
                        item.id
                      }
                      style={[
                        styles.categoria,
                        {
                          backgroundColor:
                            activa
                              ? isDark
                                ? '#27346A'
                                : '#E9EDFF'
                              : colors.card,

                          borderColor:
                            activa
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setCategoria(
                          activa
                            ? null
                            : item.id
                        )
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected:
                          activa,
                      }}
                      accessibilityLabel={`Filtrar por ${item.nombre}`}
                    >
                      <Text
                        style={
                          styles.emoji
                        }
                      >
                        {item.icono}
                      </Text>


                      <Text
                        style={[
                          styles.nombreCategoria,
                          {
                            color:
                              activa
                                ? colors.primary
                                : colors.secondaryText,

                            fontWeight:
                              activa
                                ? '700'
                                : '400',
                          },
                        ]}
                      >
                        {item.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>


          {/* ==================================================
              TOP EVENTOS
          ================================================== */}

          <View
            style={[
              styles.seccion,
              styles.seccionEventos,
            ]}
          >
            <View
              style={
                styles.encabezadoSeccion
              }
            >
              <Text
                style={[
                  styles.tituloSeccion,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Top Eventos
              </Text>


              <TouchableOpacity
                onPress={() =>
                  router.push(
                    '/(tabs)/eventos'
                  )
                }
              >
                <Text
                  style={[
                    styles.mostrarTodas,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Ver eventos
                </Text>
              </TouchableOpacity>
            </View>


            {/* ------------------------------------------------
                AHORA SÍ SON EVENTOS REALES
            ------------------------------------------------ */}

            <Text
              style={[
                styles.nota,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Eventos publicados por la comunidad FitMatch.
            </Text>


            {/* ------------------------------------------------
                CARGANDO
            ------------------------------------------------ */}

            {cargandoEventos ? (
              <View
                style={
                  styles.cargandoEventos
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
                    styles.cargandoTexto,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Cargando eventos...
                </Text>
              </View>
            ) : (
              <>
                {/* --------------------------------------------
                    EVENTOS
                -------------------------------------------- */}

                {eventosVisibles.map(
                  (evento) => (
                    <TouchableOpacity
                      key={
                        evento.id
                      }
                      style={[
                        styles.evento,
                        {
                          backgroundColor:
                            colors.card,

                          borderColor:
                            colors.border,
                        },
                      ]}
                      onPress={() =>
                        router.push(
                          '/(tabs)/eventos'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Ir al módulo Eventos desde ${evento.nombre}`}
                    >
                      {/* Icono */}

                      <View
                        style={[
                          styles.eventoImagen,
                          {
                            backgroundColor:
                              colors.primarySoft,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.eventoIcono
                          }
                        >
                          {evento.icono}
                        </Text>
                      </View>


                      {/* Información */}

                      <View
                        style={
                          styles.eventoContenido
                        }
                      >
                        <Text
                          style={[
                            styles.eventoTitulo,
                            {
                              color:
                                colors.text,
                            },
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
                          🕒 {evento.fecha}
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
                          📍 {evento.descripcion}
                        </Text>
                      </View>


                      {/* Flecha */}

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={
                          colors.secondaryText
                        }
                      />
                    </TouchableOpacity>
                  )
                )}


                {/* --------------------------------------------
                    SIN RESULTADOS
                -------------------------------------------- */}

                {eventosVisibles.length ===
                  0 && (
                  <View
                    style={[
                      styles.sinResultados,
                      {
                        backgroundColor:
                          colors.card,

                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={27}
                      color={
                        colors.secondaryText
                      }
                    />


                    <Text
                      style={[
                        styles.sinResultadosTitulo,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      No hay eventos disponibles
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
                      No encontramos eventos reales que coincidan
                      con esta búsqueda o categoría.
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
                        router.push(
                          '/(tabs)/eventos'
                        )
                      }
                    >
                      <Text
                        style={
                          styles.botonEventosTexto
                        }
                      >
                        Ir a Eventos
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
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


  // ==========================================================
  // HERO
  // ==========================================================

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
    backgroundColor:
      '#FFFFFF',

    width: 47,

    height: 47,

    borderRadius: 24,

    alignItems: 'center',

    justifyContent:
      'center',

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


  // ==========================================================
  // BUSCADOR
  // ==========================================================

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


  // ==========================================================
  // SECCIONES
  // ==========================================================

  seccion: {
    paddingHorizontal: 20,

    paddingTop: 20,
  },


  encabezadoSeccion: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

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


  // ==========================================================
  // CATEGORÍAS
  // ==========================================================

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

    justifyContent:
      'center',

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


  // ==========================================================
  // EVENTOS
  // ==========================================================

  seccionEventos: {
    paddingTop: 18,
  },


  nota: {
    fontSize: 10,

    marginBottom: 10,

    lineHeight: 14,
  },


  cargandoEventos: {
    alignItems: 'center',

    justifyContent:
      'center',

    paddingVertical: 28,

    gap: 8,
  },


  cargandoTexto: {
    fontSize: 12,
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

    justifyContent:
      'center',

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


  // ==========================================================
  // SIN RESULTADOS
  // ==========================================================

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
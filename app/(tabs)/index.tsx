import React, { useMemo, useState } from 'react';
import {
  Image,
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

// Pantalla de demostración visual: las categorías y los eventos son datos locales.
// Sustituir EVENTOS_EJEMPLO por datos de Supabase cuando se implemente el catálogo.
const AZUL = '#5064EF';
const FONDO = '#F5F6FF';
const TEXTO = '#24283A';

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
  return texto.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es'));
}

export default function ExplorarScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [verTodas, setVerTodas] = useState(false);

  const categoriasVisibles = verTodas ? CATEGORIAS : CATEGORIAS.slice(0, 6);
  const eventosVisibles = useMemo(() => {
    const termino = busqueda.trim();
    return EVENTOS_EJEMPLO.filter((evento) => {
      const coincideCategoria = categoria === null || evento.deporte === categoria;
      const nombreDeporte = CATEGORIAS.find((item) => item.id === evento.deporte)?.nombre ?? '';
      const coincideTexto = !termino || textoCoincide(`${evento.nombre} ${nombreDeporte}`, termino);
      return coincideCategoria && coincideTexto;
    });
  }, [busqueda, categoria]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.marco}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.bienvenida}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={26} color={AZUL} />
              </View>
              <View style={styles.bienvenidaTexto}>
                <Text style={styles.welcome}>Welcome</Text>
                <Text style={styles.usuario}>a FitMatch</Text>
              </View>
              <Ionicons name="notifications-outline" size={23} color="#FFFFFF" />
            </View>

            <View style={styles.buscador}>
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar deporte o evento"
                placeholderTextColor="#8A8D99"
                style={styles.input}
                returnKeyType="search"
                accessibilityLabel="Buscar deporte o evento"
              />
              {busqueda.length > 0 ? (
                <TouchableOpacity onPress={() => setBusqueda('')} accessibilityLabel="Limpiar búsqueda">
                  <Ionicons name="close-circle-outline" size={23} color={AZUL} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="search-outline" size={25} color={AZUL} />
              )}
            </View>
          </View>

          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>Categorías</Text>
              <TouchableOpacity
                onPress={() => { setVerTodas((actual) => !actual); setCategoria(null); }}
                accessibilityLabel={verTodas ? 'Mostrar menos categorías' : 'Mostrar todas las categorías'}
              >
                <Text style={styles.mostrarTodas}>{verTodas ? 'Ver menos' : 'Mostrar todas'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categorias}>
              {categoriasVisibles.map((item) => {
                const activa = categoria === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.categoria, activa && styles.categoriaActiva]}
                    onPress={() => setCategoria(activa ? null : item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activa }}
                    accessibilityLabel={`Filtrar por ${item.nombre}`}
                  >
                    <Text style={styles.emoji}>{item.icono}</Text>
                    <Text style={[styles.nombreCategoria, activa && styles.nombreCategoriaActivo]}>
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.seccion, styles.seccionEventos]}>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>Top Eventos</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/eventos')}>
                <Text style={styles.mostrarTodas}>Ver eventos</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nota}>Vista de ejemplo · Los eventos reales se consultarán en el módulo Eventos.</Text>

            {eventosVisibles.map((evento) => (
              <TouchableOpacity
                key={evento.id}
                style={styles.evento}
                onPress={() => router.push('/(tabs)/eventos')}
                accessibilityRole="button"
                accessibilityLabel={`Ir al módulo Eventos desde ${evento.nombre}`}
              >
                <View style={styles.eventoImagen}>
                  <Text style={styles.eventoIcono}>{evento.icono}</Text>
                </View>
                <View style={styles.eventoContenido}>
                  <Text style={styles.eventoTitulo}>{evento.nombre}</Text>
                  <Text style={styles.eventoFecha}>{evento.fecha}</Text>
                  <Text style={styles.eventoDescripcion}>{evento.descripcion}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9095A9" />
              </TouchableOpacity>
            ))}

            {eventosVisibles.length === 0 && (
              <View style={styles.sinResultados}>
                <Ionicons name="search-outline" size={27} color="#8A90AB" />
                <Text style={styles.sinResultadosTitulo}>Sin resultados de ejemplo</Text>
                <Text style={styles.sinResultadosTexto}>
                  Prueba otra categoría o abre el módulo Eventos para ver los partidos disponibles.
                </Text>
                <TouchableOpacity style={styles.botonEventos} onPress={() => router.push('/(tabs)/eventos')}>
                  <Text style={styles.botonEventosTexto}>Ir a Eventos</Text>
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
  safeArea: { flex: 1, backgroundColor: FONDO },
  marco: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: FONDO,
    ...Platform.select({ web: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E6E8F5' }, default: {} }),
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  hero: {
    backgroundColor: AZUL,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 21,
    paddingTop: 34,
    paddingBottom: 30,
    minHeight: 205,
  },
  bienvenida: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    backgroundColor: '#FFFFFF',
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  bienvenidaTexto: { flex: 1 },
  welcome: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  usuario: { fontSize: 14, color: '#FFFFFF', marginTop: 2 },
  buscador: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    marginTop: 23,
    height: 45,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, color: TEXTO, fontSize: 14, paddingVertical: 9 },
  seccion: { paddingHorizontal: 20, paddingTop: 20 },
  encabezadoSeccion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tituloSeccion: { fontSize: 15, fontWeight: '700', color: TEXTO },
  mostrarTodas: { color: TEXTO, fontSize: 13, fontWeight: '500' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 10 },
  categoria: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    height: 84,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  categoriaActiva: { borderColor: AZUL, backgroundColor: '#E9EDFF' },
  emoji: { fontSize: 34, lineHeight: 40 },
  nombreCategoria: { color: '#838690', fontSize: 12, marginTop: 3 },
  nombreCategoriaActivo: { color: AZUL, fontWeight: '700' },
  seccionEventos: { paddingTop: 18 },
  nota: { fontSize: 10, color: '#84899A', marginBottom: 10, lineHeight: 14 },
  evento: {
    backgroundColor: '#FFFFFF',
    minHeight: 73,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventoImagen: {
    width: 55,
    height: 53,
    borderRadius: 8,
    backgroundColor: '#F2F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  eventoIcono: { fontSize: 31 },
  eventoContenido: { flex: 1 },
  eventoTitulo: { fontSize: 13, fontWeight: '700', color: TEXTO },
  eventoFecha: { fontSize: 11, color: '#565B68', marginTop: 2 },
  eventoDescripcion: { fontSize: 10, color: '#9499A5', marginTop: 2 },
  sinResultados: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, alignItems: 'center', gap: 9 },
  sinResultadosTitulo: { color: TEXTO, fontWeight: '700' },
  sinResultadosTexto: { color: '#7D8291', textAlign: 'center', fontSize: 12, lineHeight: 18 },
  botonEventos: { backgroundColor: AZUL, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 5 },
  botonEventosTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});

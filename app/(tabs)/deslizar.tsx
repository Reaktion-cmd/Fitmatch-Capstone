// ============================================================
// FITMATCH - MATCH DEPORTIVO 1V1
// ============================================================
//
// Esta pantalla:
//
// - Obtiene perfiles reales desde Supabase.
// - Excluye al usuario autenticado.
// - Excluye perfiles ya evaluados con Like / Pass.
// - Prioriza deportes en común.
// - Considera nivel deportivo.
// - Calcula distancia sin obtener coordenadas ajenas.
// - Respeta el radio de búsqueda configurado.
// - Permite abrir el detalle completo del deportista.
// - Registra Like / Pass.
// - Detecta Match mutuo.
//
// ============================================================

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  PanResponder,
  Image,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  supabase,
} from '../../lib/supabase';

import {
  useTheme,
} from '../../lib/ThemeContext';


// ============================================================
// TIPOS
// ============================================================

interface PerfilMatch {
  id: string;

  full_name: string | null;

  age: number | null;

  bio: string | null;

  sports: string[] | null;

  skill_level: string | null;

  avatar_url?: string | null;

  deportesEnComun: string[];

  mismoNivel: boolean;

  puntajeOrden: number;

  distanceKm: number | null;
}


interface DistanciaPerfil {
  target_id: string;

  distance_km: number;
}


interface UsuarioRadar {
  id: string;

  full_name: string | null;

  distanceKm: number | null;
}


// ============================================================
// CONSTANTES DE RADAR Y SLIDERS
// ============================================================

const RADAR_TAMANO = 240;

const RADAR_CENTRO = 120;

// Radio máximo al que se dibuja un punto,
// medido desde el centro del círculo.

const RADAR_RADIO_MAXIMO = 112;

const TAMANO_PUNTO_RADAR = 12;

const TAMANO_PUNTO_YO = 16;

const ANCHO_SLIDER = 240;

const TAMANO_PERILLA = 26;


// ============================================================
// ÁNGULO ESTABLE POR USUARIO (HASH DEL ID)
// ============================================================
//
// La RPC solo devuelve distance_km (por privacidad, no hay
// coordenadas). El ángulo se genera de forma determinista a
// partir del target_id para que entre renders sea estable.

function hashAngulo(
  id: string
) {
  const hash = [...id].reduce(
    (
      acumulado,
      caracter
    ) =>
      acumulado +
      caracter.charCodeAt(
        0
      ),
    0
  );


  return (
    (hash % 360) *
    Math.PI /
    180
  );
}


// ============================================================
// ACOTAR VALOR
// ============================================================

function acotar(
  valor: number,
  minimo: number,
  maximo: number
) {
  return Math.min(
    maximo,
    Math.max(
      minimo,
      valor
    )
  );
}


// ============================================================
// COMPONENTE INTERNO: LÍNEA DESLIZANTE (PANRESPONDER)
// ============================================================
//
// - Modo 'rango': dos perillas arrastrables (edad mín/máx).
// - Modo 'único': una sola perilla (radio de búsqueda).
//
// Las perillas no se cruzan: la izquierda respeta max - 1
// y la derecha respeta min + 1.
//
// El gesto se maneja con UN solo PanResponder sobre una zona
// táctil que cubre toda la pista: se puede arrastrar desde
// cualquier punto y se ajusta la perilla más cercana. El
// PanResponder se memoiza para que el gesto no se rompa a
// mitad del arrastre.

interface SliderLineProps {
  valorMin: number;

  valorMax: number;

  escalaMin: number;

  escalaMax: number;

  esRango: boolean;

  onCambiar: (
    nuevoMin: number,
    nuevoMax: number
  ) => void;
}


function SliderLine(
  {
    valorMin,
    valorMax,
    escalaMin,
    escalaMax,
    esRango,
    onCambiar,
  }: SliderLineProps
) {
  const {
    colors,
  } = useTheme();


  // Últimos valores conocidos, accesibles
  // desde los callbacks del gesto.

  const valoresRef =
    useRef({
      min: valorMin,

      max: valorMax,
    });


  valoresRef.current = {
    min: valorMin,

    max: valorMax,
  };


  // Escala, callback y modo también por
  // referencia: así el PanResponder se
  // crea UNA sola vez y no se destruye en
  // medio del arrastre (recrear los
  // manejadores en cada render rompía el
  // gesto y el slider se quedaba trabado).

  const escalaRef =
    useRef({
      min: escalaMin,

      max: escalaMax,
    });


  escalaRef.current = {
    min: escalaMin,

    max: escalaMax,
  };


  const onCambiarRef =
    useRef(onCambiar);


  onCambiarRef.current = onCambiar;


  const esRangoRef =
    useRef(esRango);


  esRangoRef.current = esRango;


  // Perilla seleccionada durante el
  // arrastre ('min' | 'max' | null).

  const knobActivoRef =
    useRef<'min' | 'max' | null>(
      null
    );


  function valorAPosicion(
    valor: number
  ) {
    const escala =
      escalaRef.current;

    const factor =
      (valor - escala.min) /
      (
        escala.max -
        escala.min
      );


    return acotar(
      factor *
        ANCHO_SLIDER,
      0,
      ANCHO_SLIDER
    );
  }


  // Posición en píxeles (0 - ANCHO_SLIDER)
  // convertida de regreso a valor.

  function posicionAValor(
    posicionPx: number
  ) {
    const escala =
      escalaRef.current;

    return Math.round(
      escala.min +
      (posicionPx / ANCHO_SLIDER) *
      (
        escala.max -
        escala.min
      )
    );
  }


  // Mueve la perilla activa a una posición
  // de la pista, respetando los límites
  // (las perillas no se cruzan).

  function moverKnob(
    posicionPx: number
  ) {
    const knob =
      knobActivoRef.current;

    if (!knob) {
      return;
    }

    const escala =
      escalaRef.current;

    const valores =
      valoresRef.current;

    let nuevo =
      posicionAValor(
        posicionPx
      );


    if (esRangoRef.current) {
      if (knob === 'min') {
        nuevo = acotar(
          nuevo,
          escala.min,
          valores.max - 1
        );

        onCambiarRef.current(
          nuevo,
          valores.max
        );
      } else {
        nuevo = acotar(
          nuevo,
          valores.min + 1,
          escala.max
        );

        onCambiarRef.current(
          valores.min,
          nuevo
        );
      }
    } else {
      nuevo = acotar(
        nuevo,
        escala.min,
        escala.max
      );

      onCambiarRef.current(
        nuevo,
        nuevo
      );
    }
  }


  // ÚNICO PanResponder, montado sobre una
  // zona transparente que cubre TODO el
  // slider:
  //
  // - Se memoiza una sola vez (useMemo):
  //   recrearlo en cada render congelaba
  //   el arrastre después del primer
  //   movimiento.
  //
  // - Tocar en cualquier parte de la pista
  //   mueve la perilla más cercana (antes
  //   solo servía tocar la perilla de
  //   26 px exactos, y al juntarse ambas
  //   quedaba inalcanzable).
  //
  // - onPanResponderTerminationRequest en
  //   false: el ScrollView del panel ya no
  //   puede robar el gesto a mitad del
  //   arrastre.

  const panSlider =
    useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponderCapture: () =>
            true,

          onStartShouldSetPanResponder: () =>
            true,

          onMoveShouldSetPanResponder: () =>
            true,

          onPanResponderTerminationRequest: () =>
            false,

          onPanResponderGrant: (
            evento
          ) => {
            const x =
              acotar(
                (evento.nativeEvent.locationX ?? 0) -
                  TAMANO_PERILLA /
                    2,
                0,
                ANCHO_SLIDER
              );

            const valores =
              valoresRef.current;


            // En modo rango se elige la
            // perilla más cercana al toque.

            if (esRangoRef.current) {
              const distanciaMin =
                Math.abs(
                  x -
                  valorAPosicion(
                    valores.min
                  )
                );

              const distanciaMax =
                Math.abs(
                  x -
                  valorAPosicion(
                    valores.max
                  )
                );

              knobActivoRef.current =
                distanciaMin <=
                distanciaMax
                  ? 'min'
                  : 'max';
            } else {
              knobActivoRef.current =
                'max';
            }


            // Si el toque cae fuera del disco
            // de la perilla elegida, esta
            // salta hasta el toque. Si cae
            // dentro, se conserva su valor.

            const knob =
              knobActivoRef.current;

            const valorKnob =
              knob === 'min'
                ? valores.min
                : valores.max;

            const distancia =
              Math.abs(
                x -
                valorAPosicion(
                  valorKnob
                )
              );

            if (
              distancia >
              TAMANO_PERILLA / 2
            ) {
              moverKnob(x);
            }
          },

          onPanResponderMove: (
            evento
          ) => {
            moverKnob(
              acotar(
                (evento.nativeEvent.locationX ?? 0) -
                  TAMANO_PERILLA /
                    2,
                0,
                ANCHO_SLIDER
              )
            );
          },

          onPanResponderRelease: () => {
            knobActivoRef.current =
              null;
          },

          onPanResponderTerminate: () => {
            knobActivoRef.current =
              null;
          },
        }),
      // Sin dependencias: todo el estado
      // del gesto se lee por referencia.

      []
    );


  const posMin =
    valorAPosicion(
      valorMin
    );


  const posMax =
    valorAPosicion(
      valorMax
    );


  return (
    <View
      style={
        styles.sliderWrap
      }
    >
      {/* PISTA */}

      <View
        style={[
          styles.sliderTrack,
          {
            backgroundColor:
              colors.border,
          },
        ]}
      />


      {/* TRAMO RESALTADO ENTRE KNOBS */}

      <View
        style={[
          styles.sliderTrackActiva,
          {
            backgroundColor:
              colors.primary,

            left:
              TAMANO_PERILLA /
                2 +
              posMin,

            width: Math.max(
              0,
              posMax -
                posMin
            ),
          },
        ]}
      />


      {/* PERILLA IZQUIERDA (RANGO) */}

      {esRango && (
        <View
          style={[
            styles.sliderPerilla,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.primary,

              left: posMin,
            },
          ]}
        >
          <View
            style={[
              styles.sliderPerillaPunto,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          />
        </View>
      )}


      {/* PERILLA DERECHA (RANGO) / ÚNICA (SIMPLE) */}

      <View
        style={[
          styles.sliderPerilla,
          {
            backgroundColor:
              colors.card,

            borderColor:
              colors.primary,

            left: posMax,
          },
        ]}
      >
        <View
          style={[
            styles.sliderPerillaPunto,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        />
      </View>


      {/* ZONA TÁCTIL: capa transparente que
          cubre todo el slider, recibe el
          gesto y mueve la perilla más
          cercana. Va al final para quedar
          encima de las perillas. */}

      <View
        style={
          styles.sliderZona
        }
        {...panSlider.panHandlers}
      />
    </View>
  );
}


// ============================================================
// CATÁLOGO DE DEPORTES
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

export default function MatchScreen() {
  const router =
    useRouter();


  const {
    isDark,
    colors,
  } = useTheme();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    perfiles,
    setPerfiles,
  ] = useState<PerfilMatch[]>([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    procesando,
    setProcesando,
  ] = useState(false);


  const [
    radioBusqueda,
    setRadioBusqueda,
  ] = useState(25);


  // Panel deslizante de preferencias.

  const [
    panelFiltrosAbierto,
    setPanelFiltrosAbierto,
  ] = useState(false);


  // Valores actuales de los sliders (16 - 100 años).

  const [
    edadMin,
    setEdadMin,
  ] = useState(18);


  const [
    edadMax,
    setEdadMax,
  ] = useState(60);


  // Guardado de preferencias.

  const [
    guardandoPreferencias,
    setGuardandoPreferencias,
  ] = useState(false);


  // La RPC devolvió vacío (ubicación manual / sin GPS).

  const [
    sinUbicacion,
    setSinUbicacion,
  ] = useState(false);


  // Datos para la vista radar (todos los no evaluados).

  const [
    usuariosRadar,
    setUsuariosRadar,
  ] = useState<UsuarioRadar[]>([]);


  // ==========================================================
  // FILTROS EN VIVO SOBRE EL MAZO (EDAD + RADIO)
  // ==========================================================

  function estaDentroDelRadioEnVivo(
    perfil: PerfilMatch
  ) {
    // 0 = sin límite de distancia.

    if (
      radioBusqueda ===
      0
    ) {
      return true;
    }


    if (
      perfil.distanceKm ===
      null
    ) {
      return false;
    }


    return (
      perfil.distanceKm <=
      radioBusqueda
    );
  }


  function estaDentroDelRangoDeEdadEnVivo(
    perfil: PerfilMatch
  ) {
    // Sin edad registrada no se puede
    // comparar: no se oculta.

    if (
      perfil.age ===
      null
    ) {
      return true;
    }


    return (
      perfil.age >=
        edadMin &&
      perfil.age <=
        edadMax
    );
  }


  const perfilesVisibles =
    perfiles.filter(
      (
        perfil
      ) =>
        estaDentroDelRadioEnVivo(
          perfil
        ) &&
        estaDentroDelRangoDeEdadEnVivo(
          perfil
        )
    );


  const perfilActual =
    perfilesVisibles.length > 0
      ? perfilesVisibles[0]
      : null;


  const deportistasOcultosPorFiltros =
    perfiles.length -
    perfilesVisibles.length;


  // ==========================================================
  // RECARGAR AL ENTRAR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPerfiles();
    }, [])
  );


  // ==========================================================
  // CARGAR PERFILES
  // ==========================================================

  async function cargarPerfiles() {
    try {
      setCargando(
        true
      );


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


      // ------------------------------------------------------
      // 2. MIS PREFERENCIAS
      // ------------------------------------------------------

      const {
        data:
          miPerfil,

        error:
          miPerfilError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .select(`
            sports,
            skill_level,
            search_radius_km,
            age_min,
            age_max,
            avatar_url
          `)
          .eq(
            'id',
            user.id
          )
          .maybeSingle();


      if (miPerfilError) {
        throw miPerfilError;
      }


      const misDeportes: string[] =
        Array.isArray(
          miPerfil?.sports
        )
          ? miPerfil.sports
          : [];


      const miNivel: string | null =
        miPerfil?.skill_level ??
        null;


      // ------------------------------------------------------
      // 2.5 EDAD GUARDADA (VALORES INICIALES DEL SLIDER)
      // ------------------------------------------------------

      const edadMinGuardada =
        typeof miPerfil
          ?.age_min ===
          'number'
          ? acotar(
              miPerfil.age_min,
              16,
              100
            )
          : 18;


      const edadMaxGuardada =
        typeof miPerfil
          ?.age_max ===
          'number'
          ? acotar(
              miPerfil.age_max,
              16,
              100
            )
          : 60;


      setEdadMin(
        edadMinGuardada
      );


      setEdadMax(
        edadMaxGuardada
      );


      // ------------------------------------------------------
      // 3. RADIO DE BÚSQUEDA
      // ------------------------------------------------------

      const radioActual =
        typeof miPerfil
          ?.search_radius_km ===
          'number'
          ? miPerfil.search_radius_km
          : 25;


      // El slider va de 0 (sin límite)
      // a 100 km.

      setRadioBusqueda(
        acotar(
          radioActual,
          0,
          100
        )
      );


      // ------------------------------------------------------
      // 4. DISTANCIAS
      // ------------------------------------------------------

      const {
        data:
          distanciasData,

        error:
          distanciasError,
      } =
        await supabase.rpc(
          'get_profile_distances'
        );


      if (distanciasError) {
        throw distanciasError;
      }


      // El RPC devuelve vacío cuando el
      // usuario tiene ubicación 'manual'
      // o sin GPS.

      setSinUbicacion(
        (distanciasData ?? []).length ===
          0
      );


      const mapaDistancias =
        new Map<
          string,
          number
        >();


      (
        (
          distanciasData ??
          []
        ) as DistanciaPerfil[]
      ).forEach(
        (
          distancia
        ) => {
          mapaDistancias.set(
            distancia.target_id,

            Number(
              distancia.distance_km
            )
          );
        }
      );


      // ------------------------------------------------------
      // 5. SWIPES YA REALIZADOS
      // ------------------------------------------------------

      const {
        data:
          swipesData,

        error:
          swipesError,
      } =
        await supabase
          .from(
            'profile_swipes'
          )
          .select(
            'target_id'
          )
          .eq(
            'swiper_id',
            user.id
          );


      if (swipesError) {
        throw swipesError;
      }


      const perfilesYaEvaluados =
        new Set(
          (
            swipesData ??
            []
          ).map(
            (
              swipe
            ) =>
              swipe.target_id
          )
        );


      // ------------------------------------------------------
      // 6. OBTENER PERFILES
      // ------------------------------------------------------

      const {
        data:
          perfilesData,

        error:
          perfilesError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .select(`
            id,
            full_name,
            age,
            bio,
            sports,
            skill_level,
            avatar_url
          `)
          .neq(
            'id',
            user.id
          );


      if (perfilesError) {
        throw perfilesError;
      }


      // ------------------------------------------------------
      // 7. EXCLUIR LOS YA EVALUADOS
      // ------------------------------------------------------

      const perfilesSinEvaluar =
        (
          perfilesData ??
          []
        ).filter(
          (
            perfil
          ) =>
            !perfilesYaEvaluados.has(
              perfil.id
            )
        );


      // ------------------------------------------------------
      // 7.5 DATOS PARA LA VISTA RADAR
      //     (todos los no evaluados, incluyendo
      //     los que quedan fuera del radio)
      // ------------------------------------------------------

      setUsuariosRadar(
        perfilesSinEvaluar.map(
          (
            perfil
          ) => ({
            id:
              perfil.id,

            full_name:
              perfil.full_name,

            distanceKm:
              mapaDistancias.get(
                perfil.id
              ) ??
              null,
          })
        )
      );


      // ------------------------------------------------------
      // 8. APLICAR RADIO
      // ------------------------------------------------------

      const perfilesDentroDelRadio =
        perfilesSinEvaluar.filter(
          (
            perfil
          ) => {
            // Sin límite.

            if (
              radioActual ===
              0
            ) {
              return true;
            }


            const distancia =
              mapaDistancias.get(
                perfil.id
              );


            // Si existe un límite y no conocemos
            // la distancia, no podemos garantizar
            // que esté dentro del radio.

            if (
              distancia ===
              undefined
            ) {
              return false;
            }


            return (
              distancia <=
              radioActual
            );
          }
        );


      // ------------------------------------------------------
      // 8.5 FILTRAR POR EDAD PREFERIDA
      // ------------------------------------------------------

      const perfilesEnRangoDeEdad =
        perfilesDentroDelRadio.filter(
          (
            perfil
          ) => {
            // Sin edad registrada no se
            // puede comparar: pasa.

            if (
              perfil.age ===
              null
            ) {
              return true;
            }


            return (
              perfil.age >=
                edadMinGuardada &&
              perfil.age <=
                edadMaxGuardada
            );
          }
        );


      // ------------------------------------------------------
      // 9. AFINIDAD
      // ------------------------------------------------------

      const perfilesConAfinidad: PerfilMatch[] =
        perfilesEnRangoDeEdad.map(
          (
            perfil
          ) => {
            const deportesPerfil: string[] =
              Array.isArray(
                perfil.sports
              )
                ? perfil.sports
                : [];


            const deportesEnComun =
              misDeportes.filter(
                (
                  deporteId
                ) =>
                  deportesPerfil.includes(
                    deporteId
                  )
              );


            const mismoNivel =
              Boolean(
                miNivel &&
                perfil.skill_level &&
                miNivel ===
                  perfil.skill_level
              );


            // +10 por deporte compartido.
            // +2 por mismo nivel.
            //
            // Esto es solamente criterio de orden,
            // no un porcentaje de compatibilidad.

            const puntajeOrden =
              (
                deportesEnComun.length *
                10
              ) +
              (
                mismoNivel
                  ? 2
                  : 0
              );


            const distanceKm =
              mapaDistancias.get(
                perfil.id
              ) ??
              null;


            return {
              id:
                perfil.id,

              full_name:
                perfil.full_name,

              age:
                perfil.age,

              bio:
                perfil.bio,

              sports:
                perfil.sports,

              skill_level:
                perfil.skill_level,

              avatar_url:
                perfil.avatar_url,

              deportesEnComun,

              mismoNivel,

              puntajeOrden,

              distanceKm,
            };
          }
        );


      // ------------------------------------------------------
      // 10. ORDENAR
      // ------------------------------------------------------

      perfilesConAfinidad.sort(
        (
          perfilA,
          perfilB
        ) => {
          // Afinidad.

          if (
            perfilB.puntajeOrden !==
            perfilA.puntajeOrden
          ) {
            return (
              perfilB.puntajeOrden -
              perfilA.puntajeOrden
            );
          }


          // Deportes compartidos.

          if (
            perfilB.deportesEnComun.length !==
            perfilA.deportesEnComun.length
          ) {
            return (
              perfilB.deportesEnComun.length -
              perfilA.deportesEnComun.length
            );
          }


          // Distancia.

          if (
            perfilA.distanceKm !==
              null &&
            perfilB.distanceKm !==
              null &&
            perfilA.distanceKm !==
              perfilB.distanceKm
          ) {
            return (
              perfilA.distanceKm -
              perfilB.distanceKm
            );
          }


          // Perfiles con distancia primero.

          if (
            perfilA.distanceKm !==
              null &&
            perfilB.distanceKm ===
              null
          ) {
            return -1;
          }


          if (
            perfilA.distanceKm ===
              null &&
            perfilB.distanceKm !==
              null
          ) {
            return 1;
          }


          // Nombre.

          return (
            perfilA.full_name ??
            ''
          ).localeCompare(
            perfilB.full_name ??
            ''
          );
        }
      );


      setPerfiles(
        perfilesConAfinidad
      );
    } catch (
      error: any
    ) {
      console.log(
        'Error cargando perfiles:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron cargar perfiles para Match.'
      );


      setPerfiles(
        []
      );
    } finally {
      setCargando(
        false
      );
    }
  }


  // ==========================================================
  // TEXTO RADIO
  // ==========================================================

  function obtenerTextoRadio() {
    if (
      radioBusqueda ===
      0
    ) {
      return 'Sin límite de distancia';
    }


    return `Hasta ${radioBusqueda} km`;
  }


  // ==========================================================
  // DEPORTES
  // ==========================================================

  function obtenerDeportes(
    sports:
      string[] |
      null
  ) {
    if (
      !sports ||
      sports.length ===
        0
    ) {
      return 'Deportes no configurados';
    }


    return sports
      .map(
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


          if (!deporte) {
            return deporteId;
          }


          return `${deporte.icono} ${deporte.nombre}`;
        }
      )
      .join(
        ' / '
      );
  }


  // ==========================================================
  // DEPORTES COMPARTIDOS
  // ==========================================================

  function obtenerDeportesEnComun(
    sports:
      string[]
  ) {
    return sports
      .map(
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


          if (!deporte) {
            return deporteId;
          }


          return `${deporte.icono} ${deporte.nombre}`;
        }
      )
      .join(
        ' · '
      );
  }


  // ==========================================================
  // DISTANCIA
  // ==========================================================

  function obtenerTextoDistancia(
    distanceKm:
      number |
      null
  ) {
    if (
      distanceKm ===
      null
    ) {
      return '📍 Distancia no disponible';
    }


    if (
      distanceKm <
      1
    ) {
      return '📍 A menos de 1 km de ti';
    }


    return `📍 A ${distanceKm.toFixed(
      1
    )} km de ti`;
  }


  // ==========================================================
  // ABRIR DETALLE DEL DEPORTISTA
  // ==========================================================

  function abrirDetallePerfil() {
    if (!perfilActual) {
      return;
    }


    router.push({
      pathname:
        '/deportista/[profileId]',

      params: {
        profileId:
          perfilActual.id,
      },
    });
  }


  // ==========================================================
  // LIKE / PASS
  // ==========================================================

  async function registrarDecision(
    decision:
      'like' |
      'pass'
  ) {
    if (!perfilActual) {
      return;
    }


    try {
      setProcesando(
        true
      );


      const {
        data,
        error,
      } =
        await supabase.rpc(
          'register_swipe',
          {
            p_target_id:
              perfilActual.id,

            p_decision:
              decision,
          }
        );


      if (error) {
        throw error;
      }


      const resultado =
        Array.isArray(
          data
        )
          ? data[0]
          : null;


      const huboMatch =
        resultado
          ?.is_match ===
        true;


      // Eliminar la tarjeta actual.

      setPerfiles(
        (
          perfilesActuales
        ) =>
          perfilesActuales.filter(
            (
              perfil
            ) =>
              perfil.id !==
              perfilActual.id
          )
      );


      // Match mutuo.

      if (
        huboMatch
      ) {
        Alert.alert(
          '💚 ¡Hicieron Match!',
          `Tú y ${
            perfilActual.full_name ??
            'este usuario'
          } se dieron Me gusta mutuamente.`
        );


        return;
      }


      if (
        decision ===
        'like'
      ) {
        console.log(
          'Like registrado correctamente.'
        );
      }
    } catch (
      error: any
    ) {
      console.log(
        'Error registrando decisión:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudo registrar tu decisión.'
      );
    } finally {
      setProcesando(
        false
      );
    }
  }


  // ==========================================================
  // GUARDAR PREFERENCIAS DEL PANEL
  // ==========================================================

  async function guardarPreferencias() {
    try {
      setGuardandoPreferencias(
        true
      );


      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();


      if (!user) {
        throw new Error(
          'Sesión no encontrada.'
        );
      }


      const {
        error,
      } =
        await supabase
          .from(
            'profiles'
          )
          .update({
            age_min:
              Math.round(
                edadMin
              ),

            age_max:
              Math.round(
                edadMax
              ),

            search_radius_km:
              Math.round(
                radioBusqueda
              ),
          })
          .eq(
            'id',
            user.id
          );


      if (error) {
        throw error;
      }


      setPanelFiltrosAbierto(
        false
      );


      Alert.alert(
        '✅ Preferencias guardadas',
        'Se actualizaron tu rango de edad y radio de búsqueda.'
      );


      // Recargar el mazo con los
      // nuevos valores.

      await cargarPerfiles();
    } catch (
      error: any
    ) {
      console.log(
        'Error guardando preferencias:',
        error
      );


      Alert.alert(
        'Error',
        error?.message ??
          'No se pudieron guardar las preferencias.'
      );
    } finally {
      setGuardandoPreferencias(
        false
      );
    }
  }


  // ==========================================================
  // CARGANDO
  // ==========================================================

  if (
    cargando
  ) {
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
            Buscando deportistas compatibles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // SIN PERFILES
  // ==========================================================

  if (
    !perfilActual
  ) {
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
            styles.emptyContainer
          }
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            🏅
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
            No hay perfiles disponibles
          </Text>


          <Text
            style={[
              styles.emptyDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            No encontramos más deportistas disponibles dentro de tu configuración actual.
          </Text>


          <Text
            style={[
              styles.emptyRadiusText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            📍 {obtenerTextoRadio()}
          </Text>


          <TouchableOpacity
            style={[
              styles.reloadButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={
              cargarPerfiles
            }
          >
            <Text
              style={
                styles.reloadButtonText
              }
            >
              Buscar nuevamente
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.profileSettingsButton,
              {
                borderColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              router.push(
                '/(tabs)/perfil'
              )
            }
          >
            <Text
              style={[
                styles.profileSettingsText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              Cambiar radio de búsqueda
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // PUNTOS PARA LA VISTA RADAR
  // ==========================================================
  //
  // Distancia real desde la RPC + ángulo determinista
  // generado con un hash del id (privacidad: no hay
  // coordenadas reales).

  const puntosRadar: Array<{
    id: string;

    full_name: string | null;

    top: number;

    left: number;

    opacidad: number;

    dentro: boolean;

    distanceKm: number;
  }> = [];


  usuariosRadar.forEach(
    (
      usuario
    ) => {
      // Sin distancia conocida, el punto
      // no se dibuja.

      if (
        usuario.distanceKm ===
        null
      ) {
        return;
      }


      const dentro =
        radioBusqueda ===
          0 ||
        usuario.distanceKm <=
          radioBusqueda;


      let factor: number;


      if (
        dentro
      ) {
        // Radio 0 = sin límite: se usa
        // 100 km como escala visual.

        factor =
          radioBusqueda ===
          0
            ? Math.min(
                usuario.distanceKm /
                  100,
                1
              )
            : usuario.distanceKm /
              radioBusqueda;
      } else {
        // Fuera de rango: borde exterior.

        factor = 1;
      }


      const radioPunto =
        RADAR_RADIO_MAXIMO *
        factor;


      const angulo =
        hashAngulo(
          usuario.id
        );


      const centroX =
        RADAR_CENTRO +
        radioPunto *
          Math.sin(
            angulo
          );


      const centroY =
        RADAR_CENTRO -
        radioPunto *
          Math.cos(
            angulo
          );


      puntosRadar.push({
        id:
          usuario.id,

        full_name:
          usuario.full_name,

        top:
          centroY -
          TAMANO_PUNTO_RADAR /
            2,

        left:
          centroX -
          TAMANO_PUNTO_RADAR /
            2,

        opacidad: dentro
          ? Math.max(
              0.45,
              1 -
                factor *
                  0.45
            )
          : 0.3,

        dentro,

        distanceKm:
          usuario.distanceKm,
      });
    }
  );


  const puntosDentroDelRadio =
    puntosRadar.filter(
      (
        punto
      ) =>
        punto.dentro
    ).length;


  const puntosFueraDelRadio =
    puntosRadar.length -
    puntosDentroDelRadio;


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
            ENCABEZADO
        ================================================== */}

        <View
          style={
            styles.headerContainer
          }
        >
          {/* ==============================================
              BOTÓN FILTROS (ESQUINA SUPERIOR)
          ============================================== */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              setPanelFiltrosAbierto(
                !panelFiltrosAbierto
              )
            }
            accessibilityLabel="Abrir preferencias de match"
          >
            <Text
              style={
                styles.filterButtonEmoji
              }
            >
              {panelFiltrosAbierto
                ? '✕'
                : '⚙️'}
            </Text>
          </TouchableOpacity>


          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Match Deportivo 1v1
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
            Perfiles priorizados por deporte, nivel y cercanía
          </Text>


          <View
            style={[
              styles.radiusBadge,
              {
                backgroundColor:
                  colors.primarySoft,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.radiusBadgeText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              📍 {obtenerTextoRadio()}
            </Text>
          </View>


          {deportistasOcultosPorFiltros >
            0 && (
            <Text
              style={[
                styles.filtrosOcultosTexto,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              🔒{' '}
              {
                deportistasOcultosPorFiltros
              }{' '}
              {deportistasOcultosPorFiltros ===
              1
                ? 'deportista oculto por tus filtros'
                : 'deportistas ocultos por tus filtros'}
            </Text>
          )}
        </View>


        {/* ==================================================
            PANEL DE PREFERENCIAS (BOTÓN FILTROS)
        ================================================== */}

        {panelFiltrosAbierto && (
          <View
            style={[
              styles.filtersPanel,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >
            {/* ENCABEZADO DEL PANEL */}

            <View
              style={
                styles.panelHeader
              }
            >
              <Text
                style={[
                  styles.panelTitulo,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                🎯 Preferencias de match
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setPanelFiltrosAbierto(
                    false
                  )
                }
                accessibilityLabel="Cerrar preferencias"
              >
                <Text
                  style={[
                    styles.panelCerrar,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>


            {/* RANGO DE EDAD */}

            <Text
              style={[
                styles.sliderLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Rango de edad
            </Text>


            <Text
              style={[
                styles.sliderValorTexto,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {edadMin}{' '}
              –{' '}
              {edadMax}{' '}
              años
            </Text>


            <SliderLine
              valorMin={
                edadMin
              }

              valorMax={
                edadMax
              }

              escalaMin={
                16
              }

              escalaMax={
                100
              }

              esRango={
                true
              }

              onCambiar={(
                nuevoMin,
                nuevoMax
              ) => {
                setEdadMin(
                  nuevoMin
                );

                setEdadMax(
                  nuevoMax
                );
              }}
            />


            {/* RADIO DE BÚSQUEDA */}

            <Text
              style={[
                styles.sliderLabel,
                {
                  color:
                    colors.secondaryText,

                  marginTop:
                    18,
                },
              ]}
            >
              Radio de búsqueda
            </Text>


            <Text
              style={[
                styles.sliderValorTexto,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {radioBusqueda ===
              0
                ? 'Sin límite de distancia'
                : `${radioBusqueda} km`}
            </Text>


            <SliderLine
              valorMin={
                radioBusqueda
              }

              valorMax={
                radioBusqueda
              }

              escalaMin={
                0
              }

              escalaMax={
                100
              }

              esRango={
                false
              }

              onCambiar={(
                nuevoValor
              ) =>
                setRadioBusqueda(
                  nuevoValor
                )
              }
            />


            {/* GUARDAR PREFERENCIAS */}

            <TouchableOpacity
              style={[
                styles.guardarButton,
                {
                  backgroundColor:
                    colors.primary,

                  opacity:
                    guardandoPreferencias
                      ? 0.6
                      : 1,
                },
              ]}
              disabled={
                guardandoPreferencias
              }
              onPress={
                guardarPreferencias
              }
            >
              {guardandoPreferencias ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.guardarButtonText
                  }
                >
                  Guardar preferencias
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}


        {/* ==================================================
            RADAR DE CERCANÍA
        ================================================== */}

        <View
          style={[
            styles.radarContainer,
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
              styles.radarTitulo,
              {
                color:
                  colors.text,
              },
            ]}
          >
            📡 Radar de cercanía
          </Text>


          <Text
            style={[
              styles.radarSubtitulo,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {sinUbicacion
              ? 'Sin ubicación GPS — no se pueden ver distancias'
              : puntosRadar.length ===
                  0
                ? 'Sin deportistas disponibles todavía'
                : `${puntosDentroDelRadio} ${
                    puntosDentroDelRadio ===
                    1
                      ? 'persona'
                      : 'personas'
                  } en tu radio${
                    puntosFueraDelRadio >
                    0
                      ? ` · ${puntosFueraDelRadio} fuera de rango`
                      : ''
                  }`}
          </Text>


          <View
            style={[
              styles.radarCirculo,
              {
                backgroundColor: isDark
                  ? 'rgba(34, 197, 94, 0.05)'
                  : 'rgba(37, 99, 235, 0.05)',
              },
            ]}
          >
            {/* AROS CONCÉNTRICOS */}

            <View
              style={[
                styles.radarAroMedio,
                {
                  borderColor: isDark
                    ? 'rgba(148, 163, 184, 0.25)'
                    : 'rgba(37, 99, 235, 0.18)',
                },
              ]}
            />


            <View
              style={[
                styles.radarAroInterno,
                {
                  borderColor: isDark
                    ? 'rgba(148, 163, 184, 0.3)'
                    : 'rgba(37, 99, 235, 0.22)',
                },
              ]}
            />


            {/* TU POSICIÓN (CENTRO) */}

            <View
              style={[
                styles.radarYoDot,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />


            <Text
              style={[
                styles.radarYoEtiqueta,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Tú
            </Text>


            {/* PUNTOS DE LOS DEMÁS USUARIOS */}

            {puntosRadar.map(
              (
                punto
              ) => (
                <TouchableOpacity
                  key={
                    punto.id
                  }
                  style={[
                    styles.radarPunto,
                    {
                      top:
                        punto.top,

                      left:
                        punto.left,

                      opacity:
                        punto.opacidad,

                      backgroundColor: punto.dentro
                        ? colors.primary
                        : isDark
                          ? 'rgba(148, 163, 184, 0.7)'
                          : 'rgba(100, 116, 139, 0.7)',
                    },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      punto.full_name ??
                        'Deportista',

                      punto.dentro
                        ? `📍 A ${punto.distanceKm.toFixed(1)} km de ti`
                        : `📍 A ${punto.distanceKm.toFixed(1)} km de ti — fuera de tu radio de búsqueda`
                    )
                  }
                />
              )
            )}


            {/* SIN UBICACIÓN (SUPERPUESTO) */}

            {sinUbicacion && (
              <View
                style={
                  styles.radarSinUbicacion
                }
              >
                <Text
                  style={[
                    styles.radarSinUbicacionTexto,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  📍 Sin ubicación GPS — no se pueden ver distancias
                </Text>
              </View>
            )}
          </View>
        </View>


        {/* ==================================================
            TARJETA
        ================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >
          {/* AVATAR */}

          {perfilActual.avatar_url ? (
            <Image
              source={{
                uri:
                  perfilActual.avatar_url,
              }}
              style={[
                styles.avatarImagen,
                {
                  borderColor: isDark
                    ? colors.border
                    : 'transparent',
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor:
                    colors.primarySoft,

                  borderColor:
                    isDark
                      ? colors.border
                      : 'transparent',
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
          )}


          {/* NOMBRE */}

          <Text
            style={[
              styles.userName,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {perfilActual.full_name ??
              'Usuario FitMatch'}

            {perfilActual.age
              ? `, ${perfilActual.age}`
              : ''}
          </Text>


          {/* DISTANCIA */}

          <Text
            style={[
              styles.distanceText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {obtenerTextoDistancia(
              perfilActual.distanceKm
            )}
          </Text>


          {/* ==================================================
              COMPATIBILIDAD
          ================================================== */}

          {perfilActual
            .deportesEnComun
            .length > 0 ? (
            <View
              style={[
                styles.compatibilityBox,
                {
                  backgroundColor:
                    colors.primarySoft,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.compatibilityTitle,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                🎯{' '}
                {
                  perfilActual
                    .deportesEnComun
                    .length
                }{' '}
                {perfilActual
                  .deportesEnComun
                  .length === 1
                  ? 'deporte en común'
                  : 'deportes en común'}
              </Text>


              <Text
                style={[
                  styles.compatibilitySports,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {obtenerDeportesEnComun(
                  perfilActual
                    .deportesEnComun
                )}
              </Text>


              {perfilActual
                .mismoNivel && (
                <Text
                  style={[
                    styles.sameLevelText,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  ✓ También tienen el mismo nivel deportivo
                </Text>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.compatibilityBox,
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
                  styles.noCommonSports,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {perfilActual
                  .mismoNivel
                  ? '🎯 Mismo nivel deportivo, sin deportes en común configurados.'
                  : 'Sin deportes en común configurados.'}
              </Text>
            </View>
          )}


          {/* DEPORTES */}

          <Text
            style={[
              styles.userSport,
              {
                color:
                  isDark
                    ? '#93C5FD'
                    : '#2563EB',
              },
            ]}
          >
            {obtenerDeportes(
              perfilActual.sports
            )}
          </Text>


          {/* NIVEL */}

          <Text
            style={[
              styles.userLevel,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Nivel:{' '}

            {perfilActual.skill_level ??
              'No especificado'}
          </Text>


          {/* BIO */}

          <Text
            style={[
              styles.userBio,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {perfilActual.bio
              ? `"${perfilActual.bio}"`
              : 'Este usuario todavía no ha agregado una biografía.'}
          </Text>


          {/* ==================================================
              RF13 - VER PERFIL COMPLETO
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.detailButton,
              {
                borderColor:
                  colors.primary,

                backgroundColor:
                  colors.primarySoft,
              },
            ]}
            onPress={
              abrirDetallePerfil
            }
          >
            <Text
              style={[
                styles.detailButtonText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              Ver perfil completo
            </Text>
          </TouchableOpacity>
        </View>


        {/* ==================================================
            LIKE / PASS
        ================================================== */}

        <View
          style={
            styles.actions
          }
        >
          {/* PASS */}

          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor:
                  '#EF4444',

                backgroundColor:
                  colors.card,

                opacity:
                  procesando
                    ? 0.6
                    : 1,
              },
            ]}
            disabled={
              procesando
            }
            onPress={() =>
              registrarDecision(
                'pass'
              )
            }
            accessibilityLabel="Descartar perfil"
          >
            {procesando ? (
              <ActivityIndicator
                size="small"
                color="#EF4444"
              />
            ) : (
              <Text
                style={
                  styles.actionEmoji
                }
              >
                ❌
              </Text>
            )}
          </TouchableOpacity>


          {/* LIKE */}

          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                borderColor:
                  '#22C55E',

                backgroundColor:
                  colors.card,

                opacity:
                  procesando
                    ? 0.6
                    : 1,
              },
            ]}
            disabled={
              procesando
            }
            onPress={() =>
              registrarDecision(
                'like'
              )
            }
            accessibilityLabel="Dar me gusta al perfil"
          >
            {procesando ? (
              <ActivityIndicator
                size="small"
                color="#22C55E"
              />
            ) : (
              <Text
                style={
                  styles.actionEmoji
                }
              >
                💚
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
      flexGrow: 1,

      width: '100%',

      padding: 20,

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    // ========================================================
    // ENCABEZADO
    // ========================================================

    headerContainer: {
      alignItems:
        'center',

      width: '100%',
    },


    headerTitle: {
      fontSize: 22,

      fontWeight:
        'bold',

      marginTop: 10,

      textAlign:
        'center',
    },


    headerSubtitle: {
      fontSize: 12,

      marginTop: 5,

      textAlign:
        'center',
    },


    radiusBadge: {
      marginTop: 8,

      paddingHorizontal: 12,

      paddingVertical: 6,

      borderRadius: 16,

      borderWidth: 1,
    },


    radiusBadgeText: {
      fontSize: 11,

      fontWeight:
        '700',
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
    // TARJETA
    // ========================================================

    card: {
      width: '100%',

      maxWidth: 520,

      borderRadius: 20,

      padding: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      marginTop: 24,

      marginBottom: 22,

      elevation: 4,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.12,

      shadowRadius: 5,
    },


    avatarPlaceholder: {
      width: 100,

      height: 100,

      borderRadius: 50,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginBottom: 14,

      borderWidth: 1,
    },


    avatarEmoji: {
      fontSize: 54,
    },


    userName: {
      fontSize: 22,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    distanceText: {
      fontSize: 12,

      fontWeight:
        '600',

      marginTop: 7,

      textAlign:
        'center',
    },


    // ========================================================
    // COMPATIBILIDAD
    // ========================================================

    compatibilityBox: {
      width: '100%',

      maxWidth: 390,

      borderWidth: 1,

      borderRadius: 12,

      paddingHorizontal: 12,

      paddingVertical: 10,

      marginTop: 14,

      alignItems:
        'center',
    },


    compatibilityTitle: {
      fontSize: 13,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    compatibilitySports: {
      fontSize: 12,

      fontWeight:
        '600',

      textAlign:
        'center',

      marginTop: 5,

      lineHeight: 18,
    },


    sameLevelText: {
      fontSize: 11,

      textAlign:
        'center',

      marginTop: 5,
    },


    noCommonSports: {
      fontSize: 12,

      textAlign:
        'center',

      lineHeight: 18,
    },


    // ========================================================
    // INFORMACIÓN
    // ========================================================

    userSport: {
      fontSize: 14,

      fontWeight:
        '600',

      marginTop: 12,

      textAlign:
        'center',

      lineHeight: 21,
    },


    userLevel: {
      fontSize: 13,

      marginTop: 7,

      fontWeight:
        '600',
    },


    userBio: {
      fontSize: 14,

      textAlign:
        'center',

      marginTop: 14,

      paddingHorizontal: 10,

      lineHeight: 20,
    },


    // ========================================================
    // DETALLE DE PERFIL
    // ========================================================

    detailButton: {
      width: '100%',

      maxWidth: 300,

      borderWidth: 1,

      borderRadius: 10,

      paddingVertical: 11,

      alignItems:
        'center',

      marginTop: 18,
    },


    detailButtonText: {
      fontSize: 13,

      fontWeight:
        '700',
    },


    // ========================================================
    // BOTONES
    // ========================================================

    actions: {
      flexDirection:
        'row',

      gap: 30,

      marginBottom: 16,
    },


    circleBtn: {
      width: 65,

      height: 65,

      borderRadius: 33,

      borderWidth: 2,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    actionEmoji: {
      fontSize: 24,
    },


    // ========================================================
    // SIN RESULTADOS
    // ========================================================

    emptyContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal: 30,
    },


    emptyEmoji: {
      fontSize: 64,

      marginBottom: 18,
    },


    emptyTitle: {
      fontSize: 21,

      fontWeight:
        'bold',

      textAlign:
        'center',
    },


    emptyDescription: {
      fontSize: 14,

      textAlign:
        'center',

      lineHeight: 21,

      marginTop: 10,

      maxWidth: 420,
    },


    emptyRadiusText: {
      fontSize: 13,

      fontWeight:
        '600',

      marginTop: 12,

      textAlign:
        'center',
    },


    reloadButton: {
      marginTop: 22,

      paddingHorizontal: 22,

      paddingVertical: 12,

      borderRadius: 10,
    },


    reloadButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        'bold',

      fontSize: 14,
    },


    profileSettingsButton: {
      marginTop: 10,

      paddingHorizontal: 20,

      paddingVertical: 10,

      borderRadius: 10,

      borderWidth: 1,
    },


    profileSettingsText: {
      fontSize: 13,

      fontWeight:
        '600',
    },


    // ========================================================
    // BOTÓN FILTROS + PANEL DE PREFERENCIAS
    // ========================================================

    filterButton: {
      position:
        'absolute',

      top: 2,

      right: 0,

      width: 40,

      height: 40,

      borderRadius: 20,

      borderWidth: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    filterButtonEmoji: {
      fontSize: 16,
    },


    filtersPanel: {
      width: '100%',

      maxWidth: 520,

      borderWidth: 1,

      borderRadius: 16,

      padding: 16,

      marginTop: 14,
    },


    panelHeader: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',
    },


    panelTitulo: {
      fontSize: 14,

      fontWeight:
        '700',
    },


    panelCerrar: {
      fontSize: 16,

      fontWeight:
        '700',

      paddingHorizontal: 6,

      paddingVertical: 2,
    },


    sliderLabel: {
      fontSize: 12,

      fontWeight:
        '600',

      marginTop: 16,
    },


    sliderValorTexto: {
      fontSize: 20,

      fontWeight:
        '700',

      textAlign:
        'center',

      marginTop: 4,
    },


    sliderWrap: {
      width:
        ANCHO_SLIDER +
        TAMANO_PERILLA,

      height: 34,

      marginTop: 10,

      alignSelf:
        'center',
    },


    sliderTrack: {
      position:
        'absolute',

      top: 14,

      left:
        TAMANO_PERILLA /
        2,

      width: ANCHO_SLIDER,

      height: 6,

      borderRadius: 3,
    },


    sliderTrackActiva: {
      position:
        'absolute',

      top: 14,

      height: 6,

      borderRadius: 3,
    },


    sliderPerilla: {
      position:
        'absolute',

      top: 4,

      width: TAMANO_PERILLA,

      height: TAMANO_PERILLA,

      borderRadius:
        TAMANO_PERILLA /
        2,

      borderWidth: 2,

      justifyContent:
        'center',

      alignItems:
        'center',

      elevation: 3,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: 1,
      },

      shadowOpacity: 0.2,

      shadowRadius: 2,
    },


    sliderPerillaPunto: {
      width: 8,

      height: 8,

      borderRadius: 4,
    },


    // Zona transparente que recibe los
    // gestos del slider. zIndex y
    // elevation la ponen por encima de
    // las perillas también en Android.

    sliderZona: {
      position:
        'absolute',

      top: 0,

      left: 0,

      width:
        ANCHO_SLIDER +
        TAMANO_PERILLA,

      height: '100%',

      zIndex: 10,

      elevation: 4,
    },


    guardarButton: {
      width: '100%',

      paddingVertical: 12,

      borderRadius: 10,

      justifyContent:
        'center',

      alignItems:
        'center',

      marginTop: 22,
    },


    guardarButtonText: {
      color:
        '#FFFFFF',

      fontWeight:
        '700',

      fontSize: 14,
    },


    filtrosOcultosTexto: {
      fontSize: 11,

      fontWeight:
        '600',

      marginTop: 5,

      textAlign:
        'center',
    },


    // ========================================================
    // RADAR DE CERCANÍA
    // ========================================================

    radarContainer: {
      width: '100%',

      maxWidth: 520,

      borderWidth: 1,

      borderRadius: 16,

      paddingVertical: 16,

      paddingHorizontal: 12,

      marginTop: 12,

      marginBottom: 22,

      alignItems:
        'center',
    },


    radarTitulo: {
      fontSize: 15,

      fontWeight:
        '700',
    },


    radarSubtitulo: {
      fontSize: 11,

      marginTop: 4,

      textAlign:
        'center',
    },


    radarCirculo: {
      width: RADAR_TAMANO,

      height: RADAR_TAMANO,

      marginTop: 12,

      borderRadius:
        RADAR_TAMANO /
        2,

      borderWidth: 1,

      borderColor:
        'rgba(100, 116, 139, 0.35)',
    },


    radarAroMedio: {
      position:
        'absolute',

      top: 45,

      left: 45,

      width: 150,

      height: 150,

      borderRadius: 75,

      borderWidth: 1,
    },


    radarAroInterno: {
      position:
        'absolute',

      top: 82,

      left: 82,

      width: 76,

      height: 76,

      borderRadius: 38,

      borderWidth: 1,
    },


    radarYoDot: {
      position:
        'absolute',

      top:
        RADAR_CENTRO -
        TAMANO_PUNTO_YO /
          2,

      left:
        RADAR_CENTRO -
        TAMANO_PUNTO_YO /
          2,

      width: TAMANO_PUNTO_YO,

      height: TAMANO_PUNTO_YO,

      borderRadius:
        TAMANO_PUNTO_YO /
        2,
    },


    radarYoEtiqueta: {
      position:
        'absolute',

      top:
        RADAR_CENTRO +
        12,

      left:
        RADAR_CENTRO -
        30,

      width: 60,

      fontSize: 10,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    radarPunto: {
      position:
        'absolute',

      width: TAMANO_PUNTO_RADAR,

      height: TAMANO_PUNTO_RADAR,

      borderRadius:
        TAMANO_PUNTO_RADAR /
        2,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.6)',
    },


    radarSinUbicacion: {
      position:
        'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      justifyContent:
        'center',

      alignItems:
        'center',

      padding: 24,
    },


    radarSinUbicacionTexto: {
      fontSize: 12,

      fontWeight:
        '600',

      textAlign:
        'center',

      lineHeight: 18,
    },


    avatarImagen: {
      width: 100,

      height: 100,

      borderRadius: 50,

      borderWidth: 1,

      marginBottom: 14,
    },
  });
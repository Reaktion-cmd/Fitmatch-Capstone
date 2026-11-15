# FITMATCH
## Manual de Implementación

**Guía técnica de instalación, configuración y despliegue del sistema**

---

| | |
|---|---|
| **Producto** | FitMatch — App móvil de encuentros deportivos |
| **Versión del manual** | 1.0 |
| **Fecha de emisión** | 07 de noviembre de 2026 |
| **Dirigido a** | Equipo de desarrollo / implementación / administración técnica |
| **Estado del sistema** | Versión 1.0.0 — módulos: Perfil, Match (filtros + radar), Eventos, Chat, Calificaciones |
| **Repositorio** | `https://github.com/Reaktion-cmd/Fitmatch-Capstone` (rama `main`) |

---

## Índice

1. [Introducción](#1-introducción)
2. [Arquitectura de la solución](#2-arquitectura-de-la-solución)
3. [Requisitos de infraestructura](#3-requisitos-de-infraestructura)
4. [Dependencias: software y hardware](#4-dependencias-software-y-hardware)
5. [Parámetros y variables de entorno](#5-parámetros-y-variables-de-entorno)
6. [Instalación y configuración](#6-instalación-y-configuración)
7. [Pasos de despliegue](#7-pasos-de-despliegue)
8. [Verificación post-implementación](#8-verificación-post-implementación)
9. [Procedimiento de rollback](#9-procedimiento-de-rollback)
10. [Anexos](#10-anexos)

---

# 1. Introducción

Este manual describe el procedimiento completo para **instalar, configurar y desplegar** la aplicación FitMatch, tanto el cliente (aplicación Expo/React Native) como su backend (Supabase). Está dirigido al personal técnico: desarrolladores, administradores de la cuenta Supabase del proyecto y responsables de despliegues.

### 1.1 Alcance

| Incluye | No incluye (out of scope) |
|---|---|
| Configuración del proyecto Supabase (base de datos, autenticación, storage, realtime) | Créditos, planes y facturación de Supabase/EAS |
| Instalación del entorno de desarrollo | Diseño de marca o generación de iconos/splash |
| Despliegue en móvil (Expo Go, APK/AAB vía EAS Build) y web estática | Publicación en Play Store / App Store (se menciona solo el paso previo) |
| Variables, parámetros y verificación de puesta en marcha | Recuperación de contraseñas de usuarios finales (no automatizada en v1.0) |
| Verificación funcional post-despliegue y rollback | |

### 1.2 Resumen de la tecnología

- **Cliente:** React Native 0.86 con Expo SDK 57, TypeScript 6, Expo Router (navegación por archivos), soporte web vía `react-native-web`.
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime). Sin servidores propios: todo el backend es SaaS administrado.
- **Builds nativos:** EAS Build (projectId ya configurado en `app.json`).

---

# 2. Arquitectura de la solución

```text
┌────────────────────────────┐
│  DISPOSITIVO / NAVEGADOR    │
│  Expo Go · APK · Web        │
│  (React Native + Router)    │
└─────────────┬───────────────┘
              │  HTTPS (REST / Storage / Realtime WS)
┌─────────────▼───────────────┐
│        SUPABASE (SaaS)      │
│  • Postgres: tablas + RLS   │
│  • Auth: email/contraseña   │
│  • Storage: bucket avatars  │
│  • Realtime: tabla messages │
│  • RPC: funciones SQL       │
└─────────────────────────────┘
```

**Componentes del backend (PostgreSQL / Supabase):**

| Componente | Rol |
|---|---|
| `profiles` | Perfil del deportista (nombre, edad, bio, deportes, nivel, avatar, preferencias de match) |
| `profile_locations` | Coordenadas GPS del usuario (privadas, solo lectura por el propietario) |
| `get_profile_distances()` | Función RPC que calcula distancias Haversine sin exponer coordenadas |
| `profile_swipes`, `matches` | Decisiones Like/Pass y matches mutuos (`register_swipe()`) |
| `messages` | Mensajes de chat (sincronizados vía **Realtime**) |
| `events`, `event_participants` | Eventos deportivos y sus inscripciones (cupos garantizados por el trigger `trg_event_participants_capacidad`) |
| `profile_ratings` | Calificaciones (estrellas 1–5 + comentario, por persona y por evento) |
| Storage `avatars` | Bucket público de fotos de perfil, con RLS por carpeta de usuario |

**Cliente (rutas principales):** `login/registro/onboarding/deportes` (flujo de acceso), `(tabs)`: Deslizar · Explorar · Chat · Perfil, más detalle de evento, detalle de deportista y conversación.

---

# 3. Requisitos de infraestructura

## 3.1 Backend — Supabase (SaaS)

| Requisito | Detalle |
|---|---|
| Cuenta y proyecto | Un **proyecto Supabase activo** (plan Free es suficiente para pruebas y semáforo académico). Actúa como base de datos, autenticación, storage y realtime. |
| Región | Elegir región próxima a los usuarios (ej. `us-east-1` / `sa-east-1` para LATAM) al crear el proyecto. |
| Autenticación | Proveedor **Email** habilitado. El registro usa `signUp` con email + contraseña. |
| SQL / tabla editor | Acceso al **SQL Editor** del dashboard para ejecutar migraciones. |
| Realtime | Publicación de la tabla `messages` (migración incluida la habilita). |
| Almacenamiento | Bucket `avatars` público (lo crea la migración `20261104_add_avatar_and_match_preferences.sql`). |

## 3.2 Frontend / cliente

| Modalidad | Requisitos |
|---|---|
| **Expo Go (desarrollo/pruebas)** | PC con el servidor Metro (`npm run start`) y celular en la misma red. |
| **APK / AAB (producción simple)** | EAS Build (servicio en la nube de Expo; no requiere Android Studio local). Cuenta expo.dev con el proyecto vinculado (`projectId` en `app.json`). |
| **Web estática** | Cualquier hosting de archivos estáticos con HTTPS: Netlify Drop, Vercel, GitHub Pages, un Nginx/Apache propio. Artefacto generado con `npx expo export --platform web`. |

## 3.3 Red y seguridad

- **HTTPS obligatorio** para el acceso web y para las llamadas del cliente (Supabase ya opera por HTTPS/WS-TLS).
- **Sin firewall especial**: el cliente solo hace salidas HTTPS (443) y WebSocket (realtime).
- La clave incluida en el cliente es una **clave publishable (anon) — es segura de exponer** porque la seguridad real recae en **RLS**. Nunca incluir en el cliente la `service_role key` ni claves secretas.
- OAuth/redirects: el esquema de deep-links es `fitmatch://` (configurado en `app.json` → `scheme`).

---

# 4. Dependencias: software y hardware

## 4.1 Software — entorno de desarrollo

| Software | Versión | Uso |
|---|---|---|
| **Node.js** | ≥ 18 LTS (se recomienda la LTS activa, 20/22) | Motor de npm/Metro |
| **npm** | ≥ 9 (viene con Node) | Instalación de dependencias |
| **Git** | ≥ 2.40 | Clonado del repositorio |
| **Expo CLI** | vía `npx` (no requiere instalación global) | Servidor Metro, builds, actualizaciones |
| **EAS CLI** | vía `npx eas-cli@latest` (solo para APK/AAB) | Builds nativos en la nube |
| **Supabase Dashboard** | navegador web | Ejecución de migraciones y configuración |
| **Editor** | VS Code o equivalente | Desarrollo |
| **Python (opcional)** | ≥ 3.10 | Herramientas de documentación del proyecto |

## 4.2 Paquetes npm del proyecto (referencia, instalados con `npm install`)

| Paquete | Versión | Rol |
|---|---|---|
| `expo` | ~57.0.26 | Framework base |
| `react` / `react-native` | 19.2.3 / 0.86.3 | Núcleo de UI |
| `expo-router` | ~57.0.24 | Navegación por archivos (tabs + stack) |
| `@supabase/supabase-js` | ^2.116.0 | Cliente de Auth/DB/Storage/Realtime |
| `expo-location` | ~57.0.20 | GPS del onboarding y radar |
| `expo-image-picker` | ~57.0.20 | Foto de perfil |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Persistencia de sesión y tema |
| `react-native-web` | ^0.21.2 | Soporte navegador |
| `expo-dev-client`, `expo-font`, `expo-asset`, `expo-constants`, `expo-linking`, `expo-linear-gradient`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`, `react-native-url-polyfill`, `@expo/vector-icons` | — | Complementos del runtime |

> ⚠️ **Regla de oro:** nunca actualizar paquetes individuales con `npm update`. Usar `npx expo install --check` para instalar versiones compatibles con el SDK 57.

## 4.3 Hardware

| Equipo | Mínimo | Recomendado |
|---|---|---|
| PC de desarrollo | CPU 2 núcleos, 8 GB RAM, 10 GB libres | CPU 4+ núcleos, 16 GB RAM, SSD |
| Teléfono de prueba | Android 8+ / iOS 13+ con Expo Go | Android 10+ con GPS |
| Internet | 5 Mbps | 20 Mbps (instalación de dependencias y builds) |

---

# 5. Parámetros y variables de entorno

## 5.1 Parámetros actuales (estado v1.0.0)

| Parámetro | Ubicación actual | Valor (plantilla) | Descripción |
|---|---|---|---|
| Supabase URL | `lib/supabase.ts` | `https://<proyecto>.supabase.co` | Endpoint REST/Storage/Realtime |
| Supabase Anon Key (publishable) | `lib/supabase.ts` | `sb_publishable_...` | Clave pública del cliente (segura por diseño RLS) |
| `scheme` | `app.json` | `fitmatch` | Deep links |
| `packageName` / `bundleIdentifier` | `app.json` | `com.honwito.fitmatch` | Identificadores de app |
| `version` / `versionCode` | `app.json` / EAS | 1.0.0 | Versión visible |
| `projectId` (EAS) | `app.json → extra.eas` | UUID | Vincula los builds con expo.dev |
| Mensaje de permiso GPS | `app.json` → plugins (expo-location) | Texto que Android/iOS muestran al pedir ubicación |
| Publicación Realtime | `supabase/migrations/.../enable_messages_realtime.sql` | tabla `messages` | Chat en tiempo real |

## 5.2 Recomendación: mover las credenciales a variables de entorno

Hoy `lib/supabase.ts` tiene la URL y la anon key escritas directamente. Es funcional, pero por **buenas prácticas** conviene externalizarlas (Expo soporta variables `EXPO_PUBLIC_*` inyectadas en tiempo de build/pack):

```bash
# 1) crear .env en la raíz del proyecto (NO commitearlo)
EXPO_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

```ts
// 2) en lib/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

- Agregar `.env` al `.gitignore` (el proyecto ya ignora `.env*.local`; completar con `.env` si se desea total hermeticidad).
- Para EAS Build, definir las mismas variables con `npx eas secret:push` o en `eas.json → extra.eas`.
- **Nunca** incluir en `.env` o en el cliente la `service_role` key del Supabase.

---

# 6. Instalación y configuración

> Los pasos 6.1 a 6.3 son para un **entorno de desarrollo desde cero**. Si el equipo ya tiene la app corriendo, salte a 6.4 (backend) que sigue siendo obligatorio.

## 6.1 Obtener el código

```bash
git clone https://github.com/Reaktion-cmd/Fitmatch-Capstone.git
cd Fitmatch-Capstone
```

## 6.2 Instalar dependencias y arrancar

```bash
npm install           # instala TODAS las dependencias del package.json
npm run start         # o: npx expo start  → abre el servidor Metro en :8081
```

Opciones del menú del Metro server:

| Tecla | Acción |
|---|---|
| `w` | Abrir versión **web** en navegador |
| `a` | Abrir en **Android** ( requiere teléfono con Expo Go en la misma red, o emulador) |
| `r` | Recargar la app |
| `q` | Salir |

## 6.3 Probar en dispositivo real

1. Instalar **Expo Go** desde Play Store / App Store.
2. Escanear el **QR** que muestra `npm run start` (mismo Wi-Fi).
3. La app abre con el flujo: Bienvenida → Registro/Ingreso → Onboarding (GPS/manual) → Deportes y nivel → Pantallas principales.

## 6.4 Backend Supabase (obligatorio para producción o ambiente nuevo)

> Si ya cuenta con el proyecto Supabase del equipo (`tunbfahorohulcazrcfm.supabase.co`), este paso ya está hecho y la app funciona tal cual con el estado actual de la base.

1. **Crear el proyecto** en `supabase.com` → *New Project* → nombre y región.
2. **Habilitar Auth email/password**: Dashboard → Authentication → Providers → *Email* ON.
3. **Ejecutar las migraciones SQL, en orden, desde el SQL Editor** (copiar pegar el contenido de cada archivo):

```text
 1. 20261002000001_add_sports_and_skill_level.sql
 2. 20261002000002_add_profile_locations_and_distance.sql
 3. 20261002000003_add_search_radius.sql
 4. 20261002000004_add_manual_location.sql
 5. 20261002000005_create_events_and_participants.sql
 6. 20261002000006_create_swipes_and_matches.sql
 7. 20261002000007_create_messages.sql
 8. 20261002000008_enable_messages_realtime.sql
 9. 20261104000001_add_avatar_and_match_preferences.sql   ← Storage avatars + avatar_url + age_min/age_max + radio 0–500
10. 20261104000002_create_profile_ratings.sql             ← Calificaciones (estrellas + comentario)
11. 20261115000001_event_capacity_trigger.sql             ← Trigger de capacidad: las inscripciones nunca superan los cupos
```

> La carpeta de origen es `supabase/migrations/` del repositorio. El orden numerado ya está dado por el propio nombre de cada archivo.

4. **Verificar que Realtime quedó activado**: Database → Replication → la tabla `messages` debe figurar como `INSERT / UPDATE / DELETE` habilitados.
5. **Credenciales del cliente**: obtener `Project URL` y `Publishable (anon) key` en Project Settings → API y dejarlas en `lib/supabase.ts` (o, mejor, en variables según sección 5.2).

Solamente con esto, backend y frontend quedan integrados: no hay que configurar `CORS` ni `JWT secrets` — el cliente supabase-js se encarga de todo.

## 6.5 Usuario de prueba

Crear desde la app (Registro) o desde el dashboard: Authentication → Users → *Add user*. Opcional: insertar en `profiles` (la app la crea automáticamente al primer login si no existe).

---

# 7. Pasos de despliegue

## 7.1 Móvil — pasos para demostración (Expo Go)

1. `npm run start` en la PC (servidor Metro activo).
2. Escanear QR con Expo Go.
3. Listo — la app corre con datos reales de Supabase.

## 7.2 Móvil — APK/AAB (producción simple) con EAS Build

Requisitos: cuenta en **expo.dev** ya vinculada (el `projectId` ya está en `app.json`).

```bash
# autenticarse (solo una vez por máquina)
npx eas-cli@latest login

# build binaria de producción (AAB para tienda, o APK para distribución directa)
npx eas-cli@latest build --profile production --platform android
```

- El build se compila en la nube de Expo — no requiere Android Studio ni Java en el equipo.
- Al terminar, EAS entrega un enlace al **APK/AAB** para descargar y distribuir.
- Cuando descargue un **APK**, el dispositivo debe permitir instalación desde orígenes desconocidos. Para Play Store se requiere el **AAB** y firmado (EAS credentials gestiona las llaves).

## 7.3 Web estática

```bash
npx expo export --platform web       # genera carpeta dist/
# suba dist/ a su hosting estático:
#   • Netlify Drop (arrastrar dist/)
#   • Vercel:  npx vercel deploy dist/
#   • Servidor propio: copiar dist/ al root web del Nginx/Apache
```

Requisito: HTTPS en el dominio publicado (obligatorio para que el navegador permita mensajes realtime y uso de storage sin bloqueos de mixed-content).

## 7.4 Actualizaciones OTA (Over-the-Air, solo JS/assets)

```bash
# publicar un hotfix para usuarios con la app ya instalada
npx eas-cli@latest update --branch production --message "Fix swipe"
```

Los dispositivos reciben el cambio al reabrir la app. Solo sirve para cambios **JavaScript/estilos**: cambios nativos (nuevos permisos, librerías nativas) exigen nuevo build (sección 7.2).

---

# 8. Verificación post-implementación

Ejecutar esta lista como checklist de aceptación del despliegue. Cualquier ítem en rojo detiene la puesta en producción.

## 8.1 Verificación técnica del backend

| # | Verificación | Cómo comprobar | Esperado |
|---|---|---|---|
| 1 | Todas las tablas existen | Database → Tables | `profiles`, `profile_locations`, `profile_swipes`, `matches`, `messages`, `events`, `event_participants`, `profile_ratings` |
| 2 | RLS activo en todas las tablas | Database → cada tabla → *RLS enabled* | Habilitado en todas |
| 3 | Bucket `avatars` existe y es público | Storage → avatars | Visible, `public = true` |
| 4 | Políticas de storage | SQL: `select * from pg_policies where tablename='objects'` | 4 políticas `avatars_*` presentes |
| 5 | Realtime en `messages` | Database → Replication | Tabla señalada como publicada |
| 6 | Funciones RPC | SQL: `\df` o tabla `information_schema.routines` | `register_swipe`, `get_profile_distances` |
| 7 | Trigger de capacidad | SQL: `select tgname from pg_trigger where tgrelid = 'event_participants'::regclass and not tgisinternal;` | `trg_event_participants_capacidad` presente |
| 8 | Auth email ON | Authentication → Providers | Email habilitado |

## 8.2 Verificación funcional del cliente (smoke test)

| # | Módulo | Prueba | Resultado esperado |
|---|---|---|---|
| 1 | Registro/Ingreso | Crear cuenta nueva + login | Redirige a onboarding o pantallas principales |
| 2 | Onboarding | Conceder GPS → Continuar → elegir deportes + nivel | La app termina en la pestaña Deslizar |
| 3 | Perfil | Cambiar foto (galería), editar nombre/edad/bio/deportes/nivel | Foto actualizada + "¡Perfil actualizado!" |
| 4 | Match | Tarjeta visible con contador de ocultos si aplica | Perfil cargado, botones ❌ / ✅ operativos |
| 5 | Preferencias ⚙️ | Mover sliders (edad 2 puntos; radio 1 punto) → Guardar | "✅ Preferencias guardadas" + mazo refiltrado |
| 6 | Radar | Ver centros + puntos de usuarios con GPS | Punto "Tú" al centro, puntos posicionados |
| 7 | Match mutuo | Dos cuentas: A Like a B, B Like a A | "💚 ¡Hicieron Match!" + chat creado |
| 8 | Chat | Enviar mensaje desde dos cuentas | Mensaje aparece en ambas en tiempo real |
| 9 | Eventos | Crear evento (título+deporte+lugar+fecha+cupos) | Aparece en lista; organizador inscrito |
| 10 | Unirse | Segunda cuenta se une | Aparece en participantes; el cupo disminuye |
| 11 | Calificaciones | Participante califica con estrellas + texto | "¡Calificación guardada!" |
| 12 | Reputación | Ver perfil público del calificado | "⭐ x.x · N reseñas" + Ver reseñas |
| 13 | Web | Repetir 2–3 flujos en navegador | Sin errores en consola (errores warn de UI ignorables) |

## 8.3 Comandos de control rápido

```bash
npx tsc --noEmit          # cero errores de TypeScript = salud del código
npm run start             # approval del servidor Metro
npx expo-doctor           # diagnóstico de la instalación Expo
```

---

# 9. Procedimiento de rollback

## 9.1 ¿Cuándo hacer rollback?

- Un despliegue introduce un **error crítico de uso** (la app no permite registrar, no carga perfiles, rompe chat).
- Cambios de base de datos que afecten el flujo de la versión anterior.
- Dependencia externa caída (decisiones de Supabase fuera de nuestro control → revisar `status.supabase.com`).

## 9.2 Rollback del cliente móvil

**a) Si el problema vino de una actualización OTA (JS):**

```bash
npx eas-cli@latest update:rollback --channel production
```

Los dispositivos regresan a la versión anterior al reabrir la app.

**b) Si el problema vino de un build/APK nuevo:**

1. Volver a publicar la binaria anterior (la que estaba instalada) o generar un **nuevo build desde el commit anterior** desde el historial de EAS (`https://expo.dev` → proyecto → Builds → descargar la anterior).
2. Git: `git revert <commit-sospechoso>` y generar un **nuevo build** con etiqueta de hotfix.

## 9.3 Rollback de la versión web

1. Volver a publicar el build anterior: `git checkout <tag/commit-bueno> && npx expo export --platform web` y re-subir `dist/` al hosting (o usar el rollback del propio hosting: Netlify/Vercel conservan despliegues previos y permiten "restore").

## 9.4 Rollback de la base de datos (Supabase)

**Importante:** las migraciones del proyecto son **aditivas** (agregan columnas/tablas/políticas; no destruyen datos). Por eso un rollback "inverso" rara vez es necesario; cuando se requiere, se aplica con SQL específico:

| Qué deshacer | SQL de reversión |
|---|---|
| Desactivar calificaciones (en demo o emergencia) | `alter table public.profile_ratings disable row level security; drop table public.profile_ratings;` |
| Desactivar avatar / preferencias (si faltara módulo) | `alter table public.profiles drop column if exists avatar_url, drop column if exists age_min, drop column if exists age_max;` |
| Desactivar Realtime | Database → Replication → quitar la tabla `messages` de la publicación |

**Regla crítica:** nunca ejecutar reversión sin **respaldo previo**. Para restaurar datos completos usar los backups del Dashboard (Database → Backups; PITR incluido en planes pagos) o `pg_dump` local.

## 9.5 Rollback del storage

El bucket `avatars` es solo contenido de usuario: **no se elimina** en un rollback de código. Si se borrado por error, restaurar desde backups de storage del plan correspondiente o recargar fotos (perfiles quedarían sin imagen, pero funcionales).

## 9.6 Comunicación del rollback

1. **Avise al equipo** (canal del proyecto) con motivo y horas.
2. **Ping a usuarios** si el error fue visible: mensaje breve en canales del grupo/aula.
3. Registre el incidente en la documentación de soporte (qué falló, cuándo, cómo se resolvió) para mejora continua.

---

# 10. Anexos

## Anexo A — Comandos útiles

| Comando | Para qué |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run start` / `npx expo start` | Servidor de desarrollo (Metro) |
| `npx expo start --web` | Solo versión web |
| `npx expo export --platform web` | Compilar artefacto web estático (dist/) |
| `npx tsc --noEmit` | Validar tipos sin generar salida |
| `npx expo-doctor` | Diagnóstico de ambiente |
| `npx expo install <paquete>` | Instalar paquete compatible con el SDK |
| `npx eas-cli@latest build -p android` | Build nativo |
| `npx eas-cli@latest update ...` | Publicar actualización OTA |
| `git revert <hash>` | Revertir un commit de forma segura |

## Anexo B — Estructura de rutas del cliente

```text
app/
├── _layout.tsx            raíz de navegación
├── index.tsx              bienvenida
├── login.tsx / registro.tsx
├── onboarding.tsx         ubicación GPS/manual
├── deportes.tsx           deportes + nivel
├── deporte/[id].tsx       (auxiliar)
├── evento/[eventId].tsx   detalle de evento + calificar participantes
├── deportista/[profileId].tsx  perfil público (reseñas, estrellas)
├── conversacion/[matchId].tsx  chat 1:1 (Realtime)
└── (tabs)/
    ├── deslizar.tsx        Match 1v1 + panel preferences + radar
    ├── index.tsx           Explorar
    ├── eventos.tsx         módulo de eventos (buscador, crear, unirse)
    ├── chat.tsx            lista de conversaciones
    └── perfil.tsx          perfil + calificaciones recibidas
```

---

## Anexo C — Matriz de riesgos del proyecto

Metodología: cada riesgo se evalúa por **Probabilidad** (Alta / Media / Baja) × **Impacto** (Alto / Medio / Bajo). El **Nivel** resultante define la prioridad de atención: 🔴 Crítico, 🟠 Alto, 🟡 Medio, 🟢 Bajo. Para los riesgos 🟠 y 🔴 existe un protocolo de respuesta en el Anexo D.

| ID | Riesgo | Área | Prob. | Impacto | Nivel | Mitigación (preventiva) | Respuesta (ver Anexo D) |
|---|---|---|---|---|---|---|---|
| R-01 | Caída del servicio Supabase (indisponibilidad global o regional) | Backend | Baja | Alto | 🟡 | Monitorear `status.supabase.com`; no ejecutar cambios de credenciales ni de configuración durante la caída | D-1 |
| R-02 | Pausa del proyecto por inactividad o cuota agotada del plan Free (storage/bandwidth/DB) | Backend | Media | Alto | 🔴 | Revisar consumo mensual en Dashboard → Reports; pedir a los usuarios reintentar si el proyecto "durmió"; despertar el proyecto con una sesión | D-2 |
| R-03 | Migración SQL aplicada por error que rompe tablas o políticas existentes | Base de datos | Media | Alto | 🔴 | Ejecutar migraciones **de a una**, verificando cada resultado antes de continuar; mantener el orden del capítulo 6 | D-3 |
| R-04 | Eliminación accidental de tabla/bucket en Supabase (error humano) | Base de datos | Baja | Alto | 🟡 | Restringir ediciones al SQL Editor; operar con respaldo previo (Backups / `pg_dump`) | D-3 |
| R-05 | RLS mal configurado: datos privados legibles o Storage público modificable | Seguridad | Media | Alto | 🔴 | Revisar `pg_policies` tras cada cambio (checklist 8.1); probar con segunda cuenta que las políticas bloqueen datos de otros | D-4 |
| R-06 | Pérdida o fuga de credenciales (anon key con restricciones/secretas, o `.env`) | Seguridad | Media | Medio | 🟠 | Nunca incluir `service_role` en el cliente ni en repos; usar `.gitignore` para `.env`; rotar claves si se sospecha fuga | D-4 |
| R-07 | Force push o rebase que borre el historial de `main` del equipo | Control de versiones | Media | Alto | 🔴 | Trabajar solo con commits y push normales desde GitHub Desktop; bifurcar (branch) para pruebas; nunca force push sin confirmar con el equipo | D-5 |
| R-08 | Carpetas locales desincronizadas / trabajo sobre copias viejas (sin pull) | Control de versiones | Alta | Medio | 🔴 | Pull antes de cada sesión de trabajo; mantener solo **una** copia de trabajo por equipo | D-5 |
| R-09 | Conflicto de merge cuando dos compañeros editan el mismo archivo (ej. `perfil.tsx`) | Control de versiones | Media | Medio | 🟡 | Repartir archivos por integrante; comunicar en el chat qué archivo se está tocando | D-5 |
| R-10 | Fallo del build: incompatibilidad de dependencias con SDK 57 (updates manuales con npm) | Cliente | Media | Medio | 🟡 | Regla de oro: solo `npx expo install`; validar siempre con `npx tsc --noEmit` y `expo-doctor` | D-6 |
| R-11 | Caída de EAS Build (servicio de builds) o agotamiento de la cuota del plan gratuito en un hito de entrega | Despliegue | Baja | Medio | 🟢 | Planear builds con antelación (no el día de la defensa); tener el APK previo guardado | D-6 |
| R-12 | Teléfono/PC demo no disponible el día de la presentación | Presentación | Media | Alto | 🔴 | Tener dos vías: APK instalado + versión web publicada; duplicar la demo en un segundo dispositivo | D-7 |
| R-13 | Red (aula/empresa) que bloquea WebSockets → chat "Realtime" no recibe mensajes en vivo | Red | Media | Medio | 🟡 | Probar la red de la sala antes de la demo; documentar recarga manual como modo degradado | D-8 |
| R-14 | Uso indebido del Storage público (cargas ajenas si conocen el bucket) | Seguridad | Baja | Medio | 🟢 | Las políticas limitan escritura a carpetas propias; monitorizar tamaño del bucket | D-4 |
| R-15 | Pérdida de la cuenta del proyecto (contraseña expo.dev / Supabase) | Gestión | Baja | Alto | 🟡 | Registrar credenciales de equipo en gestor de contraseñas compartido (2FA activo) | D-9 |

**Mapa de prioridad (visión conjunta):** los riesgos 🔴 de mayor urgencia son R-02 (cuotas del plan Free), R-03/R-04 (base de datos), R-05 (RLS/seguridad), R-07/R-08 (control de versiones) y R-12 (día de la demo).

---

## Anexo D — Plan de contingencia

### D.0 Organización general

| Elemento | Definición |
|---|---|
| **Responsable técnico primario** | Líder del proyecto (o usuario con acceso admin a Supabase y expo.dev ese día) |
| **Responsable de respaldo** | Segundo integrante con acceso de admin ya configurado |
| **Canal de activación** | Chat del equipo (grupo WhatsApp/aulas) con "[CONTINGENCIA]" + nombre del escenario |
| **Tiempo objetivo** | Diagnóstico ≤ 15 min · Acción inmediata ≤ 30 min · Cierre documentado el mismo día |

Cada protocolo sigue la misma secuencia: **detectar → proteger → restaurar → comunicar → documentar**.

### D-1 — Caída de Supabase (R-01)

| Paso | Acción |
|---|---|
| 1. Detectar | La app muestra errores de red globales en **todos** los módulos (no solo uno) |
| 2. Verificar | Abrir `status.supabase.com` y el Dashboard: si el proyecto responde en Dashboard, el problema es de su red local, no del servicio |
| 3. Proteger | No ejecutar migraciones ni cambios de configuración durante la ventana de caída |
| 4. Responder | Informar disponibilidad degradada, esperar el restablecimiento; si es inactividad (pausa), **despertar el proyecto** desde el Dashboard (botón Restore) |
| 5. Cierre | Documentar duración y qué módulos se vieron afectados |

### D-2 — Cuota agotada / proyecto pausado (R-02)

| Paso | Acción |
|---|---|
| 1. Detectar | Mensaje del dashboard *"project paused"* o errores tipo "quota/bandwidth exceeded" |
| 2. Diagnóstico | Revisar en Dashboard → Settings → Usage: consumo de Storage (p. ej. cargas de fotos en masa), de base de datos y de egress |
| 3. Acción inmediata | Liberar espacio (revisar bucket `avatars` y tablas de mensajes antiguos), reducir frecuencia de carga global, y despertar el proyecto |
| 4. Mitigación | Considerar un upgrade temporal del plan o depurar los datos de prueba si fuera necesario |
| 5. Cierre | Registrar el consumo del mes para dimensionar el siguiente ciclo |

### D-3 — Base de datos dañada / tabla eliminada / migración rota (R-03, R-04)

| Paso | Acción |
|---|---|
| 1. Detectar | Errores SQL (tablas/columnas ausentes) o datos de un módulo completamente vacíos sin causa de usuario |
| 2. **Detener ediciones** | Nadie ejecuta SQL hasta que el responsable técnico valide el estado |
| 3. Diagnóstico | Comparar `Database → Tables` contra la lista del checklist 8.1; revisar el historial de consultas (Query results) para el origen |
| 4. Restaurar | Si hay backup: Dashboard → Database → Backups → restore (o `pg_dump` previo). Si solo falta estructura: re-ejecutar la migración del capítulo 6.4 en el orden correcto |
| 5. Verificación | Ejecutar el checklist 8.1 completo antes de reabrir la app al equipo |

### D-4 — Incidente de seguridad (RLS abierto / clave expuesta / abuso de Storage) (R-05, R-06, R-14)

| Paso | Acción |
|---|---|
| 1. Detectar | Auditoría de políticas violadas (ej. usuario A ve datos de B) o consumos inesperados de storage |
| 2. Contención inmediata | Pausar el módulo afectado (p. ej. deshabilitar temporalmente la subida de fotos), o desactivar el bucket público |
| 3. Corregir | Re-aplicar las políticas del capítulo 6.4; rotar la clave expuesta (Settings → API → Reset) y actualizar el cliente |
| 4. Reportar | Informar al equipo y a los usuarios si hubo exposición real de datos |
| 5. Prevención | Incluir la auditoría del checklist 8.1 en cada release |

### D-5 — Repositorio/despliegue de código comprometido (R-07, R-08, R-09)

| Paso | Acción |
|---|---|
| 1. Detectar | `main` con historial raro, commits de uno de los integrantes perdidos, o copia local muy desfasada |
| 2. Congelar commits | Pausar pushes de todo el equipo hasta diagnóstico |
| 3. Diagnóstico | Comparar `git log` de cada integrante contra `origin/main` en GitHub Desktop |
| 4. Restaurar | Restituir el estado correcto desde GitHub (`origin/main`) en la máquina afectada, re-aplicando los cambios locales que falten como commits nuevos |
| 5. Prevención | Pauta de trabajo: **pull al iniciar + push al cerrar** cada sesión; trabajo en ramas separadas cuando sean cambios largos |

### D-6 — Falla o bloqueo del sistema de builds / versión cliente (R-10, R-11)

| Paso | Acción |
|---|---|
| 1. Detectar | `eas build` falla por red, cuota o incompatibilidad reportada |
| 2. Diagnóstico | Revisar el log del build en expo.dev; ejecutar `npx expo-doctor` y `npx tsc --noEmit` localmente |
| 3. Acción inmediata | Distribuir el **último APK válido** ya guardado (sección 7.2); nunca pierda el artefacto de la demo |
| 4. Corrección | Diferir actualizaciones de dependencias; regresar a la última versión estable si un update rompe el build |

### D-7 — Equipo de demostración no disponible (R-12)

| Paso | Acción |
|---|---|
| 1. Prevención | Doble plan: APK instalado + versión web publicada + segunda cuenta demo (datos de prueba) en otro dispositivo |
| 2. Si falla el teléfono | Cambiar a la versión web (`https://mi-fitmatch.web.app` o su dominio) |
| 3. Si falla internet de la sala | Usar datos móviles del Equipo y/o mobile hotspot |
| 4. Cierre | Registrar qué modos usó realmente para ajustar la próxima demo |

### D-8 — Red sin WebSockets (R-13) / chat degradado

| Paso | Acción |
|---|---|
| 1. Detectar | Los mensajes solo aparecen al recargar manualmente la conversación |
| 2. Modo degradado | Comunicar al auditorio que el chat funciona por recarga en esa red; demostrar realtime con hotspot |
| 3. Prevención | Verificar la red de la sala **antes** de la demo; intentar forzar HTTPS/WSS si el proxy lo permite |

### D-9 — Pérdida de acceso a cuentas (R-15)

| Paso | Acción |
|---|---|
| 1. Inmediato | Ejecutar recuperación de credencial (Supabase/EAS) con el correo del Líder |
| 2. Si no es posible | Cambiar las claves de Supabase desde otro admin del equipo y mover los parámetros del cliente al nuevo proyecto |
| 3. Prevención | Gestor de contraseñas del equipo con doble custodia (2 integrantes) |

### D.10 Registro de incidente (plantilla)

Guardar un registro por incidente en la documentación del proyecto:

```text
ID-INCIDENTE:                       Fecha/hora:
Escenario (D-X):                    Nivel de riesgo (Anexo C):
Descripción:                        Módulos afectados:
Acción de contención/respuesta:     Duración de resolución:
Comunicación emitida a:             Lecciones aprendidas / cambio preventivo:
```

---

*Manual de Implementación — FitMatch v1.0.0 © 2026. Documento técnico del proyecto capstone. Actualizar la versión del documento junto con cada despliegue significativo del sistema.*

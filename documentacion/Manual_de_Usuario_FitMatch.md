# FITMATCH
## Manual de Usuario Final

**Aplicación móvil de conexión deportiva y organización de eventos**

---

| | |
|---|---|
| **Producto** | FitMatch — App móvil de encuentros deportivos |
| **Versión del manual** | 1.0 |
| **Fecha de emisión** | 07 de noviembre de 2026 |
| **Dirigido a** | Usuarios finales de FitMatch |
| **Plataformas** | Navegador web (PC) / Móvil con Expo Go |

<br>

> 📷 **Figura 1. Pantalla de bienvenida de FitMatch.**
> *(Pegue aquí la captura de la pantalla de bienvenida.)*

---

## Índice

1. [Introducción](#1-introducción)
2. [Requisitos del sistema](#2-requisitos-del-sistema)
3. [Acceso al sistema](#3-acceso-al-sistema)
4. [Descripción de funcionalidades](#4-descripción-de-funcionalidades)
5. [Instrucciones paso a paso](#5-instrucciones-paso-a-paso)
6. [Preguntas frecuentes (FAQ)](#6-preguntas-frecuentes-faq)
7. [Solución de problemas](#7-solución-de-problemas)
8. [Glosario de términos](#8-glosario-de-términos)

---

# 1. Introducción

**FitMatch** es una aplicación que conecta a personas apasionadas por el deporte, con el objetivo de que se conozcan y se organicen para practicar deporte juntos.

Funciona como una red social deportiva en la que cada usuario puede:

- Crear su **perfil de deportista** con foto, deportes preferidos, nivel de habilidad y descripción personal.
- Encontrar a otros deportistas **cercanos a su ubicación**, ajustando la distancia de búsqueda y el rango de edad de las personas que quiere conocer.
- Indicar su interés de forma simple: si el otro usuario también marca "Me gusta", se genera un **Match** y se desbloquea un chat privado.
- Participar en **eventos deportivos ("partidos")** organizados por la propia comunidad, donde los participantes pueden **calificarse entre sí** después de jugar.

Con FitMatch, cualquier persona puede, de manera autónoma, encontrar compañeros de su nivel, coordinar su próxima cita deportiva y construirse una **reputación de juego** dentro de la comunidad.

### 1.1 ¿Para quién es FitMatch?

FitMatch está pensado para personas desde los 16 años, con acceso a un dispositivo móvil o a una computadora con conexión a internet, que deseen encontrar pareja de juego, rivales, completar equipos o simplemente formar una comunidad deportiva cerca de su entorno.

---

# 2. Requisitos del sistema

## 2.1 Requisitos generales

| Requisito | Detalle |
|---|---|
| **Conexión a Internet** | Obligatoria. La app consulta datos en línea (perfiles, eventos, mensajes). Se recomienda Wi-Fi o datos móviles estables. |
| **Cuenta de usuario** | Correo electrónico válido y una contraseña (mínimo 6 caracteres; se recomiendan 8 o más). |
| **Ubicación (opcional, recomendada)** | Con el GPS habilitado podrá ver distancias reales y usar el Radar de cercanía. Si no otorga el permiso de ubicación, puede registrar una ubicación manual (cancha o ciudad) y seguir usando la app normalmente. |

## 2.2 Requisitos por plataforma

### 📱 Android (recomendado, funcionalidad completa)

- Android 8.0 o superior.
- Aplicación **Expo Go**, descargada desde Google Play.
- Espacio disponible: ~150 MB (app + Expo Go).
- Cámara o galería de imágenes si desea cargar una foto de perfil.

### 🍎 iPhone

- iOS 13 o superior, con **Expo Go** instalada desde el App Store.
- Al igual que en Android, se solicitarán permisos de ubicación y galería a medida que se usan.

### 💻 Navegador web (PC)

| Requisito | Detalle |
|---|---|
| Navegador | Google Chrome, Microsoft Edge o Safari recientes (2024 o superior) |
| Resolución mínima | 1280 × 720 (ideal: 1920 × 1080) |
| JavaScript | Habilitado (viene habilitado por defecto en navegadores modernos) |
| Cámara / GPS | En PC la ubicación depende de los permisos del navegador; es normal no disponer de GPS en computadoras de escritorio. |

> **Nota:** la experiencia completa (GPS, cámara, gestos) se vive mejor en un celular con Expo Go. La versión web es ideal para demostraciones y para el uso en escritorio.

---

# 3. Acceso al sistema

FitMatch requiere una cuenta para usar cualquiera de sus funcionalidades. El **primer acceso** se organiza en tres etapas: **Registro → Ubicación → Deportes y Nivel**.

## 3.1 Registrar una cuenta nueva (primera vez)

1. Abra la aplicación (Expo Go en el celular, o la URL del proyecto en el navegador).
2. En la pantalla de bienvenida, toque el botón de **registro / creación de cuenta**.

> 📷 **Figura 2. Pantalla de registro.**
> *(Pegue aquí la captura del formulario de registro.)*

3. Complete los campos:
   - **Nombre Completo**: con el que otros usuarios lo verán (ej.: "Juan Pérez").
   - **Correo electrónico**: formato `usuario@correo.com`.
   - **Contraseña**: la que utilizará de ahora en adelante.
4. Toque el botón para confirmar el registro.
5. Si el registro fue correcto, la app lo llevará al inicio de sesión: entre con las credenciales que acaba de crear.

> ⚠️ **Importante:** memorice o guarde su contraseña. Si tiene problemas de acceso, consulte la sección 7 (Solución de problemas).

## 3.2 Iniciar sesión (accesos posteriores)

1. Abra la aplicación. Si no mantiene la sesión iniciada, la app lo dirigirá al **login**.
2. Ingrese su **correo electrónico** y su **contraseña**.
3. Toque el botón de inicio de sesión.

> 📷 **Figura 3. Pantalla de inicio de sesión.**
> *(Pegue aquí la captura del formulario de login.)*

Si ya inició sesión anteriormente en el mismo dispositivo, la app lo recordará y entrará directamente a la pantalla principal.

## 3.3 Configuración inicial (solo la primera vez)

Al iniciar sesión por primera vez, FitMatch te pedirá **dos datos clave** de personalización:

### 3.3.1 Ubicación

1. La app te preguntará si permite acceder a tu **ubicación GPS**.
2. Elige una de las dos opciones:
   - **"Permitir ubicación"** (recomendada): la app guardará tu ubicación automática y te permitirá ver distancias reales y usar el Radar de cercanía completo.
   - **"Ingresar ubicación manual"**: escribe tu cancha o ciudad. Podrás usar todos los módulos, pero el radar y las distancias quedarán deshabilitados hasta que habilites el GPS.
3. Toca "Continuar".

> 📷 **Figura 4. Configuración de ubicación (GPS o manual).**
> *(Pegue aquí la captura de la pantalla de onboarding de ubicación.)*

### 3.3.2 Tus deportes y tu nivel

1. Marca (tocándolas) los tarjetas de los deportes que te interesan: Fútbol ⚽, Pádel 🎾, Tenis 🎾, Básquet 🏀, Running 🏃, Gimnasio 🏋️, Vóleibol 🏐 y Ciclismo 🚴.
2. Selecciona tu **Nivel de habilidad**: *Principiante*, *Intermedio* o *Avanzado*. Esto permite que deportistas con tu mismo nivel te encuentren primero.
3. Toca **Continuar**: llegarás a la pantalla principal de la app.

> 📷 **Figura 5. Selección de deportes y nivel.**
> *(Pegue aquí la captura de la pantalla de deportes.)*

---

# 4. Descripción de funcionalidades

Al terminar la configuración inicial, la barra inferior mostrará las 4 pantallas principales. En cada una podrás resolver una necesidad distinta:

| Pestaña | Funcionalidad | ¿Qué puedo hacer aquí? |
|---|---|---|
| **Deslizar** 🔀 | Match 1v1 | Ver perfiles priorizados de deportistas y dar "Me gusta" (Like) o descartar (Pass). Ajustar el **rango de edad** y la **distancia** con el panel de filtros, y observar el **radar de cercanía** con los deportistas a tu alrededor. |
| **Explorar** 🔍 | Descubrir | Buscar deportes o eventos con el buscador, revisar categorías, ver "Top Eventos" y entrar al módulo de Eventos. |
| **Chat** 💬 | Mensajería | Ver tus conversaciones con los usuarios con quienes hiciste Match, y leer y enviar mensajes en tiempo real. |
| **Perfil** 👤 | Mi cuenta | Personalizar tu perfil (foto, nombre, edad, deportes, nivel, bio, equipo e Instagram), ajustar el radio de búsqueda rápido, cambiar el tema (claro/oscuro) y cerrar sesión. |

Además, la app incluye **dos funciones clave**, disponibles dentro de estas pantallas:

- **Eventos ("partidos")**: crear, buscar, filtrar y unirte a convocatorias deportivas (desde Explorar → "Ver eventos").
- **Calificaciones**: al finalizar un evento, los participantes se califican con **estrellas (1 a 5)** y un **comentario**, para que la comunidad sepa si alguien asiste y qué tal juega.

> 📷 **Figura 6. Barra de navegación con las 4 pestañas.**
> *(Pegue aquí la captura en que se leen las pestañas Deslizar, Explorar, Chat y Perfil.)*

---

# 5. Instrucciones paso a paso

## 5.1 Personalizar tu perfil completo 📷

Tu perfil es tu "tarjeta de presentación": entre más completo esté, más fácil será que recibas Match y calificaciones positivas.

> 📷 **Figura 7. Vista general de la pestaña Perfil.**
> *(Pegue aquí la captura de tu perfil en modo lectura.)*

1. Toca la pestaña **Perfil**, abajo a la derecha.
2. **Foto de perfil**: toca tu **avatar circular** (o el ícono de cámara 📷 superpuesto en su esquina). La app abrirá tu galería: elige una imagen, recórtala en formato circular y se subirá automáticamente. Espera el aviso *"¡Foto actualizada!"*.
   - Si aún no tienes foto, verás la inicial de tu nombre.
   - Puedes cambiarla todas las veces que quieras.
3. Toca el botón de **editar** (ícono de lápiz) para activar el **modo edición**.
4. Personaliza los campos disponibles:
   - **Nombre completo**
   - **Edad** (números, entre 16 y 100)
   - **Descripción (bio)**: cuéntate en pocas líneas: quién eres, qué rutina llevas o qué buscas (máx. 500 caracteres, con contador "x/500").
   - **Deportes preferidos**: toca cada chip para marcar/desmarcar los deportes que practicas (puedes elegir varios).
   - **Nivel de habilidad**: marca **una** de las chips *Principiante / Intermedio / Avanzado*.
   - **Equipo favorito** e **Instagram**: datos opcionales.
5. Toca **Guardar** → verás "¡Perfil actualizado!" y volverás al modo lectura.

> 📷 **Figura 8. Perfil en modo edición, con los chips de deportes y nivel.**
> *(Pegue aquí la captura del perfil en modo edición.)*

### 5.1.1 Radio de búsqueda rápido (versión simple)

Más abajo en la misma pestaña **Perfil**官 encontrarás la sección **📍 Radio de búsqueda**, que ofrece valores preestablecidos: 5 km, 25 km, 50 km y **Sin límite**. Esta es la versión resumida del filtro; para el filtro avanzado con **rango de edad** usa el panel del Match (sección 5.3.3).

> 📷 **Figura 9. Selector de radio de búsqueda en el Perfil.**
> *(Pegue aquí la captura del radio de búsqueda con sus opciones.)*

### 5.1.2 Tema (claro/oscuro) y cerrar sesión

- **Tema**: en la sección de configuración del Perfil, activa o desactiva el **Modo oscuro**. Se guarda automáticamente.
- **Cerrar sesión**: al final de la pestaña Perfil hay un botón para **cerrar sesión**, que devuelve la app al login.

## 5.2 Buscar y crear eventos ("partidos") 🎯

> 📷 **Figura 10. Módulo de eventos: buscador, filtros y lista de partidos.**
> *(Pegue aquí la captura de la lista de eventos.)*

### 5.2.1 Buscar y unirte a un evento

1. Toca la pestaña **Explorar**.
2. Usa la barra superior (campo *"Buscar deporte o evento"*) para buscar por deporte o título.
3. Toca en "Ver eventos" (bajo "Top Eventos") o en una tarjeta de evento para entrar al **módulo de Eventos**.
4. Dentro del módulo, usa el buscador (*"🔍 Buscar por cancha, ciudad o título..."*) y el **filtro por deporte** para afinar la lista.
5. Revisa cada partido: título, deporte, lugar, fecha/hora, cupos ocupados y disponibles.
6. Toca **"Unirme al Partido"** en el que te interese. Tu nombre aparecerá en la lista de participantes.
7. También puedes entrar al **detalle del evento** (tocando la tarjeta) para ver toda la información, la lista de participantes y las calificaciones.

> ⚠️ Solo puedes unirte mientras haya cupos disponibles. Si el botón aparece deshabilitado, el evento está lleno o ya te encuentras inscrito.

### 5.2.2 Crear un evento nuevo

1. En el módulo de eventos, toca el botón **"Crear partido"** (botón flotante con "+").
2. Se abrirá el formulario **"Crear Nuevo Partido"**, con los campos:
   - **Título del partido** (obligatorio)
   - **Deporte** (chips)
   - **Lugar** (cancha o dirección)
   - **Fecha y Hora** (formato libre; ej.: *"Hoy 20:00"*)
   - **Cupos**: cantidad de jugadores que puedes recibir (mínimo 2, máximo 30)
3. Toca el botón de **Crear** al final del formulario. Tu evento se guardará y aparecerá en la lista. Aparecerás como **organizador** y automáticamente como primer participante.

> 📷 **Figura 11. Formulario "Crear Nuevo Partido".**
> *(Pegue aquí la captura del formulario de creación de evento.)*

### 5.2.3 Abandonar un evento

- En el **detalle del evento** al que ya estás inscrito (y del cual no eres el organizador), tendrás el botón de **cancelar / abandonar**. Al confirmar, tu nombre se retira de la lista de participantes y tu cupo queda libre.

## 5.3 Match con otros deportistas (Deslizar) 🎛️

La pestaña **Deslizar** es el corazón de FitMatch: el sistema te muestra perfiles priorizados por **deportes en común**, **nivel** y **cercanía**.

> 📷 **Figura 12. Pantalla "Match Deportivo 1v1".**
> *(Pegue aquí la captura de la tarjeta de un deportista.)*

### 5.3.1 Cómo leer la tarjeta

Cada tarjeta de deportista muestra:

- **Avatar con su foto** (o iniciales).
- **Nombre, edad y descripción**.
- Chips con sus deportes — los que compartes contigo aparecen destacados.
- Su nivel de habilidad — si coincide con el tuyo verás la línea *"✓ También tienen el mismo nivel deportivo"*.
- **Distancia**: "📍 a X km de ti" (requiere GPS).
- El botón **"Ver perfil completo"** para abrir el perfil público del deportista (con promedio de calificaciones y reseñas).

### 5.3.2 Dar Like o descartar (Pass)

Bajo la tarjeta hay **dos botones circulares grandes**:

| Botón | Color | Acción |
|---|---|---|
| ❌ | Rojo | **Pass**: descartas al deportista; desaparece del mazo. |
| ✅ (Like) | Verde | **Like**: registras interés en ese deportista. |

- Al tocar **Like**, verás el aviso *"Like registrado correctamente"*.
- **Match mutuo**: si esa persona ya te había dado Like antes, la app mostrará *"💚 ¡Hicieron Match!"* y se creará automáticamente un chat entre ambos.

> ⚠️ Las decisiones son definitivas: no puedes volver a ver un perfil que descartaste.

### 5.3.3 Panel de preferencias de Match: rango de edad y distancia ⚙️

Con este **panel de filtros avanzado** controlas **qué personas** verás y **a qué distancia**:

1. En la pestaña **Deslizar**, toca el botón **⚙️** en la esquina superior derecha. Se desplegará el panel **"🎯 Preferencias de match"**.

> 📷 **Figura 13. Panel de preferencias con los dos sliders (edad y km).**
> *(Pegue aquí la captura del panel abierto.)*

2. **Rango de edad** — una línea con **dos puntos arrastrables**:
   - Arrastra el punto izquierdo para definir la edad **mínima**, y el derecho para la **máxima**.
   - El tramo de la línea entre ambos puntos se resalta de color para indicar el rango activo.
   - Escala de 16 a 100 años; el texto grande muestra el rango actual (ej.: "18 – 45 años").
   - Los puntos **no se cruzan**: el mínimo nunca supera al máximo.
3. **Radio de búsqueda** — una línea con **un punto arrastrable**:
   - Arrastra el punto según la distancia que deseas, de 0 a 100 km.
   - Si lo mueves al extremo izquierdo (0), la app interpretará **"Sin límite de distancia"**: ya no filtrará por cercanía.
4. Toca **"Guardar preferencias"**.

> 📷 **Figura 14. Sliders con un rango de edad y un radio personalizados.**
> *(Pegue aquí la captura del panel con valores movidos y el aviso de guardado.)*

- Recibirás el aviso "✅ Preferencias guardadas" y la app recargará el mazo conforme a tus nuevos criterios.
- Si hay perfiles que quedaron fuera, verás el mensaje **"🔒 N deportistas ocultos por tus filtros"**.
- Puedes cambiar estos ajustes todas las veces que quieras, tocando ⚙️ de nuevo.

### 5.3.4 Radar de cercanía 📡

Bajo el encabezado de Deslizar verás el **Radar de cercanía**:

- El **punto del centro** representa tu ubicación/dispositivo: etiquetado como "Tú".
- **Cada punto que aparece en el círculo es un deportista real**, posicionado según su distancia real a ti:
  - Los más **cercanos** quedan cerca del centro, con puntos brillantes y sólidos.
  - Los que están **fuera de tu radio** aparecen al borde, más tenues.
- Toca cualquier punto: verás un aviso con su nombre y **"📍 a X km de ti"** (o el aviso correspondiente si está fuera del radio).
- El subtítulo del radar resume la situación: *"3 personas en tu radio · 5 fuera de rango"*.

> 📷 **Figura 16. Radar de cercanía con los deportistas posicionados.**
> *(Pegue aquí la captura del radar con puntos visibles.)*

> ⚠️ Si registraste ubicación **manual** (sin GPS), el radar mostrará *"Sin ubicación GPS — no se pueden ver distancias"*. Para activarlo, sigue la sección 3.3.1 con GPS habilitado.

## 5.4 Chatear con tus Matches 💬

> 📷 **Figura 17. Lista de conversaciones en la pestaña Chat.**
> *(Pegue aquí la captura de la lista de chats.)*

1. Toca la pestaña **Chat** para ver la lista de tus matches.
2. Toca una conversación para entrar al chat privado (1 a 1).
3. Escribe en el campo *"Escribe un mensaje..."* y toca **Enviar**. Los mensajes aparecen **en tiempo real**, sin recargar la pantalla.
4. Sugerencia: si tu match todavía no envía mensajes, verás la invitación *"Envía el primer mensaje y coordinen su próxima sesión"*.

> 📷 **Figura 18. Conversación de chat entre dos deportistas.**
> *(Pegue aquí la captura de un chat con mensajes.)*

## 5.5 Calificar a otros deportistas ⭐

Al participar en un evento puedes evaluar a los demás: si asistieron y qué tal jugaron.

### 5.5.1 Calificar a los participantes de un evento

1. Entra al detalle del evento al que te uniste (desde el módulo de Eventos, tocando la tarjeta).
2. Desliza hasta la sección **"⭐ Calificar participantes"** — la verás solo si estás inscrito.
3. Para cada participante verás su nombre y su estado de calificación, con dos opciones de botón:
   - *"⭐ Calificar"* — si aún no lo calificaste.
   - *"✏️ Editar calificación"* — si ya lo hiciste y quieres cambiarla.

> 📷 **Figura 19. Sección "Calificar participantes" con la lista de estrellas asignadas.**
> *(Pegue aquí la captura de la sección dentro del detalle del evento.)*

4. Toca el botón de calificar: se abrirá el panel *"Calificar a [nombre]"*:
   - **Estrellas**: toca de 1 a 5 estrellas.
   - **Comentario** (opcional): hasta 500 caracteres, describe qué tal fue jugar con esa persona.
5. Toca **Guardar**: verás el aviso *"¡Calificación guardada!"* y la lista se recargará.

> 📷 **Figura 20. Panel de calificación con estrellas y comentario.**
> *(Pegue aquí la captura del modal de calificación.)*

**Reglas de la calificación:**

| Regla | Detalle |
|---|---|
| Solo calificas si **participaste** del evento. | Si no estás inscrito, la sección no aparece y verás el texto *"Únete al evento para calificar a los participantes"*. |
| Una calificación por persona. | Puedes dar **1 calificación general** a un deportista, y **1 por cada evento** que compartan. No se pueden duplicar; para cambiarla, usa "✏️ Editar calificación". |
| No puedes calificarte a ti mismo. | El sistema lo impide automáticamente. |

### 5.5.2 Ver la reputación de un deportista

- Abre el **perfil público** del deportista (desde Deslizar → "Ver perfil completo", o tocando su nombre en un evento).
- En el encabezado verás: **"⭐ 4.5 · 12 reseñas"** (o *"Sin calificaciones aún"*).
- Toca **"Ver reseñas"** para leer los comentarios con autor y estrellas (hasta 5 comentarios recientes).

> 📷 **Figura 21. Perfil público con promedio de estrellas y reseñas visibles.**
> *(Pegue aquí la captura del perfil público de un deportista con sus reseñas.)*

- En **tu propio Perfil** también verás tu promedio de estrellas recibidas: es tu reputación dentro de FitMatch.

---

# 6. Preguntas frecuentes (FAQ)

**❓ ¿Qué significa "Sin límite de distancia"?**
Es el radio de búsqueda en su valor 0. Se activa moviendo el slider de distancia totalmente a la izquierda, o eligiendo "Sin límite" en el Perfil. Con ese valor, la app ya no filtra los perfiles por cercanía y te muestra a toda la comunidad.

**❓ ¿El ángulo de los puntos en el radar refleja la dirección real en que se encuentra cada persona?**
No. La app calcula la **distancia real** entre tú y cada deportista, pero por **privacidad** nunca revela su posición exacta. El ángulo de cada punto es una distribución visual estable (cada persona siempre aparece en el mismo lugar), no una ubicación geográfica.

**❓ ¿Puedo borrar las calificaciones que recibí?**
Las calificaciones las escriben quienes te evaluaron y son visibles para toda la comunidad. Si alguna contiene contenido inadecuado o injusto, reporta el caso al equipo de soporte.

**❓ ¿Puedo deshacer o rehacer un Like/Pass?**
No. Las decisiones de Match son definitivas por diseño. Con el tiempo la comunidad crece y llegarán nuevos usuarios al mazo. Si quieres ver más resultados de inmediato, verifica que tus filtros de rango de edad y radio de búsqueda no sean demasiado estrictos.

**❓ ¿Por qué no aparece la opción de calificar en un evento?**
Porque **no estás inscrito** en ese evento. Únete primero y la sección aparecerá automáticamente con la lista de participantes. Si aún no hay otros participantes, verás el mensaje *"Aún no hay otros participantes para calificar"*.

**❓ ¿Cuántas veces puedo calificar a la misma persona?**
Tienes **una** calificación general por persona, y **una** adicional por cada evento que compartan. Para cambiar tu calificación, usa el botón ✏️ **Editar calificación** en la lista del evento.

**❓ ¿Genero Match con alguien solo por estar cerca de mí?**
No. Se necesitan **dos Likes mutuos**: si tú das Like a alguien que ya te dio Like, ambos verán 💚 "¡Hicieron Match!" y el chat se abrirá. La cercanía sirve para priorizar perfiles en la detección.

**❓ ¿Funciona si no quiero dar acceso a mi ubicación GPS?**
Sí. Puedes registrar una ubicación manual (cancha o ciudad) en el onboarding y usar todo lo demás. Lo que perderás: el **Radar de cercanía** y las distancias *"a X km de ti"*, porque ambos requieren GPS.

**❓ ¿La foto de perfil es obligatoria?**
No. Sin foto, FitMatch te muestra la inicial de tu nombre. Aun así, se recomienda cargar una foto real: los perfiles con foto reciben muchos más Likes.

**❓ ¿Puedo cambiar mi nombre o mi edad después de registrarme?**
Sí. En **Perfil → modo edición** puedes actualizar nombre, edad, bio, deportes, nivel, equipo favorito e Instagram, cuando quieras.

**❓ ¿En qué dispositivos funciona FitMatch?**
En cualquier dispositivo que ejecute **Expo Go**: Android (8+) e iOS (13+); o bien en un navegador de PC actualizado con la versión web.

**❓ ¿Puedo apuntarme a varios eventos a la vez?**
Sí, mientras haya cupos disponibles. Puedes ser participante de tantos eventos como quieras al mismo tiempo.

**❓ ¿Qué pasa si el evento que deseo ya se llenó?**
La inscripción se detendrá (el botón se deshabilita automáticamente). El organizador puede crear un nuevo evento, o puedes esperar a que algún participante abandone y libere su cupo.

---

# 7. Solución de problemas

| # | Problema | Causa probable | Solución |
|---|---|---|---|
| 1 | *"Error cargando perfil"*, o la app se queda en blanco al entrar | Conexión a Internet interrumpida o sesión vencida | 1) Verifica tu Wi-Fi/datos. 2) Cierra la app y vuelve a abrirla. 3) Si persiste, cierra sesión y vuelve a iniciarla. |
| 2 | *"Sin ubicación GPS — no se pueden ver distancias"* en el radar | Registraste ubicación manual, o negaste el permiso GPS | Regresa al onboarding y elige "Permitir ubicación", o habilita el GPS en los ajustes del dispositivo/navegador y reabre la app. |
| 3 | No puedo subir la foto de perfil | Permiso de galería denegado, o imagen muy pesada | Concede el permiso de "Fotos"/"Almacenamiento" en los ajustes del dispositivo. Elige una imagen en formato JPG o PNG (la app la comprime automáticamente) y vuelve a intentarlo. |
| 4 | La foto se subió pero no se ve actualizada | Caché del navegador o de Expo | Espera unos segundos y vuelve a entrar al Perfil. Si persiste: cierra y reabre la app (Ctrl+Shift+R en navegador para recarga forzada). |
| 5 | Me dice *"Ya calificaste"* al tocar ⭐ | Ya existe una calificación tuya para esa persona | Usa el botón **✏️ Editar calificación** en la lista del evento para modificarla. |
| 6 | No me aparece la sección de calificar en un evento | Usted no está inscrito en ese evento | Busca el evento y toca "Unirme al Partido" **antes** de calificar. |
| 7 | No aparecen perfiles en Deslizar | Rango de edad/radio muy estrictos, o todos los perfiles ya fueron evaluados | Amplía tu rango de edad (⚙️) o el radio; revisa el mensaje "🔒 N deportistas ocultos por tus filtros". También puedes esperar a que la comunidad crezca: nuevos usuarios llegarán al mazo. |
| 8 | El botón "Unirme al Partido" está deshabilitado | Sin cupos disponibles, o ya estás inscrito | Revisa la lista de participantes en el detalle del evento; si ya estás inscrito no es necesario unirse. Si se llenó, busca otros eventos o crea uno nuevo. |
| 9 | No me deja escribir en el chat | Los chats solo existen **entre Matches mutuos** | Asegúrate de haber dado Like a esa persona y de que ella haya dado Like a ti. Si el Match ya existe, la conversación aparecerá en la pestaña Chat. |
| 10 | No veo los mensajes nuevos en tiempo real | Conexión inestable o pestaña en segundo plano | Revisa tu conexión. En navegador, mantén la pestaña visible; al volver a la conversación los mensajes se recargan automáticamente. |
| 11 | *"Bucket not found"* al subir la foto | Configuración del servicio de almacenamiento pendiente | Contacta al **equipo de soporte técnico** de FitMatch (es un ajuste del administrador del sistema, no de tu dispositivo). |
| 12 | Mensajes de error técnicos raros en pantalla | Actualización del backend pendiente | Reporta el **mensaje textual** al soporte indicando módulo, hora y dispositivo. |
| 13 | Olvidé mi contraseña | — | A la fecha de esta versión (1.0), la recuperación por correo no está automatizada en la app: contacta al soporte de FitMatch con el correo registrado. |
| 14 | La app no responde / pantalla congelada | Caché de navegador o app satura el dispositivo | En navegador: Ctrl+Shift+R (recarga forzada). En móvil: cierra y reabre Expo Go; si persiste, desinstala y reinstala Expo Go. |
| 15 | Advertencias técnicas en consola (*shadow\*, pointerEvents deprecated*) | Mensaje de desarrollo | **Ignorable**: no afecta el uso de la aplicación. |

**Contacto de soporte (equipo FitMatch):** comunícate con el equipo desarrollador o el responsable del proyecto, indicando: tu nombre, correo registrado, dispositivo/navegador, pantalla donde ocurre el problema y —si es posible— una captura de pantalla del error.

---

# 8. Glosario de términos

| Término | Definición |
|---|---|
| **Match** | Cuando dos usuarios se dan "Me gusta" mutuamente: se abre automáticamente un chat privado. |
| **Like / Pass** | "Me gusta" y "Descartar": tu decisión sobre el perfil actual en Deslizar. Es definitiva. |
| **Mazo** | Colección de perfiles de deportistas disponibles para ti, ordenados por afinidad (deportes, nivel, cercanía). |
| **Perfil priorizado** | Perfiles que FitMatch muestra primero porque comparten deportes, nivel o están cerca. |
| **Radio de búsqueda** | Distancia máxima (en km) de los deportistas que quieres ver; 0 = "Sin límite". |
| **Radar de cercanía** | Vista circular de Deslizar donde cada punto representa a un deportista real según su distancia a ti. |
| **Eventos ("partidos")** | Convocatorias deportivas creadas por la comunidad: título, lugar, fecha/hora y cupos. |
| **Organizador** | Usuario que creó el evento; forma parte de los participantes desde el inicio. |
| **Calificación / Reseña** | Valoración de 1 a 5 estrellas y comentario que un participante le da a otro en un evento (o una calificación general). |
| **Nivel de habilidad** | Categoría del deportista: Principiante / Intermedio / Avanzado. |
| **Deporte en común** | Deporte que ambos usuarios registraron como preferido: mejora la prioridad del Match. |
| **Onboarding** | Configuración inicial al crear tu cuenta: ubicación + deportes + nivel. |
| **Modo oscuro** | Tema visual alternativo con fondo oscuro, activable desde el Perfil. |

---

*Manual de Usuario Final — FitMatch © 2026. Documento de apoyo creado para el proyecto capstone. Los textos y pantallas pueden variar ligeramente en próximas versiones de la aplicación.*

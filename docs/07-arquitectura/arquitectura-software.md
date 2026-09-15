# Arquitectura de Software - FitMatch

## 1. Propósito

El presente documento describe la arquitectura de software actual de FitMatch, las principales tecnologías utilizadas, la relación entre sus componentes y los elementos que todavía se encuentran en desarrollo.

La arquitectura será actualizada progresivamente a medida que nuevas funcionalidades sean integradas al backend y a la base de datos.

---

## 2. Arquitectura general

FitMatch utiliza actualmente una arquitectura cliente-servidor.

La aplicación móvil actúa como cliente y es desarrollada utilizando React Native y Expo.

Supabase es utilizado como servicio backend para la autenticación de usuarios y está considerado como plataforma para la persistencia de información del proyecto.

Actualmente algunas funcionalidades de la aplicación todavía trabajan con información local o simulada y deberán ser integradas posteriormente con el backend.

La arquitectura general puede representarse de la siguiente forma:

```text
┌──────────────────────────────┐
│       Usuario FitMatch       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Aplicación móvil FitMatch    │
│ React Native + Expo          │
│ TypeScript + Expo Router     │
└──────────────┬───────────────┘
               │
        ┌──────┴─────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌─────────────────┐
│ Expo Location │  │    Supabase     │
│ Geolocalización│ │                 │
└───────────────┘  │ - Autenticación │
                   │ - Base de datos │
                   │   (proyectada)  │
                   └─────────────────┘
```

---

## 3. Aplicación móvil

La capa de presentación corresponde a la aplicación móvil desarrollada con React Native y Expo.

Actualmente contiene las siguientes pantallas principales:

- Pantalla de bienvenida.
- Inicio de sesión.
- Registro.
- Solicitud de ubicación.
- Selección de deportes.
- Selección de nivel deportivo.
- Match deportivo.
- Eventos.
- Chat.
- Perfil de usuario.

La navegación entre las pantallas se gestiona mediante Expo Router.

---

## 4. Tecnologías utilizadas

Actualmente el proyecto utiliza las siguientes tecnologías y versiones:

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.86.3 | Desarrollo de la aplicación móvil |
| React | 19.2.3 | Construcción de interfaces |
| Expo | 57.0.22 | Entorno de desarrollo y ejecución |
| Expo Router | 57.0.21 | Navegación entre pantallas |
| TypeScript | 6.0.3 | Lenguaje utilizado en el desarrollo |
| Supabase JS | 2.116.0 | Comunicación con servicios de Supabase |
| Expo Location | 57.0.17 | Acceso a ubicación del dispositivo |
| AsyncStorage | 2.2.0 | Persistencia local de la sesión |
| Git | - | Control de versiones |
| GitHub | - | Repositorio remoto del proyecto |

---

## 5. Autenticación

La autenticación actualmente se encuentra integrada con Supabase.

La aplicación permite:

- Registrar un usuario mediante correo electrónico y contraseña.
- Iniciar sesión.
- Cerrar sesión.
- Mantener la sesión del usuario mediante almacenamiento local.

La aplicación utiliza el servicio de autenticación de Supabase mediante el cliente `supabase-js`.

El flujo actual es:

```text
Usuario
   ↓
Pantalla Registro / Login
   ↓
Supabase Auth
   ↓
Validación de credenciales
   ↓
Sesión de usuario
   ↓
Acceso a FitMatch
```

AsyncStorage es utilizado para persistir la sesión en el dispositivo.

---

## 6. Geolocalización

FitMatch utiliza actualmente Expo Location para solicitar permiso de acceso a la ubicación del usuario.

Durante el onboarding la aplicación:

1. Solicita permiso de ubicación.
2. Comprueba si el usuario autoriza el acceso.
3. Obtiene las coordenadas actuales del dispositivo.
4. Continúa hacia la configuración deportiva.

Actualmente las coordenadas obtenidas no se almacenan permanentemente ni se utilizan todavía para realizar cálculos de distancia entre usuarios.

La integración de ubicación con la lógica de Match se realizará en una etapa posterior.

---

## 7. Selección de deportes y nivel

La aplicación dispone de una pantalla que permite seleccionar uno o más deportes.

Actualmente se consideran deportes como:

- Fútbol.
- Pádel.
- Tenis.
- Básquetbol.
- Running.
- Gimnasio.
- Vóleibol.
- Ciclismo.

También se permite seleccionar un nivel deportivo:

- Principiante.
- Intermedio.
- Avanzado.

Actualmente esta información se administra localmente dentro de la pantalla y todavía no se encuentra almacenada en la base de datos.

---

## 8. Módulo de Match

La aplicación posee actualmente una interfaz inicial de Match deportivo.

La pantalla muestra un perfil deportivo de ejemplo y permite representar visualmente acciones de aceptación o rechazo.

Actualmente:

- La información presentada es simulada.
- No existe todavía un algoritmo real de compatibilidad.
- No existe conexión entre el Match y la base de datos.
- Los botones de aceptación y rechazo todavía no generan relaciones persistentes entre usuarios.

La futura lógica de Match deberá considerar criterios definidos por el proyecto, como:

- Deporte.
- Nivel deportivo.
- Distancia.
- Disponibilidad.

La forma exacta en que estos criterios serán combinados deberá ser definida antes de implementar el algoritmo definitivo.

---

## 9. Módulo de eventos

FitMatch cuenta actualmente con una pantalla funcional de eventos deportivos.

La interfaz permite:

- Visualizar eventos.
- Buscar eventos.
- Filtrar eventos por deporte.
- Crear un evento.
- Definir ubicación.
- Definir fecha y hora.
- Indicar cantidad de cupos.
- Unirse a un evento.
- Visualizar eventos en los que participa el usuario.

Actualmente los eventos son almacenados temporalmente en el estado local de la aplicación.

Por esta razón:

- Los eventos desaparecen al reiniciar la aplicación.
- No existe todavía persistencia en Supabase.
- Los eventos no son compartidos todavía entre distintos usuarios reales.

La integración con la base de datos será necesaria para convertir este módulo en una funcionalidad multiusuario.

---

## 10. Perfil de usuario

La aplicación dispone de una pantalla de perfil que permite visualizar y modificar información como:

- Nombre.
- Edad.
- Biografía.
- Deportes.
- Equipo favorito.
- Red social.

Actualmente la edición del perfil se realiza mediante estado local dentro de la aplicación.

La única integración actual del módulo de perfil con Supabase corresponde al cierre de sesión.

La persistencia de perfiles en la base de datos deberá implementarse posteriormente.

---

## 11. Chat

La aplicación dispone actualmente de una pantalla destinada al módulo de chat.

Sin embargo, el sistema de mensajería todavía no se encuentra implementado.

Actualmente la pantalla funciona como una representación inicial de la futura funcionalidad.

En una versión posterior se deberá definir:

- Almacenamiento de mensajes.
- Relación entre usuarios.
- Chats asociados a Matches.
- Chats asociados a eventos.
- Actualización de mensajes.
- Control de acceso a conversaciones.

---

## 12. Base de datos

Supabase está considerado como plataforma de base de datos del proyecto.

Actualmente la integración efectiva con Supabase se concentra principalmente en el sistema de autenticación.

Las funcionalidades de:

- Perfiles.
- Deportes.
- Matches.
- Eventos.
- Participaciones.
- Chats.

todavía deberán definir sus respectivas estructuras de almacenamiento e integrarse con la base de datos.

El modelo definitivo será documentado posteriormente en el documento de Modelo de Base de Datos.

---

## 13. Estado actual de los componentes

| Componente | Estado actual |
|---|---|
| Aplicación móvil | Implementada |
| Navegación | Implementada |
| Registro | Implementado con Supabase |
| Inicio de sesión | Implementado con Supabase |
| Cierre de sesión | Implementado con Supabase |
| Persistencia de sesión | Implementada |
| Solicitud de ubicación | Implementada |
| Selección de deportes | Implementada en frontend |
| Selección de nivel | Implementada en frontend |
| Perfil | Implementado parcialmente, datos locales |
| Eventos | Implementados parcialmente, datos locales |
| Match | Prototipo visual |
| Algoritmo de compatibilidad | Pendiente |
| Base de datos de perfiles | Pendiente |
| Base de datos de eventos | Pendiente |
| Chat | Pendiente |
| Notificaciones | Pendiente |

---

## 14. Decisiones arquitectónicas

### React Native y Expo

Se utilizan para facilitar el desarrollo de una aplicación móvil utilizando una única base de código.

### Expo Router

Se utiliza para estructurar la navegación de la aplicación mediante rutas basadas en archivos.

### Supabase

Se utiliza actualmente para autenticación y se proyecta como plataforma para gestionar la persistencia de los datos necesarios para FitMatch.

### TypeScript

Se utiliza para mejorar la organización del código y reducir errores mediante tipado estático.

### Git y GitHub

Se utilizan para mantener control de versiones, trazabilidad de cambios y colaboración durante el desarrollo.

---

## 15. Restricciones actuales

La arquitectura actual presenta las siguientes restricciones:

- Varias funcionalidades todavía funcionan únicamente con datos locales.
- La lógica definitiva del Match aún no está implementada.
- El modelo de base de datos todavía debe ser definido.
- El chat no se encuentra implementado.
- La ubicación todavía no se utiliza para calcular distancias.
- Las funcionalidades dependen de conexión a Internet cuando requieren servicios de Supabase.

---

## 16. Evolución prevista

La arquitectura deberá evolucionar progresivamente para incorporar persistencia real de información.

Una arquitectura futura esperada sería:

```text
                    ┌──────────────────┐
                    │     Usuario      │
                    └────────┬─────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   App móvil FitMatch  │
                 │ React Native + Expo   │
                 └───────────┬───────────┘
                             │
             ┌───────────────┼─────────────────┐
             │               │                 │
             ▼               ▼                 ▼
      ┌────────────┐   ┌─────────────┐  ┌─────────────┐
      │ Supabase   │   │ Expo        │  │ Lógica de   │
      │ Auth       │   │ Location    │  │ Match       │
      └──────┬─────┘   └─────────────┘  └──────┬──────┘
             │                                   │
             └──────────────┬────────────────────┘
                            ▼
                  ┌────────────────────┐
                  │ Supabase Database  │
                  │                    │
                  │ - Perfiles         │
                  │ - Deportes         │
                  │ - Eventos          │
                  │ - Participaciones  │
                  │ - Matches          │
                  │ - Mensajes         │
                  └────────────────────┘
```

Esta representación corresponde a una evolución prevista y no implica que todos estos componentes se encuentren actualmente implementados.

---

## 17. Estado del documento

**Versión:** 0.1

**Estado:** Arquitectura inicial basada en el estado actual del proyecto.

**Fecha de elaboración:** 14-09-2026

El documento será actualizado a medida que se incorporen nuevas integraciones y componentes al sistema.
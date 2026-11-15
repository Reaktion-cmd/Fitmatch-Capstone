# Requisitos No Funcionales - FitMatch

## 1. Propósito

El presente documento define los requisitos no funcionales iniciales de FitMatch.

Estos requisitos establecen características de calidad relacionadas con seguridad, privacidad, rendimiento, disponibilidad, usabilidad y compatibilidad de la aplicación.

---

## 2. Seguridad

### RNF-01 - Autenticación

El sistema deberá restringir el acceso a las funcionalidades privadas únicamente a usuarios autenticados.

### RNF-02 - Protección de credenciales

Las contraseñas de los usuarios no deberán almacenarse directamente en la aplicación ni mostrarse en texto visible.

La autenticación será gestionada mediante los mecanismos proporcionados por Supabase.

### RNF-03 - Control de acceso

El sistema deberá controlar que cada usuario pueda acceder únicamente a la información y funcionalidades correspondientes a sus permisos.

### RNF-04 - Sesiones

El sistema deberá gestionar de forma segura las sesiones de los usuarios y permitir su cierre cuando sea solicitado.

**Mecanismo implementado (v1.0.0):**

- El acceso se realiza mediante **Supabase Auth** (correo + contraseña). Las contraseñas no se almacenan en la aplicación ni en texto visible (RNF-02): el cliente solo recibe y renueva un **token JWT** cuyo ciclo de vida (expiración, renovación, invalidación) es controlado por el servicio de autenticación en el servidor.
- La sesión se persiste localmente en el dispositivo mediante **AsyncStorage**, configurando el cliente `supabase-js` con `persistSession: true` y `autoRefreshToken: true`. AsyncStorage no cifra su contenido: lo almacenado es el token de sesión de corta duración — nunca la contraseña — y su uso indebido queda acotado por la expiración del JWT y por el sandbox del sistema operativo (los datos de la aplicación no son accesibles por otras apps en dispositivos sin privilegios elevados).
- El **cierre de sesión** invoca `signOut`, que elimina la sesión local del dispositivo y revoca el acceso del token en el servidor.
- **Evolución comprometida (v1.1):** migrar la persistencia de la sesión a `expo-secure-store` (almacenamiento cifrado del keystore del sistema operativo). Se registró como mejora *Should Have* en el Product Roadmap; la migración requiere un adaptador de fragmentación debido al límite de tamaño por valor de SecureStore (≈2 KB).

---

## 3. Privacidad

### RNF-05 - Protección de datos personales

La aplicación deberá utilizar únicamente la información personal necesaria para el funcionamiento de FitMatch.

### RNF-06 - Ubicación

En caso de utilizar información de ubicación, el sistema deberá solicitar autorización al usuario antes de acceder a ella.

### RNF-07 - Exposición de información

La aplicación deberá evitar mostrar información sensible de un usuario a otros usuarios sin una necesidad funcional.

---

## 4. Usabilidad

### RNF-08 - Interfaz comprensible

La interfaz deberá permitir que los usuarios identifiquen fácilmente las principales funcionalidades de la aplicación.

### RNF-09 - Navegación

La navegación entre las principales pantallas deberá ser consistente y mantener una estructura comprensible para el usuario.

### RNF-10 - Mensajes al usuario

El sistema deberá informar al usuario cuando una operación sea realizada correctamente o cuando ocurra un error que impida completarla.

### RNF-11 - Validación de formularios

Los formularios deberán validar la información ingresada y comunicar claramente los campos incorrectos o incompletos.

---

## 5. Rendimiento

### RNF-12 - Tiempo de respuesta

Las principales acciones de la aplicación deberán responder en un tiempo que permita una experiencia de uso fluida bajo condiciones normales de conexión.

### RNF-13 - Carga de información

La aplicación deberá evitar cargas innecesarias de información que puedan afectar negativamente el rendimiento del dispositivo o la experiencia del usuario.

---

## 6. Disponibilidad

### RNF-14 - Disponibilidad de servicios

Las funcionalidades que dependan de servicios externos estarán disponibles mientras dichos servicios se encuentren operativos y exista conexión a Internet.

### RNF-15 - Manejo de errores de conexión

La aplicación deberá informar al usuario cuando una operación no pueda completarse debido a problemas de conexión o indisponibilidad de un servicio.

---

## 7. Compatibilidad

### RNF-16 - Dispositivos móviles

FitMatch deberá estar diseñado principalmente para su ejecución en dispositivos móviles compatibles con React Native y Expo.

### RNF-17 - Resoluciones de pantalla

La interfaz deberá adaptarse a diferentes tamaños de pantalla móvil sin impedir el acceso a las principales funcionalidades.

---

## 8. Mantenibilidad

### RNF-18 - Organización del código

El código deberá mantenerse organizado en componentes, pantallas y módulos que faciliten su comprensión y modificación.

### RNF-19 - Control de versiones

Los cambios relevantes realizados en el proyecto deberán mantenerse registrados mediante Git y el repositorio de GitHub del proyecto.

### RNF-20 - Documentación

La documentación técnica y de gestión deberá actualizarse progresivamente a medida que evolucione el proyecto.

---

## 9. Integridad de inscripciones

### RNF-21 - Control de cupos en eventos

El sistema deberá garantizar, **a nivel de base de datos**, que las inscripciones a un evento nunca superen la cantidad de cupos definida por su organizador, incluso ante inscripciones simultáneas.

**Mecanismo implementado (v1.0.0):**

- Trigger `BEFORE INSERT` (`trg_event_participants_capacidad`) sobre `event_participants`, respaldado por la función `controlar_capacidad_evento()` (migración `20261115000001_event_capacity_trigger.sql`).
- La función **bloquea la fila del evento** (`SELECT ... FOR UPDATE`), lo que serializa las inscripciones simultáneas: cada inscripción espera a la anterior y evalúa el conteo real dentro de su propia transacción.
- Si el conteo de participantes alcanza `slots`, el insert es rechazado con el error `EVENTO_LLENO`, que la aplicación traduce al mensaje "Evento completo — el último cupo fue tomado por otro usuario".
- La verificación previa en el cliente (botón deshabilitado sin cupos) se mantiene como medida de usabilidad, pero **la garantía real vive en el motor de datos**: ninguna ruta de escritura (aplicación, consola SQL o llamada REST directa) puede superar los cupos.

**Verificación comprometida:** inscribir simultáneamente N cuentas reales a un evento con cupo K < N; el resultado esperado es exactamente K inscritos y el resto de las solicitudes rechazadas con "Evento completo".

**Limitación documentada:** si el organizador reduce `slots` por debajo de los participantes actuales, los inscritos previos no son expulsados; el evento queda marcado como completo y no acepta nuevas inscripciones. Comportamiento aceptado para el MVP.

---

## 10. Validación de políticas de acceso a los datos

El RNF-03 (control de acceso) se materializa con **Row Level Security** en todas las tablas. Esta matriz registra el estado de validación de cada política mediante pruebas con dos cuentas reales (usuario A no debe leer ni escribir los datos de usuario B).

**Última actualización:** 15-11-2026 · **Fecha límite de cierre:** 22-11-2026

| # | Tabla / recurso | Política probada | Validación esperada | Estado | Responsable |
|---|---|---|---|---|---|
| 1 | `profile_locations` | Ubicación privada | A no puede consultar las coordenadas de B (solo `get_profile_distances()` devuelve distancia) | ⏳ Pendiente | Brayan |
| 2 | `profiles` | Perfil propio editable | A puede editar solo su perfil; el perfil de B es de solo lectura | ⏳ Pendiente | Sebastián |
| 3 | `profile_swipes` / `matches` | Decisiones privadas | A no puede leer los swipes de B; los matches son visibles solo para sus dos participantes | 🔶 Parcial (evidencia: prueba de match mutuo con 2 cuentas) | Brayan |
| 4 | `messages` | Mensajes protegidos | A solo lee/escribe mensajes de sus propios matches | 🔶 Parcial (evidencia: prueba de chat en vivo con 2 cuentas) | Miguel |
| 5 | `events` / `event_participants` | Eventos compartidos | Todos leen eventos y participantes; cada usuario inscribe/cancela solo su propia participación | ⏳ Pendiente | Sebastián |
| 6 | `profile_ratings` | Calificaciones válidas | A no puede modificar calificaciones de B; rating restringido a 1–5 (`CHECK`) | ⏳ Pendiente | Brayan |
| 7 | Storage `avatars` | Fotos por carpeta | A solo sube/reemplaza/elimina en `avatars/{su_user_id}/`; lectura pública | ⏳ Pendiente | Sebastián |
| 8 | Verificación global | Checklist 8.1 del Manual de Implementación | RLS habilitado en las 8 tablas; 4 políticas `avatars_*` presentes | ⏳ Pendiente (re-ejecutar al cierre) | Equipo |

**Guion de prueba estándar (por fila):** con la cuenta A autenticada, intentar leer/escribir el recurso de la cuenta B (vía aplicación y vía SQL Editor con el JWT de A); el resultado esperado es que la operación sea rechazada o devuelva únicamente el conjunto permitido por la política. Cada validación se registra con captura y fecha en las evidencias de Fase 3.

---

## 11. Estado del documento

**Versión:** 1.0

**Estado:** Actualizado tras la revisión del docente (seguridad de sesiones, validación de políticas de acceso e integridad de cupos).

**Fecha de elaboración:** 14-09-2026

**Fecha de última actualización:** 15-11-2026

Los requisitos no funcionales podrán ser ajustados a medida que se realicen pruebas y se definan métricas específicas para el MVP.
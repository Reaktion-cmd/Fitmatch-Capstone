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

## 9. Estado del documento

**Versión:** 0.1

**Estado:** Borrador inicial.

**Fecha de elaboración:** 14-09-2026

Los requisitos no funcionales podrán ser ajustados a medida que se realicen pruebas y se definan métricas específicas para el MVP.
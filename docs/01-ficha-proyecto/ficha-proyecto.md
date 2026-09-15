# Ficha del Proyecto - FitMatch

## 1. Información general

**Nombre del proyecto:** FitMatch

**Tipo de proyecto:** Aplicación móvil para conexión y organización de actividades deportivas.

**Sponsor:** Pendiente de definir.

**Product Owner:** Pendiente de definir.

**Scrum Master:** Pendiente de definir.

**Equipo de desarrollo:**
- Miguel
- Aidan
- Sebastián
- Brayan

**Fecha de inicio:** Pendiente de definir.

**Fecha estimada de término:** Pendiente de definir.


---

## 2. Problema

Las personas interesadas en practicar deportes de manera amateur pueden presentar dificultades para encontrar compañeros o rivales con características compatibles, coordinar actividades deportivas y mantener la participación de los integrantes.

Entre los principales problemas identificados preliminarmente se encuentran:

- Dificultad para encontrar compañeros que practiquen el mismo deporte.
- Dificultad para encontrar personas con un nivel deportivo similar.
- Dificultad de equipos o grupos para encontrar rivales.
- Cancelaciones de participantes a último momento.
- Problemas para coordinar horarios, lugares y participantes.
- Falta de una herramienta centralizada que facilite la organización de encuentros deportivos.

Actualmente, estos problemas corresponden a una identificación inicial realizada por el equipo. Durante el desarrollo del proyecto será necesario validar su existencia y relevancia mediante encuestas, entrevistas, observaciones u otras fuentes de información obtenidas de potenciales usuarios.


---

## 3. Solución propuesta

FitMatch propone el desarrollo de una aplicación móvil orientada a facilitar la conexión entre personas interesadas en practicar deportes y participar en actividades deportivas.

La solución permitirá que los usuarios creen un perfil deportivo e indiquen información relevante como:

- Deporte de interés.
- Nivel deportivo.
- Ubicación o distancia.
- Disponibilidad.

A partir de esta información, FitMatch buscará facilitar la conexión entre usuarios con características compatibles.

La aplicación también permitirá:

- Crear actividades o eventos deportivos.
- Visualizar eventos disponibles.
- Unirse a actividades deportivas.
- Gestionar cupos de participantes.
- Confirmar asistencia.
- Facilitar la coordinación entre los participantes.

De esta forma, FitMatch busca centralizar en una misma plataforma la búsqueda de compañeros o rivales y la organización de actividades deportivas.

La lógica definitiva de compatibilidad entre usuarios, así como las funcionalidades incluidas en el MVP, serán definidas y priorizadas durante el desarrollo del proyecto.


---

## 4. Objetivo general

Desarrollar una aplicación móvil que facilite la conexión entre personas interesadas en practicar deportes, permitiéndoles encontrar compañeros o rivales compatibles y organizar actividades deportivas de manera simple, centralizada y accesible.


---

## 5. Objetivos específicos

- Implementar un sistema de registro e inicio de sesión para los usuarios de la aplicación.

- Permitir la creación y administración de un perfil deportivo con información relevante para la interacción dentro de FitMatch.

- Permitir que los usuarios seleccionen sus deportes de interés y definan su nivel deportivo.

- Facilitar la búsqueda o recomendación de otros usuarios considerando criterios como deporte, nivel y ubicación.

- Permitir la creación, visualización y gestión de actividades o eventos deportivos.

- Permitir que los usuarios puedan unirse a eventos y confirmar su participación.

- Incorporar mecanismos que faciliten la coordinación entre los participantes de una actividad deportiva.

- Evaluar el funcionamiento de las principales funcionalidades mediante pruebas funcionales y de usabilidad.

- Analizar los resultados obtenidos durante las pruebas para identificar oportunidades de mejora en la aplicación.


---

## 6. Alcance inicial del proyecto

El alcance inicial de FitMatch contempla el desarrollo de una aplicación móvil orientada a conectar personas interesadas en practicar deportes y facilitar la organización de actividades deportivas.

Para el MVP se consideran inicialmente las siguientes funcionalidades:

- Registro e inicio de sesión de usuarios.
- Creación y edición de perfil deportivo.
- Selección de deportes de interés.
- Definición de nivel deportivo.
- Búsqueda o recomendación de usuarios compatibles.
- Visualización de actividades o eventos deportivos.
- Creación de eventos deportivos.
- Inscripción o participación en eventos.
- Gestión de cupos.
- Confirmación de asistencia.

El alcance definitivo del MVP será revisado y priorizado por el equipo durante el desarrollo, considerando el tiempo disponible, la complejidad técnica y el valor que cada funcionalidad aporta a los usuarios.


---

## 7. Fuera del alcance inicial

Las siguientes funcionalidades no se consideran prioritarias para la primera versión del MVP y podrán evaluarse como mejoras futuras según el avance del proyecto:

- Sistema avanzado de reputación entre usuarios.
- Validación externa o certificada del nivel deportivo.
- Gestión de torneos o competencias complejas.
- Sistema de lista de espera para eventos.
- Reemplazo automático de participantes ante cancelaciones.
- Funcionalidades avanzadas de mapas y geolocalización.
- Notificaciones avanzadas o automatizadas.
- Integraciones con servicios externos no esenciales para el funcionamiento base de la aplicación.
- Otras funcionalidades que no resulten indispensables para validar el objetivo principal de FitMatch.

Estas funcionalidades podrán incorporarse posteriormente si el equipo dispone del tiempo, los recursos y la capacidad técnica necesarios.


---

## 8. Usuarios objetivo

FitMatch estará orientado principalmente a personas interesadas en practicar deportes de manera amateur y que busquen compañeros, rivales o actividades deportivas en las que participar.

De manera preliminar, el público objetivo considera usuarios que:

- Practiquen deportes de manera amateur o recreativa.
- Busquen compañeros o rivales para realizar actividades deportivas.
- Necesiten organizar o participar en encuentros deportivos.
- Utilicen dispositivos móviles como herramienta habitual de comunicación y coordinación.
- Estén dispuestos a compartir información básica relacionada con sus intereses deportivos.

El segmento definitivo de usuarios será validado durante el desarrollo del proyecto mediante encuestas, entrevistas y pruebas con potenciales usuarios.

La definición final deberá considerar aspectos como:

- Rango de edad.
- Deportes principales.
- Nivel deportivo.
- Ubicación.
- Frecuencia con la que practican deporte.
- Dificultades actuales para encontrar compañeros o rivales.
- Herramientas que utilizan actualmente para organizar actividades deportivas.


---

## 9. Tecnologías utilizadas

FitMatch está siendo desarrollado utilizando las siguientes tecnologías:

- **React Native 0.86.3:** framework utilizado para el desarrollo de la aplicación móvil.
- **React 19.2.3:** biblioteca utilizada para la construcción de interfaces de usuario.
- **Expo 57.0.22:** plataforma utilizada para facilitar el desarrollo, ejecución y pruebas de la aplicación.
- **Expo Router 57.0.21:** utilizado para gestionar la navegación entre las distintas pantallas de la aplicación.
- **TypeScript 6.0.3:** lenguaje utilizado para el desarrollo del proyecto con tipado estático.
- **Supabase JS 2.116.0:** utilizado para la conexión con los servicios de Supabase.
- **Supabase:** utilizado como servicio de backend, autenticación y base de datos.
- **Expo Location 57.0.17:** dependencia considerada para funcionalidades relacionadas con ubicación y geolocalización.
- **Git:** utilizado para el control de versiones del proyecto.
- **GitHub:** utilizado como repositorio remoto y herramienta de colaboración del equipo.
- **Node.js y npm:** utilizados para la gestión y ejecución de las dependencias del proyecto.

Las tecnologías y versiones podrán ser actualizadas durante el desarrollo en caso de que exista una necesidad técnica, dejando registro de los cambios realizados.


---

## 10. Presupuesto

El proyecto FitMatch se encuentra en etapa de desarrollo académico, por lo que actualmente no se ha definido un presupuesto monetario definitivo.

En la etapa inicial se priorizará el uso de herramientas y servicios que dispongan de planes gratuitos o recursos sin costo para desarrollo y pruebas.

Entre los posibles elementos que podrían generar costos en etapas posteriores se consideran:

- Servicios de backend y base de datos.
- Servicios de autenticación.
- APIs de mapas o geolocalización.
- Servicios de notificaciones.
- Almacenamiento de archivos.
- Publicación de la aplicación en tiendas digitales.
- Servicios de infraestructura o escalabilidad.
- Herramientas externas necesarias para futuras funcionalidades.

El presupuesto será actualizado a medida que se definan las tecnologías, servicios y requerimientos definitivos del proyecto.

**Presupuesto inicial estimado:** Pendiente de definir.


---

## 11. Riesgos principales

Durante el desarrollo de FitMatch se identifican preliminarmente los siguientes riesgos:

- **Alcance excesivo del proyecto:** intentar desarrollar demasiadas funcionalidades dentro del tiempo disponible podría afectar la calidad o impedir completar correctamente el MVP.

- **Retrasos en el desarrollo:** algunas funcionalidades pueden requerir más tiempo de implementación del estimado inicialmente.

- **Dificultades técnicas de integración:** pueden presentarse problemas al integrar React Native, Supabase, geolocalización, autenticación u otros servicios utilizados por la aplicación.

- **Complejidad de la lógica de Match:** definir e implementar correctamente los criterios de compatibilidad entre usuarios puede requerir ajustes durante el desarrollo.

- **Problemas relacionados con geolocalización:** la gestión de permisos, distancia, ubicación y privacidad puede generar dificultades técnicas o de seguridad.

- **Falta de evidencia suficiente del problema:** si no se recopilan datos mediante encuestas, entrevistas u otros mecanismos de validación, podría resultar difícil demostrar que la problemática identificada realmente afecta a los usuarios objetivo.

- **Baja participación en pruebas:** una cantidad reducida de usuarios durante las pruebas podría limitar la calidad de los resultados obtenidos.

- **Riesgos de seguridad y privacidad:** FitMatch trabajará con información personal, perfiles, ubicación y eventualmente conversaciones, por lo que será necesario controlar adecuadamente el acceso a la información.

- **Cambios en los requisitos:** durante el desarrollo pueden surgir nuevas necesidades o modificaciones en las funcionalidades definidas inicialmente.

- **Dependencia de servicios externos:** cambios, limitaciones o problemas de disponibilidad en servicios como Supabase u otras APIs podrían afectar algunas funcionalidades de la aplicación.


---

## 12. Indicadores de éxito

Para evaluar el cumplimiento de los objetivos del proyecto FitMatch, se consideran preliminarmente los siguientes indicadores:

- Porcentaje de usuarios que logra completar correctamente el proceso de registro.
- Porcentaje de usuarios que logra crear y configurar su perfil deportivo.
- Porcentaje de usuarios que logra seleccionar sus deportes y nivel deportivo.
- Porcentaje de usuarios que logra encontrar otros usuarios o actividades compatibles.
- Porcentaje de usuarios que logra crear correctamente un evento deportivo.
- Porcentaje de usuarios que logra unirse a un evento.
- Porcentaje de usuarios que logra confirmar su participación.
- Tiempo promedio requerido para crear un evento.
- Tiempo promedio requerido para encontrar un usuario o actividad deportiva.
- Cantidad de errores detectados durante las pruebas funcionales.
- Nivel de satisfacción de los usuarios participantes en las pruebas.
- Tiempo de respuesta de las principales funcionalidades de la aplicación.

Los valores objetivo para cada indicador serán definidos posteriormente, una vez que se diseñen y ejecuten las pruebas del sistema.


---

## 13. Estado del documento

**Versión:** 0.1

**Estado:** Borrador inicial.

**Última actualización:** 14-09-2026

Este documento corresponde a una primera versión de la ficha del proyecto FitMatch y será actualizado progresivamente a medida que avance el desarrollo, se validen los usuarios objetivo, se definan los requisitos y se obtengan resultados de pruebas y validaciones.
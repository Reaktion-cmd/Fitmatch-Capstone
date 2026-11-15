# Acta de Constitución del Proyecto - FitMatch

## 1. Propósito del documento

El presente documento formaliza el inicio del proyecto FitMatch y establece las bases generales para su desarrollo durante el período académico.

FitMatch corresponde a una aplicación móvil orientada a facilitar la conexión entre personas interesadas en practicar deportes de manera amateur, permitiendo encontrar compañeros o rivales y organizar actividades deportivas.

El proyecto será desarrollado mediante metodología Scrum, utilizando un enfoque iterativo e incremental.

---

## 2. Justificación del proyecto

El proyecto FitMatch surge a partir de la identificación de dificultades asociadas a la organización de actividades deportivas amateur.

Entre las problemáticas detectadas preliminarmente se encuentran la dificultad para encontrar compañeros o rivales con características compatibles, la coordinación de horarios y participantes, y las cancelaciones de último momento.

Actualmente, estas problemáticas se encuentran en proceso de validación mediante una encuesta dirigida a potenciales usuarios.

El desarrollo de FitMatch busca centralizar en una aplicación móvil distintas herramientas que permitan facilitar la búsqueda de personas interesadas en practicar deportes y la organización de actividades deportivas.

---

## 3. Problema identificado

Las personas interesadas en practicar deportes de manera amateur pueden experimentar dificultades al momento de encontrar compañeros, rivales o actividades deportivas disponibles.

Entre los principales problemas identificados se encuentran:

- Dificultad para encontrar personas que practiquen el mismo deporte.
- Dificultad para encontrar personas con un nivel deportivo similar.
- Dificultad para encontrar rivales o equipos.
- Problemas para coordinar horarios y participantes.
- Cancelaciones de último momento.
- Falta de información centralizada sobre actividades deportivas disponibles.

La existencia y relevancia de estas problemáticas serán evaluadas mediante la información obtenida de potenciales usuarios.

---

## 4. Objetivos del proyecto

### Objetivo general

Desarrollar una aplicación móvil que facilite la conexión entre personas interesadas en practicar deportes, permitiéndoles encontrar compañeros o rivales compatibles y organizar actividades deportivas de manera simple y centralizada.

### Objetivos específicos

- Implementar mecanismos de registro e inicio de sesión.
- Permitir la creación y administración de perfiles deportivos.
- Permitir que los usuarios indiquen sus deportes y nivel deportivo.
- Facilitar la búsqueda o recomendación de usuarios compatibles.
- Permitir la creación y visualización de actividades deportivas.
- Permitir que los usuarios puedan participar en eventos.
- Incorporar mecanismos de confirmación de participación.
- Realizar pruebas funcionales y de usabilidad sobre las principales funcionalidades.

---

## 5. Alcance inicial

El proyecto considera el desarrollo de un MVP de FitMatch que incluya inicialmente:

- Registro e inicio de sesión.
- Creación y edición de perfil deportivo.
- Selección de deportes.
- Definición de nivel deportivo.
- Búsqueda o recomendación de usuarios.
- Creación de eventos deportivos.
- Visualización de eventos.
- Participación en eventos.
- Gestión de cupos.
- Confirmación de asistencia.

El alcance podrá ser ajustado durante los Sprints según la prioridad de las funcionalidades, el tiempo disponible y la complejidad técnica de cada requerimiento.

Las funcionalidades complementarias que no sean indispensables para validar la propuesta podrán ser consideradas para versiones posteriores.

---

## 6. Restricciones

El proyecto estará sujeto a las siguientes restricciones:

- Tiempo limitado al período académico disponible para el desarrollo.
- Equipo de trabajo compuesto por cuatro estudiantes.
- Uso prioritario de herramientas y servicios gratuitos o con planes de desarrollo sin costo.
- Dependencia de servicios externos utilizados por la aplicación.
- Conocimientos técnicos y experiencia del equipo.
- Disponibilidad de potenciales usuarios para participar en encuestas y pruebas.
- El MVP deberá priorizar las funcionalidades esenciales por sobre funcionalidades complementarias.

---

## 7. Supuestos

Para la planificación inicial del proyecto se consideran los siguientes supuestos:

- El equipo tendrá acceso a los equipos y herramientas necesarias para desarrollar el proyecto.
- Los integrantes podrán participar regularmente en las actividades del proyecto.
- Las tecnologías seleccionadas serán suficientes para desarrollar el MVP.
- Será posible obtener participación de potenciales usuarios para validar el problema y realizar pruebas.
- Los servicios externos utilizados permanecerán disponibles durante el período de desarrollo.
- Los requerimientos podrán evolucionar a medida que se obtenga nueva información de los usuarios.

---

## 8. Riesgos principales

Se identifican inicialmente los siguientes riesgos:

- Alcance demasiado amplio para el tiempo disponible.
- Retrasos en el desarrollo de funcionalidades.
- Dificultades técnicas durante la integración de tecnologías.
- Complejidad en la implementación de la lógica de compatibilidad entre usuarios.
- Problemas asociados a geolocalización y permisos.
- Falta de participación suficiente en encuestas o pruebas.
- Cambios de requisitos durante el desarrollo.
- Problemas relacionados con seguridad y privacidad de los datos.
- Dependencia de servicios externos como Supabase u otras APIs.

Los riesgos serán revisados durante el desarrollo y se tomarán medidas para reducir su impacto cuando sea necesario.

---

## 9. Stakeholders principales

Los principales interesados identificados inicialmente son:

- **Equipo de desarrollo:** responsable del análisis, planificación, desarrollo, pruebas y documentación de FitMatch.
- **Docente de la asignatura:** realiza seguimiento académico, entrega orientaciones y evalúa el avance del proyecto.
- **Usuarios potenciales:** personas interesadas en practicar deportes de manera amateur y que pueden participar en procesos de validación y pruebas.

El registro detallado de stakeholders será desarrollado en un documento independiente.

---

## 10. Criterios de éxito

El proyecto se considerará exitoso si logra:

- Implementar las principales funcionalidades definidas para el MVP.
- Permitir que un usuario pueda registrarse y configurar su perfil.
- Permitir que un usuario pueda encontrar personas o actividades deportivas.
- Permitir la creación y participación en eventos deportivos.
- Obtener evidencia que permita validar o ajustar la problemática identificada.
- Ejecutar pruebas funcionales y de usabilidad.
- Identificar y corregir errores críticos antes de la entrega final.
- Mantener documentación actualizada y trazabilidad sobre la evolución del proyecto.

Los indicadores específicos y sus valores objetivo serán definidos a medida que avance el proceso de pruebas y validación.

---

## 11. Control de cambios de alcance

Durante el desarrollo se identificaron diferencias entre el alcance comprometido inicialmente (sección 5) y el MVP efectivamente entregado (v1.0.0). Esta sección documenta y justifica cada cambio para mantener la trazabilidad del proyecto. Los cambios se decideron en función de la validación con usuarios, la complejidad técnica y las restricciones de tiempo del acta.

| Funcionalidad | Estado inicial comprometido | Estado en el MVP v1.0.0 | Justificación del cambio |
|---|---|---|---|
| Chat directo (RF-19) | Etapas posteriores (RF-19 en documento de requisitos v0.1) | **Incorporado al MVP** (chat individual 1:1 con Supabase Realtime) | El match sin canal de comunicación no cierra el circuito de valor del producto: tras el match mutuo el usuario necesita coordinar la actividad. Supabase Realtime permitió implementarlo sin infraestructura adicional. |
| Calificaciones y reputación | No estaba en el alcance inicial | **Agregado al MVP** (estrellas 1–5 + reseña, por persona y por evento) | La validación con usuarios mostró la necesidad de generar confianza previa antes de asistir a una actividad con desconocidos. |
| Radar de cercanía | No estaba en el alcance inicial | **Agregado al MVP** (distancia real vía RPC, sin exponer coordenadas) | Mejora la experiencia del match con información de distancia ya disponible; respeta el RNF-07 de privacidad. |
| Modo claro/oscuro | No estaba en el alcance inicial | **Agregado al MVP** | Requisito no funcional de usabilidad surgido durante la fase 2. |
| Confirmación de asistencia (RF-16) | Dentro del alcance inicial | **Postergado post-MVP** | La gestión de cupos cubre el flujo esencial de participación; la confirmación requiere notificaciones (RF-21) para resultar útil. |
| Cancelación de participación (RF-17) | Dentro del alcance inicial | **Postergado post-MVP** | Mismo criterio que RF-16: sin notificaciones, la cancelación no informa a los afectados. |
| Chat grupal (RF-20), notificaciones (RF-21), lista de espera (RF-22), reemplazo de participantes (RF-23) | Etapas posteriores | **Backlog post-entrega** | Valor incremental real, pero fuera del alcance académico por las restricciones de tiempo del acta. |

**Alcance comprometido final (ambos documentos coinciden):** el MVP v1.0.0 entregado corresponde a — Autenticación (registro, ingreso, cierre de sesión), perfil deportivo persistente con foto, ubicación GPS/manual y radio de búsqueda, Match 1v1 con filtros de edad y radio más radar de cercanía, eventos con creación/búsqueda/inscripción y **cupos garantizados a nivel de base de datos**, chat individual en tiempo real y calificaciones con reseñas.

**Integridad de inscripciones:** la gestión de cupos comprometida en el alcance inicial se implementó con una garantía a nivel del motor de datos (trigger que impide que las inscripciones simultáneas superen los cupos), detallada en el RNF-21 del documento de Requisitos No Funcionales v1.0.

---

## 12. Estado del acta

**Versión:** 1.0

**Estado:** Actualizado con el control de cambios de alcance tras la revisión del docente.

**Fecha de elaboración:** 14-09-2026

**Fecha de última actualización:** 15-11-2026

El presente documento podrá ser actualizado durante el proyecto cuando existan cambios relevantes en el alcance, restricciones, riesgos o condiciones generales de FitMatch.

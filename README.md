# FitMatch

FitMatch es una aplicación móvil desarrollada como proyecto Capstone, orientada a conectar personas interesadas en realizar actividades deportivas.

La aplicación permite a los usuarios registrarse, seleccionar sus deportes de interés, visualizar eventos, interactuar con otros usuarios y administrar su perfil.

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Selección de deportes de interés.
- Visualización de eventos deportivos.
- Perfil de usuario.
- Sistema de chat.
- Navegación mediante pestañas.
- Onboarding inicial.

## Tecnologías utilizadas

- React Native
- Expo
- TypeScript
- Expo Router
- Supabase
- Node.js / npm

## Estructura del proyecto

```text
FitMatch/
├── app/
│   ├── (tabs)/
│   │   ├── chat.tsx
│   │   ├── eventos.tsx
│   │   ├── index.tsx
│   │   └── perfil.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── deportes.tsx
│   ├── login.tsx
│   ├── onboarding.tsx
│   ├── registro.tsx
│   ├── index.tsx
│   └── _layout.tsx
│
├── assets/
├── app.json
├── index.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Requisitos

Para ejecutar el proyecto se necesita tener instalado:

- Node.js
- npm
- Expo

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Reaktion-cmd/Fitmatch-Capstone.git
```

Ingresar al proyecto:

```bash
cd Fitmatch-Capstone
```

Instalar las dependencias:

```bash
npm install
```

Ejecutar la aplicación:

```bash
npm start
```

También se puede iniciar Expo mediante:

```bash
npx expo start
```

## Proyecto

Proyecto desarrollado como parte de la asignatura Capstone.

### FitMatch

Aplicación orientada a facilitar la interacción entre personas interesadas en practicar deportes y participar en actividades deportivas.
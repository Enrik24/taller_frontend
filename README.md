# Plataforma Inteligente de Atención de Emergencias Vehiculares (Frontend)

Bienvenido al frontend de la plataforma de atención de emergencias. Esta aplicación Angular (v19) actúa como la interfaz de usuario para que Clientes, Talleres y Administradores interactúen con el sistema, utilicen la IA y gestionen pagos.

## Requisitos previos

- Node.js (≥ 18.x)
- Angular CLI (v19)
- NPM o Yarn

## Instalación

1. Clona el repositorio e ingresa al directorio `taller_frontend`.
2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
   *(Nota: Si usaste --legacy-peer-deps por incompatibilidades de librerías como ngx-charts en Angular 19, usa `npm install --legacy-peer-deps`)*
3. Ejecuta el servidor de desarrollo:
   \`\`\`bash
   npm start
   # o bien
   ng serve --proxy-config proxy.conf.json
   \`\`\`

## Variables de entorno

El proyecto cuenta con la carpeta `src/environments/`. Aquí deberás configurar tu URL base del backend y tus keys públicas para Stripe/Cloudinary si corresponde:

### `environment.ts` (Desarrollo)
\`\`\`typescript
export const environment = {
  production: false,
  apiUrl: '/api', // O apunta a http://localhost:8000/api si no usas proxy
  stripeKey: 'pk_test_...',
};
\`\`\`

> *Nota: Al usar el `proxy.conf.json`, todas las peticiones a `/api` son redirigidas localmente.*

## Estructura de carpetas principal

\`\`\`text
taller_frontend/
├── proxy.conf.json         # Configuración del proxy hacia FastAPI
├── src/
│   ├── app/
│   │   ├── core/           # Servicios (Auth, Toast, etc), Interceptors, Guards
│   │   ├── shared/         # Componentes genéricos compartidos (Botones, Carga, etc.)
│   │   ├── layout/         # Componentes estructurales (TopBar, SideBar)
│   │   ├── features/       # Módulos por dominio de negocio (Standalone Components)
│   │   │   ├── auth/       # Login/Register
│   │   │   ├── dashboard/  # Dashboard y Stats
│   │   │   ├── emergencias/# Reportar y mapa de siniestro
│   │   │   ├── perfil/     # Mi cuenta
│   │   │   ├── ...
│   │   ├── app.config.ts   # Configuración y Providers de Angular 19
│   │   ├── app.routes.ts   # Definición de rutas y lazy loading
│   │   └── app.component.ts# Root Component
│   ├── assets/             # Imágenes y SVGs
│   ├── styles.scss         # Estilos globales y paleta M3
│   ├── theme.scss          # Material 3 custom config
│   └── index.html
└── package.json
\`\`\`

## Scripts

- `npm start`: Inicializa el entorno de desarrollo usando el proxy de desarrollo (configurarlo en angular.json / package.json).
- `npm run build`: Compila la app para producción. Se colocarán los archivos listos para servir en la carpeta `dist/`.

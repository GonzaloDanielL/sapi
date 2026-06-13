# Sapi CLI 🚀🛠️

**Sapi CLI** es una herramienta de interfaz de línea de comandos modular y automatizada diseñada para el andamiaje (*scaffolding*) de proyectos web bajo una arquitectura **CSS-First** y **Tailwind CSS v4**. La principal motivación detrás de este proyecto es erradicar las tareas repetitivas de configuración inicial (*boilerplate*), permitiendo estructurar en segundos entornos de trabajo limpios, combinaciones tipográficas optimizadas y paletas de colores comerciales inyectadas de forma nativa.

## 🛠️ Características Clave

Este ecosistema ha sido diseñado centrándose en la modularidad, la automatización fluida y la experiencia del desarrollador (DX):

- **Scaffolding de Arquitectura Modular:** Permite estructurar proyectos seleccionando dinámicamente entre niveles de complejidad (Mínima, Estándar o Avanzada), adaptando la ubicación de los archivos de forma nativa según el framework elegido (Next o Astro).
- **Inyección Automática de Tokens (Tailwind v4):** Configura fuentes desde Google Fonts y paletas de colores comerciales inyectando las directivas directamente en el bloque `@theme` del archivo CSS global, sin necesidad de configuraciones manuales complejas.
- **Sandbox Interactivo de Visualización:** Genera automáticamente una vista minimalista de prueba (`Layout` e `index`) completamente responsivas para que el desarrollador pueda interactuar con sus fuentes, validar contrastes y copiar códigos hexadecimales al portapapeles con un solo clic.

## 💻 Tecnologías

El proyecto ha sido orquestado apoyándose en estas herramientas:

- **TypeScript & Node.js** - Entorno principal de ejecución.
- **Astro & Next.js (App Router)** - Frameworks populares del mercado soportados para la generación de la arquitectura.
- **Tailwind CSS v4** - Motor de diseño rápido basado en variables y directivas CSS nativas (`@theme`).
- **Clack (`@clack/prompts`)** - Librería encargada de renderizar una interfaz interactiva de usuario en la terminal elegante y guiada.

## 🚀 Ejecución y Uso

Al ser una herramienta CLI moderna, no necesitas instalarla de forma permanente en tu sistema. Puedes ejecutar el asistente interactivo directamente desde la nube utilizando tu gestor de paquetes preferido:

```bash
# Ejecución rápida con PNPM (Recomendado)
pnpm dlx @chalo_l/sapi

# Ejecución rápida con NPM (Node.js)
npx @chalo_l/sapi

# Ejecución rápida con Bun
bunx @chalo_l/sapi
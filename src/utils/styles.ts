import fs from 'fs-extra';
import path from 'path';

/**
 * Inyecta las fuentes externas y las variables de diseño del tema en la hoja de estilos global.
 * * Sincroniza de forma quirúrgica los tokens de marca dentro del bloque `@theme` de Tailwind v4,
 * asegurando un orden jerárquico estricto compatible con las especificaciones de PostCSS y Vite.
 * Además, habilita el soporte nativo para la variante de modo oscuro basado en clases.
 * * @param projectPath Ruta absoluta del directorio raíz del proyecto destino.
 * @param framework Entorno de desarrollo o framework seleccionado ('next' o 'astro').
 * @param projectSlug Prefijo único (slug) asignado para el alcance de las variables CSS.
 * @param colors Colección opcional con las llaves semánticas de color y valores hexadecimales.
 * @param fonts Colección opcional con los metadatos de fuentes, nombres de familias y enlaces de importación.
 * @returns Una promesa que se resuelve una vez persistidos los cambios en el archivo CSS correspondiente.
 */
export async function syncTokensToCSS(
    projectPath: string,
    framework: string,
    projectSlug: string,
    colors: Array<{ key: string; hex: string }> = [],
    fonts: Array<{ name: string; link: string; variable: string }> = []
): Promise<void> {

    let cssFontsImports = '';
    let themeVariables = '';

    // 1. Inyección de variables de color con prefijo único del proyecto
    for (const color of colors) {
        themeVariables += `  --color-${projectSlug}-${color.key}: ${color.hex};\n`;
    }

    // 2. Inyección unificada de directivas de importación y alias tipográficos para el bloque de diseño
    if (fonts && Array.isArray(fonts)) {
        for (const font of fonts) {
            if (font.link) {
                cssFontsImports += `@import url('${font.link}');\n`;
            }
            themeVariables += `  --font-${font.variable}: '${font.name}', sans-serif;\n`;
        }
    }

    // Estructuración de la sintaxis nativa requerida por Tailwind v4 y variantes personalizadas
    let tailwindBase = `@import "tailwindcss";\n\n`;
    const themeBlock = themeVariables ? `@theme {\n${themeVariables}}\n\n` : '';
    const darkModeVariant = `/* Habilitar dark mode por clase en Tailwind v4 */\n@custom-variant dark (&:where(.dark, .dark *));\n\n`;

    // Resolución de la ruta física del archivo CSS global de acuerdo a las convenciones de cada framework
    let cssFilePath = framework === 'astro'
        ? path.join(projectPath, 'src', 'styles', 'global.css')
        : path.join(projectPath, 'app', 'globals.css');

    await fs.ensureFile(cssFilePath);
    const existingContent = await fs.readFile(cssFilePath, 'utf-8');

    // Expresiones regulares destinadas a purgar selectivamente contenidos previos y evitar duplicados
    const baseTailwindRegex = /@import\s+"tailwindcss";\s*/g;
    const importRegex = /@import\s+url\([^)]+\);\s*/g;
    const themeRegex = /@theme\s*{[\s\S]*?}\s*/g;
    const customDarkRegex = /\/\* Habilitar dark mode[\s\S]*?;\s*/g;

    let cleanedContent = existingContent
        .replace(baseTailwindRegex, '')
        .replace(importRegex, '')
        .replace(themeRegex, '')
        .replace(customDarkRegex, '');

    // Ensamblado definitivo respetando la precedencia estricta de declaraciones en CSS estándar
    const finalContent = cssFontsImports + (cssFontsImports ? '\n' : '') + tailwindBase + themeBlock + darkModeVariant + cleanedContent.trim() + '\n';

    await fs.writeFile(cssFilePath, finalContent);
}
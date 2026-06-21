import { intro, outro, text, spinner, note, select, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs-extra';
import { runCommand } from '../utils/terminal';
import { createFolderStructure } from '../utils/files';
import { generateAstroTemplate } from '../utils/astroTemplate';
import { generateNextTemplate } from '../utils/nextTemplate';
import { createEnvFile } from '../utils/env';
import { syncTokensToCSS } from '../utils/styles';

/**
 * Mapa de configuración de diseño preestablecido por sectores comerciales.
 * Contiene paletas de colores armonizadas y tipografías sugeridas extraídas del mercado.
 */
const SECTOR_PRESETS: Record<string, {
    colors: Array<{ key: string; hex: string }>;
    fonts: Array<{ name: string; link: string; variable: string }>
}> = {
    medicina: {
        colors: [
            { key: 'teal-light', hex: '#00BFA2' },
            { key: 'teal-dark', hex: '#176B87' },
            { key: 'black', hex: '#212121' },
            { key: 'black-light', hex: '#373A40' },
            { key: 'black-lighter', hex: '#131517' },
            { key: 'white-light', hex: '#FCFCFC' },
            { key: 'white-teal', hex: '#dbdde7' }
        ],
        fonts: [
            { name: 'Roboto', link: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap', variable: 'roboto' },
            { name: 'Lato', link: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap', variable: 'lato' }
        ]
    },
    educacion: {
        colors: [
            { key: 'blue-light', hex: '#2185D5' },
            { key: 'blue-dark', hex: '#03346E' },
            { key: 'black', hex: '#181823' },
            { key: 'black-light', hex: '#323643' },
            { key: 'black-lighter', hex: '#1B262C' },
            { key: 'white-light', hex: '#FAFAFA' },
            { key: 'white-blue', hex: '#F2F7FF' }
        ],
        fonts: [
            { name: 'Montserrat', link: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap', variable: 'roboto' },
            { name: 'Open Sans', link: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap', variable: 'lato' }
        ]
    },
    comercio: {
        colors: [
            { key: 'orange-light', hex: '#FF6D1F' },
            { key: 'orange-dark', hex: '#461111' },
            { key: 'black', hex: '#1A1C20' },
            { key: 'black-light', hex: '#222831' },
            { key: 'black-lighter', hex: '#222831' },
            { key: 'white-light', hex: '#F7F7F7' },
            { key: 'white-orange', hex: '#EFEEEA' }
        ],
        fonts: [
            { name: 'Montserrat', link: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap', variable: 'roboto' },
            { name: 'Google Sans', link: 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap', variable: 'lato' }
        ]
    },
    moda: {
        colors: [
            { key: 'coral-light', hex: '#d48059' },
            { key: 'coral-dark', hex: '#4A4947' },
            { key: 'black', hex: '#222831' },
            { key: 'black-light', hex: '#32363d' },
            { key: 'black-lighter', hex: '#28303b' },
            { key: 'white-light', hex: '#F7F7F7' },
            { key: 'white-coral', hex: '#FAF7F0' }
        ],
        fonts: [
            { name: 'Petrona', link: 'https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,100..900;1,100..900&display=swap', variable: 'roboto' },
            { name: 'Karla', link: 'https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap', variable: 'lato' }
        ]
    },
    tecnologia: {
        colors: [
            { key: 'blue-light', hex: '#1B56FD' },
            { key: 'blue-dark', hex: '#0F2854' },
            { key: 'black', hex: '#060608' },
            { key: 'black-light', hex: '#0B192C' },
            { key: 'black-lighter', hex: '#171720' },
            { key: 'white-light', hex: '#F7F7F7' },
            { key: 'white-blue', hex: '#ECF9FF' }
        ],
        fonts: [
            { name: 'Orbitron', link: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap', variable: 'roboto' },
            { name: 'Exo 2', link: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap', variable: 'lato' }
        ]
    },
    gastronomia: {
        colors: [
            { key: 'red-light', hex: '#E9290F' },
            { key: 'red-dark', hex: '#33030D' },
            { key: 'black', hex: '#171717' },
            { key: 'black-light', hex: '#252525' },
            { key: 'black-lighter', hex: '#191919' },
            { key: 'white-light', hex: '#F8F8F8' },
            { key: 'white-red', hex: '#E8E8E8' }
        ],
        fonts: [
            { name: 'Ysabeau Infant', link: 'https://fonts.googleapis.com/css2?family=Ysabeau+Infant:ital,wght@0,1..1000;1,1..1000&display=swap', variable: 'roboto' },
            { name: 'Raleway', link: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap', variable: 'lato' }
        ]
    },
    limpio: { colors: [], fonts: [] }
};

/**
 * Procesa el nombre del proyecto para extraer un identificador corto (slug)
 * que servirá como prefijo para las variables CSS.
 * * Si el nombre contiene guiones, extrae la letra inicial de cada palabra.
 * * @param name Nombre original del proyecto.
 * @returns Cadena de texto en minúsculas limpia de caracteres especiales.
 */
function getProjectSlug(name: string): string {
    const clean = name.trim().replace(/[^a-zA-Z0-9-]/g, '');
    if (clean.includes('-')) {
        return clean.split('-').map(word => word[0]).join('').toLowerCase();
    }
    return clean.toLowerCase();
}

/**
 * Maneja el flujo interactivo de comandos en la CLI para la inicialización
 * y el andamiaje (scaffolding) de un nuevo espacio de trabajo.
 * * Ejecuta de manera secuencial: la captura de requerimientos del desarrollador,
 * la creación de la estructura física del proyecto base, la inyección del sistema de diseño
 * CSS-First con Tailwind v4 y la instalación automatizada de dependencias.
 */
export async function handleInit(): Promise<void> {
    console.log("");
    intro(`${pc.bgCyan(pc.black(' @chalo/sapi '))}`);

    note(
        `${pc.cyan('¡Importante!')} El nombre que le des a tu proyecto se procesará para crear las variables de tus colores.\nSi usas nombres compuestos con guiones (ej: ${pc.yellow('solcafe-web-app')}), se usarán las iniciales (${pc.green('swa')}) para mantener tu CSS limpio y legible.`,
        'Configuración de Variables de Diseño'
    );

    const projectName = await text({
        message: '¿Cuál es el nombre de tu nuevo proyecto?',
        placeholder: 'MiProyecto',
        validate(value: string | undefined) {
            if (!value || value.trim().length === 0) return `¡El nombre es obligatorio!`;
        },
    });

    if (isCancel(projectName)) {
        cancel('Operación cancelada');
        process.exit(0);
    }

    const sanitizedName = (projectName as string)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const projectSlug = getProjectSlug(sanitizedName);

    const framework = await select({
        message: '¿En qué framework quieres realizar tu proyecto?',
        options: [
            { value: 'next', label: 'Next.js', hint: 'Apps complejas' },
            { value: 'astro', label: 'Astro', hint: 'Velocidad y contenido' },
        ],
    });

    if (isCancel(framework)) {
        cancel('Operación cancelada');
        process.exit(0);
    }

    const structure = await select({
        message: '¿Qué estructura de carpetas prefieres?',
        options: [
            { value: 'standard', label: 'Estándar', hint: 'Uso general (Landing / Sitios Corporativos / Blogs)' },
            { value: 'advanced', label: 'Avanzado', hint: 'Arquitectura escalable (E-commerce / Web Apps / SaaS)' },
            { value: 'minimal', label: 'Minimalista', hint: 'Proyectos ultra rápidos y limpios' },
        ],
    });

    if (isCancel(structure)) {
        cancel('Operación cancelada');
        process.exit(0);
    }

    const sector = await select({
        message: '¿Para qué sector comercial está enfocada la web?',
        options: [
            { value: 'tecnologia', label: '💻 Tecnología', hint: 'Orbitron & Exo 2, Azul/Oscuro' },
            { value: 'medicina', label: '🩺 Medicina & Salud', hint: 'Roboto & Lato, Teal/Clínico' },
            { value: 'educacion', label: '📚 Educación', hint: 'Montserrat & Open Sans, Azul/Blanco' },
            { value: 'comercio', label: '🛒 Comercio & Retail', hint: 'Montserrat & Google Sans, Naranja/Rojo' },
            { value: 'moda', label: '✨ Moda & Estilo', hint: 'Petrona & Karla, Coral/Neutros' },
            { value: 'gastronomia', label: '🍳 Gastronomía & Restaurantes', hint: 'Ysabeau Infant & Raleway, Rojo/Cálido' },
            { value: 'limpio', label: '🧼 Lienzo Limpio', hint: 'Sin estilos ni fuentes por defecto' },
        ],
    });

    if (isCancel(sector)) {
        cancel('Operación cancelada');
        process.exit(0);
    }

    const s = spinner();
    const projectPath = path.join(process.cwd(), sanitizedName);

    try {
        let commandInst = 'pnpm';
        let argsInst: string[] = [];

        if (framework === 'astro') {
            argsInst = ['create', 'astro@latest', sanitizedName, '--', '--no-install', '--no-git', '--yes'];
        } else if (framework === 'next') {
            argsInst = ['create', 'next-app', sanitizedName, '--', '--typescript', '--tailwind', '--eslint', '--app'];
        }

        s.start(pc.cyan('Preparando el terreno...'));
        s.stop(pc.green('Configuración recibida.'));
        console.log("");

        await runCommand(commandInst, argsInst, process.cwd());

        console.log("");
        s.start(pc.cyan('configurando entorno de diseño...'));

        await createFolderStructure(projectPath, structure as string, framework as string);
        await createEnvFile(projectPath);

        if (framework === 'astro') {
            await runCommand('pnpm', ['add', '@tailwindcss/vite', 'tailwindcss'], projectPath);

            const astroConfigPath = path.join(projectPath, 'astro.config.mjs');
            if (await fs.pathExists(astroConfigPath)) {
                const astroConfigContent = `// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});`;
                await fs.writeFile(astroConfigPath, astroConfigContent);
            }
        }

        s.message(pc.cyan('Descargando paquetes del sistema (node_modules)...'));
        await runCommand('pnpm', ['install'], projectPath);

        const selectedPreset = SECTOR_PRESETS[sector as string] || SECTOR_PRESETS.limpio;

        // Sincronización jerárquica del archivo de estilos globales CSS
        await syncTokensToCSS(projectPath, framework as string, projectSlug, selectedPreset.colors, selectedPreset.fonts);

        // Orquestación y renderizado de plantillas Sandbox interactivas de muestra
        if (sector !== 'limpio') {
            if (framework === 'astro') {
                await generateAstroTemplate(projectPath, sanitizedName, projectSlug, sector as string, selectedPreset.colors, selectedPreset.fonts);
            } else if (framework === 'next') {
                await generateNextTemplate(projectPath, sanitizedName, projectSlug, sector as string, selectedPreset.colors, selectedPreset.fonts);
            }
        }

        if (framework === 'next') {
            const oldAppPath = path.join(projectPath, 'app');
            const newAppPath = path.join(projectPath, 'src', 'app');

            if (await fs.pathExists(oldAppPath)) {
                // fs.move de 'fs-extra' mueve la carpeta completa con todo su contenido interno de un solo golpe
                await fs.move(oldAppPath, newAppPath, { overwrite: true });
            }
        }

        s.stop(pc.green('Carpetas creadas con éxito y dependencias instaladas.'));

        note(
            `Carpeta: ${pc.cyan(sanitizedName)}\nVariables CSS: ${pc.green(`--color-${projectSlug}-*`)}\nServidor dev: ${pc.yellow(`cd ${sanitizedName} && pnpm run dev`)}`,
            '¡Todo listo para empezar!'
        );

    } catch (err) {
        s.stop(pc.red('Hubo un problema al configurar el proyecto.'));
        console.error(err);
        process.exit(1);
    }

    outro(`Gracias por usar ${pc.cyan('Sapi')}. ¡A programar!`);
}
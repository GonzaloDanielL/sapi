import fs from 'fs-extra';
import path from 'path';

/**
 * Crea la estructura de directorios inicial adaptándose nativamente a las rutas y arquitecturas de cada framework.
 * * Gestiona de forma inteligente el andamiaje (scaffolding) de los presets de carpetas compartidas, 
 * previniendo la duplicación de directorios en Next.js al omitir rutas absorbidas por el App Router
 * y consolidando la lógica directamente en la raíz del espacio de trabajo.
 * * @param projectPath Ruta absoluta del directorio raíz donde se inicializa el proyecto.
 * @param structure Nivel de complejidad de la arquitectura elegida ('standard', 'advanced' o 'minimal').
 * @param framework Entorno de desarrollo o framework seleccionado ('next' o 'astro').
 * @returns Una promesa que se resuelve una vez creados con éxito los directorios físicos en el disco.
 */
export async function createFolderStructure(projectPath: string, structure: string, framework: string): Promise<void> {
    // Define el directorio base operativo según los estándares de arquitectura de cada framework
    const baseDir = path.join(projectPath, 'src');

    // Mapeo estructurado de carpetas comerciales y modulares por nivel de complejidad
    const structures: Record<string, string[]> = {
        standard: ['assets', 'components', 'layouts', 'lib', 'styles', 'types'],
        advanced: ['assets', 'components', 'context', 'hooks', 'layouts', 'lib', 'services', 'styles', 'types', 'utils'],
        minimal: ['assets', 'components', 'styles']
    };

    // Fallback de retrocompatibilidad para asegurar la correcta migración de términos arquitectónicos
    const chosenStructure = structure === 'atomic' ? 'advanced' : structure;
    const foldersToCreate = structures[chosenStructure] || structures.minimal;

    for (const folder of foldersToCreate) {
        // Exclusión quirúrgica de directorios en Next.js para evitar colisiones con el enrutador físico nativo
        if (framework === 'next' && (folder === 'styles' || folder === 'layouts')) {
            continue;
        }
        await fs.ensureDir(path.join(baseDir, folder));
    }
}
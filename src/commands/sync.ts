import { spinner } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs-extra';
import { syncTokensToCSS } from '../utils/styles';

/**
 * Maneja la ejecución del comando de sincronización para actualizar los tokens de diseño.
 * * Lee el archivo de persistencia `sapi.config.json` en el directorio de trabajo actual
 * y reinyecta de forma jerárquica las paletas de colores y fuentes correspondientes
 * directamente en la hoja de estilos CSS global del framework seleccionado.
 * * @returns Una promesa que se resuelve una vez completada la sincronización.
 */
export async function handleSync(): Promise<void> {
    const s = spinner();
    s.start(pc.cyan('Sincronizando tokens con el CSS de Tailwind v4...'));

    const projectPath = process.cwd();
    const configPath = path.join(projectPath, 'sapi.config.json');

    if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        
        // Ejecuta la sincronización directa del mapa de tokens hacia la hoja de estilos global
        await syncTokensToCSS(
            projectPath, 
            config.framework, 
            config.projectSlug,
            config.colors,
            config.fonts
        );
        
        s.stop(pc.green('¡Tokens sincronizados en @theme con éxito!'));
    } else {
        s.stop(pc.red('Error: No se encontró sapi.config.json en esta carpeta.'));
    }
}
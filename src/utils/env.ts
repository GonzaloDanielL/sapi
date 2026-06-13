import fs from 'fs-extra';
import path from 'path';

/**
 * Genera de forma automatizada los archivos confidenciales de entorno `.env` y `.env.example`
 * en la raíz del directorio del espacio de trabajo inicializado.
 * * @param projectPath Ruta absoluta del directorio raíz del proyecto destino.
 * @returns Una promesa que se resuelve una vez persistidos los archivos en el disco.
 */
export async function createEnvFile(projectPath: string): Promise<void> {
    const envPath = path.join(projectPath, '.env');
    const envExamplePath = path.join(projectPath, '.env.example');
    const content = `# Sapi Environment Variables\nFIGMA_ACCESS_TOKEN=\n`;

    if (!(await fs.pathExists(envPath))) {
        await fs.writeFile(envPath, content);
        await fs.writeFile(envExamplePath, content);
    }
}

/**
 * Realiza una lectura analítica síncrona/asíncrona sobre la hoja local `.env` de un proyecto
 * para extraer el valor string asignado a una clave específica de autenticación.
 * * El algoritmo descarta comentarios del archivo y limpia quirúrgicamente espacios en blanco
 * o comillas protectoras accidentales para evitar fallos de conexión con SDKs o APIs externas.
 * * @param projectPath Ruta absoluta del directorio del proyecto en evaluación.
 * @param key Nombre identificador único de la variable de entorno que se desea extraer.
 * @returns El valor plano de la variable de entorno si es hallada, o `null` en caso de no existir.
 */
export async function getEnvVariable(projectPath: string, key: string): Promise<string | null> {
    const envPath = path.join(projectPath, '.env');
    if (!(await fs.pathExists(envPath))) return null;

    const content = await fs.readFile(envPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        if (line.trim().startsWith('#') || !line.includes('=')) continue;

        const firstEqualIndex = line.indexOf('=');
        const currentKey = line.substring(0, firstEqualIndex).trim();
        let value = line.substring(firstEqualIndex + 1).trim();

        if (currentKey === key) {
            // Elimina delimitadores de texto (comillas dobles o simples) remanentes en el valor
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1).trim();
            }
            return value;
        }
    }
    return null;
}
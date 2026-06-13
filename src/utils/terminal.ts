import { spawn } from 'child_process';

/**
 * Ejecuta comandos en la terminal del sistema de forma asíncrona.
 * * Maneja la compatibilidad nativa con entornos Windows utilizando 'cmd /c'
 * para mitigar anomalías y fallos de spawn (errores del tipo EINVAL).
 * * @param command El comando base que se desea ejecutar (por ejemplo: 'pnpm').
 * @param args Lista estructurada de argumentos o banderas para el comando.
 * @param cwd Directorio de trabajo absoluto donde se inicializará la ejecución.
 * @returns Una promesa que se resuelve con `true` si el comando finaliza con éxito.
 */
export function runCommand(command: string, args: string[], cwd: string): Promise<boolean> {
    const isWindows = process.platform === 'win32';
    const baseCommand = isWindows ? 'cmd' : command;
    const finalArgs = isWindows ? ['/c', command, ...args] : args;

    return new Promise((resolve, reject) => {
        const childProcess = spawn(baseCommand, finalArgs, {
            stdio: 'inherit',
            shell: false,
            cwd
        });

        childProcess.on('close', (code) => {
            if (code === 0) resolve(true);
            else reject(new Error(`El comando falló con código ${code}`));
        });

        childProcess.on('error', (err) => reject(err));
    });
}
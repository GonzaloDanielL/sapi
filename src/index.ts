import { handleInit } from './commands/init';

/**
 * Punto de entrada principal y orquestador ejecutivo de Sapi CLI.
 * * Analiza los argumentos e indicadores pasados en la terminal de comandos
 * para enrutar el flujo de control hacia el submódulo operacional correspondiente
 * (`init` para el flujo interactivo de scaffolding o `sync` para la actualización de tokens).
 * * @returns Una promesa que se resuelve al finalizar el comando ejecutado.
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    // Enrutamiento por defecto enfocado al asistente interactivo de inicialización: sapi
    await handleInit();
}

// Inicialización del proceso principal con captura y manejo global de excepciones en consola
main().catch(console.error);
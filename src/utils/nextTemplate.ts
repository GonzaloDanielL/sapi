import fs from 'fs-extra';
import path from 'path';

/**
 * Genera de forma automatizada las plantillas de componentes para Next.js (App Router: `layout.tsx` y `page.tsx`).
 * * Escribe los archivos aplicando un diseño completamente responsivo adaptado a dispositivos móviles,
 * tablets y pantallas de gran formato (desktop). Configura los tokens dinámicos inyectando las iniciales 
 * procesadas del proyecto y aplicando un algoritmo de contraste estricto en el visor interactivo de la paleta.
 * * @param projectPath Ruta absoluta del directorio del proyecto en desarrollo.
 * @param projectName Nombre comercial o identificador asignado al proyecto.
 * @param projectSlug Prefijo normalizado (slug) para el alcance de variables CSS de Tailwind v4.
 * @param sectorKey Identificador clave del sector comercial seleccionado.
 * @param colors Colección estructurada de llaves semánticas de color y valores hexadecimales.
 * @param fonts Matriz con los metadatos de fuentes, nombres de familias y variables asociadas.
 * @returns Una promesa que se resuelve una vez persistidos los archivos en el disco.
 */
export async function generateNextTemplate(
    projectPath: string,
    projectName: string,
    projectSlug: string,
    sectorKey: string,
    colors: Array<{ key: string; hex: string }>,
    fonts: Array<{ name: string; variable: string }>
): Promise<void> {
    // Definición y resolución del directorio raíz nativo para el App Router de Next.js
    const appDir = path.join(projectPath, 'app');
    await fs.ensureDir(appDir);

    // Asignación de variables de respaldo estables para la persistencia del maquetado
    const colorBaseName = colors[0]?.key.split('-')[0] || 'teal';
    const bgDarkKey = colors[2]?.key || 'black';
    const bgLightKey = colors[3]?.key || 'black-light';
    const bgLighterKey = colors[4]?.key || 'black-lighter';
    const wLightKey = colors[5]?.key || 'white-light';
    const wSecondaryKey = colors[6]?.key || `white-${colorBaseName}`;

    const formattedSectorTitle = sectorKey.charAt(0).toUpperCase() + sectorKey.slice(1);
    
    const fontName1 = fonts[0]?.name || 'Roboto';
    const fontName2 = fonts[1]?.name || 'Lato';
    const fontClass1 = fontName1.toLowerCase().trim().replace(/\s+/g, '-');
    const fontClass2 = fontName2.toLowerCase().trim().replace(/\s+/g, '-');

    // 1. Escritura del archivo app/layout.tsx en formato CSS-First puro sin dependencias de next/font
    const layoutPath = path.join(appDir, 'layout.tsx');
    const layoutContent = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapi Sandbox - ${projectName}",
  description: "Proyecto inicializado con el ecosistema modular Sapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}`;
    await fs.writeFile(layoutPath, layoutContent);

    // 2. Mapeo iterativo y condicional para estructurar los contenedores JSX de la paleta cromática
    let colorBoxesJsx = '';
    for (const color of colors) {
        const borderUtility = color.key.includes('black') 
            ? `border-transparent dark:border dark:border-${projectSlug}-${wLightKey}/50` 
            : (color.key.includes('white') ? `border-${projectSlug}-${bgLightKey}` : 'border-transparent');
            
        const resolvedTextClass = color.key.includes('white')
            ? `text-${projectSlug}-${bgDarkKey}`
            : `text-${projectSlug}-${wLightKey}`;

        colorBoxesJsx += `              <div
                className="p-4 bg-${projectSlug}-${color.key} h-fit rounded-2xl flex justify-between cursor-pointer border ${borderUtility} color-copy-btn"
                role="button"
                tabIndex={0}
                onClick={() => handleCopy("${color.hex}")}
              >
                <span className="font-${fontClass1} font-medium ${resolvedTextClass}">${color.key.charAt(0).toUpperCase() + color.key.slice(1)}</span>
                <span className="font-${fontClass2} font-medium ${resolvedTextClass}">${color.hex}</span>
              </div>\n`;
    }

    // 3. Escritura de la página reactiva app/page.tsx con soporte responsivo y control de estados completo
    const pagePath = path.join(appDir, 'page.tsx');
    const pageContent = `"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; color: string }[]>([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCopy = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      const id = Date.now();
      setToasts((prev) => [...prev, { id, color }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    } catch (err) {
      console.error("Error al copiar el color: ", err);
    }
  };

  return (
    <div className="flex flex-col bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} transition-colors duration-300">
      <header className="fixed w-full h-20 flex justify-center items-center border-b-2 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} border-${projectSlug}-${bgLightKey}/10 dark:border-${projectSlug}-${wLightKey}/10 transition-colors duration-300 z-40">
        <nav className="w-full flex items-center max-w-7xl px-6 xl:px-0">
          <h1 className="font-${fontClass1} font-semibold text-${projectSlug}-${bgLightKey} dark:text-${projectSlug}-${wLightKey} text-xl sm:text-2xl transition-colors duration-300">
            Sector - <span className="text-${projectSlug}-${colorBaseName}-light">${formattedSectorTitle}</span>
          </h1>
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-6 ml-auto">
            <a
              href="https://github.com/GonzaloDanielL"
              target="_blank"
              className="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
              aria-label="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
            <a
              href="https://chalo-portafolio.vercel.app/"
              target="_blank"
              className="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
              aria-label="Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </a>
            <button
              id="theme-toggle"
              onClick={toggleDarkMode}
              className="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 block dark:hidden"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hidden dark:block"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            </button>
          </div>
        </nav>
      </header>

      <main className="w-full min-h-dvh pt-28 pb-12 md:pt-30 md:pb-20 xl:h-dvh xl:pt-20 xl:pb-0 flex justify-center items-center px-6 lg:px-8 xl:px-0">
        <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 h-fit w-full">
          <div className="flex flex-col gap-6">
            <h2 className="font-black font-${fontClass1} text-${projectSlug}-${colors[1]?.key || 'teal-dark'} dark:text-${projectSlug}-${wLightKey} text-4xl sm:text-4xl md:text-5xl lg:text-6xl uppercase transition-colors duration-300">
              Colores y Tipografías <span className="text-${projectSlug}-${colorBaseName}-light">seleccionados</span>
            </h2>
            <p className="font-medium font-${fontClass2} text-${projectSlug}-${bgLightKey} dark:text-${projectSlug}-${wSecondaryKey} text-base sm:text-lg transition-colors duration-300">
              Los colores y tipografías fueron seleccionados basándose en lo que más se usa en el mercado, tómalos como guía o base, no olvides que puedes cambiarlos como quieras, la última decisión la tienes tú.
            </p>
            <div className="flex flex-row gap-6">
              <div className="flex flex-col p-4 bg-${projectSlug}-${colorBaseName}-light/10 border border-${projectSlug}-${colorBaseName}-light/60 hover:shadow-md hover:shadow-${projectSlug}-${bgLightKey}/70 transition-shadow duration-300 rounded-2xl w-fit">
                <h3 className="text-5xl font-${fontClass1} font-semibold text-${projectSlug}-${colors[1]?.key || 'teal-dark'} border border-${projectSlug}-white-light/20 dark:text-${projectSlug}-white-light p-4 bg-${projectSlug}-white-light dark:bg-${projectSlug}-black rounded-2xl transition-colors duration-300">
                  Aa
                </h3>
                <p className="font-${fontClass1} font-medium text-lg text-${projectSlug}-${colorBaseName}-light w-full text-center pt-4">
                  ${fontName1}
                </p>
              </div>
              <div className="flex flex-col p-4 bg-${projectSlug}-${colorBaseName}-light/10 border border-${projectSlug}-${colorBaseName}-light/60 hover:shadow-md hover:shadow-${projectSlug}-${bgLightKey}/70 transition-shadow duration-300 rounded-2xl w-fit">
                <h3 className="text-5xl font-${fontClass2} font-semibold text-${projectSlug}-${colors[1]?.key || 'teal-dark'} border border-${projectSlug}-white-light/20 dark:text-${projectSlug}-white-light p-4 bg-${projectSlug}-white-light dark:bg-${projectSlug}-black rounded-2xl transition-colors duration-300">
                  Aa
                </h3>
                <p className="font-${fontClass2} font-medium text-lg text-${projectSlug}-${colorBaseName}-light w-full text-center pt-4">
                  ${fontName2}
                </p>
              </div>
            </div>
          </div>

          <div className="h-fit transition-colors duration-300 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
${colorBoxesJsx}
          </div>
        </div>
      </main>

      <footer className="bg-${projectSlug}-${bgLightKey} py-10 min-h-40 h-auto flex items-center justify-center px-6 lg:px-8">
        <p className="max-w-7xl w-full text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-${fontClass1} font-extrabold text-${projectSlug}-${wLightKey}">
          ¡Gracias por descargar <span className="text-${projectSlug}-${colorBaseName}-light">Sapi!</span>
        </p>
      </footer>

      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} border border-${projectSlug}-${bgLightKey}/10 dark:border-white/10 border-l-4 border-l-${projectSlug}-${colorBaseName}-light dark:border-l-${projectSlug}-${colorBaseName}-light text-${projectSlug}-${bgDarkKey} dark:text-${projectSlug}-${wLightKey} rounded-r-xl shadow-lg flex items-center gap-3 pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 font-roboto font-medium text-sm"
          >
            <span>copiado 👍</span>
            <span className="font-mono text-xs opacity-75 font-normal">{toast.color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;
    await fs.writeFile(pagePath, pageContent);
}
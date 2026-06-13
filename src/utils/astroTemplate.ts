import fs from 'fs-extra';
import path from 'path';

/**
 * Genera de forma automatizada las plantillas base de vistas sandbox para Astro (`Layout.astro` e `index.astro`).
 * * Escribe los archivos aplicando un diseño responsivo fluido adaptado a dispositivos móviles,
 * tablets y pantallas de gran envergadura (desktop). Configura los tokens dinámicos inyectando
 * las iniciales procesadas del proyecto y aplicando un algoritmo de contraste estricto
 * en el visor interactivo de la paleta comercial.
 * * @param projectPath Ruta absoluta del directorio del proyecto en desarrollo.
 * @param projectName Nombre comercial o identificador asignado al proyecto.
 * @param projectSlug Prefijo normalizado (slug) para el alcance de variables CSS de Tailwind v4.
 * @param sectorKey Identificador clave del sector comercial seleccionado.
 * @param colors Colección estructurada de llaves semánticas de color y valores hexadecimales.
 * @param fonts Matriz con los metadatos de fuentes, nombres de familias y variables asociadas.
 * @returns Una promesa que se resuelve una vez persistidos los archivos en el disco.
 */
export async function generateAstroTemplate(
    projectPath: string, 
    projectName: string, 
    projectSlug: string, 
    sectorKey: string,
    colors: Array<{ key: string; hex: string }>,
    fonts: Array<{ name: string; variable: string }>
): Promise<void> {
    const srcDir = path.join(projectPath, 'src');
    
    // Extrae la raíz semántica del color insignia del preset (ej. 'coral', 'teal', 'blue')
    const colorBaseName = colors[0]?.key.split('-')[0] || 'teal';
    
    // Asignación de variables de respaldo estables para la persistencia del maquetado
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

    // 1. Escritura de la plantilla estructural Layout.astro con renderizado del árbol DOM e hidratación del tema
    const layoutPath = path.join(srcDir, 'layouts', 'Layout.astro');
    await fs.ensureFile(layoutPath);
    await fs.writeFile(layoutPath, `<!doctype html>
<html lang="es">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<link rel="icon" href="/favicon.ico" />
		<meta name="generator" content={Astro.generator} />
		<title>Sapi Starter - ${projectName}</title>
		<script is:inline>
			const getThemePreference = () => {
				if (
					typeof localStorage !== "undefined" &&
					localStorage.getItem("theme")
				) {
					return localStorage.getItem("theme");
				}
				return window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light";
			};
			const isDark = getThemePreference() === "dark";
			document.documentElement.classList.toggle("dark", isDark);
		</script>
	</head>
	<body
		class="flex flex-col bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} transition-colors duration-300"
	>
		<header
			class="fixed w-full h-20 flex justify-center items-center border-b-2 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} border-${projectSlug}-${bgLightKey}/10 dark:border-${projectSlug}-${wLightKey}/10 transition-colors duration-300"
		>
			<nav class="w-full flex items-center max-w-7xl px-6 xl:px-0">
				<h1
					class="font-${fontClass1} font-semibold text-${projectSlug}-${bgLightKey} dark:text-${projectSlug}-${wLightKey} text-xl sm:text-2xl transition-colors duration-300"
				>
					Sector - <span class="text-${projectSlug}-${colorBaseName}-light">${formattedSectorTitle}</span>
				</h1>
				<div class="flex items-center gap-3 sm:gap-5 lg:gap-6 ml-auto">
					<a
						href="https://github.com/GonzaloDanielL"
						target="_blank"
						class="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
						aria-label="GitHub"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-5 h-5"
							><path
								d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
							></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg
						>
					</a>
					<a
						href="https://chalo-portafolio.vercel.app/"
						target="_blank"
						class="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
						aria-label="Link"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-5 h-5"
							><path
								d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
							></path><path
								d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
							></path></svg
						>
					</a>
					<button
						id="theme-toggle"
						class="text-${projectSlug}-${bgLightKey}/80 dark:text-${projectSlug}-${wLightKey}/80 border border-${projectSlug}-${bgLightKey}/0 dark:border-${projectSlug}-${wLightKey}/5 rounded-full p-2.5 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} flex hover:text-${projectSlug}-${colorBaseName}-dark dark:hover:text-${projectSlug}-${colorBaseName}-light hover:border-${projectSlug}-${bgLightKey}/10 dark:hover:border-${projectSlug}-${wLightKey}/10 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-95 transition-all duration-200"
						aria-label="Toggle Theme"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-5 h-5 block dark:hidden"
							><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
							></path></svg
						>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-5 h-5 hidden dark:block"
							><circle cx="12" cy="12" r="4"></circle>
							<path d="M12 2v2"></path>
							<path d="M12 20v2"></path>
							<path d="m4.93 4.93 1.41 1.41"></path>
							<path d="m17.66 17.66 1.41 1.41"></path>
							<path d="M2 12h2"></path>
							<path d="M20 12h2"></path>
							<path d="m6.34 17.66-1.41 1.41"></path>
							<path d="m19.07 4.93-1.41 1.41"></path></svg
						>
					</button>
				</div>
			</nav>
		</header>
		<slot />
		<footer
			class="bg-${projectSlug}-${bgLightKey} py-10 min-h-40 h-auto flex items-center justify-center px-6 lg:px-8"
		>
			<p
				class="max-w-7xl w-full text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-${fontClass1} font-extrabold text-${projectSlug}-${wLightKey}"
			>
				¡Gracias por descargar <span class="text-${projectSlug}-${colorBaseName}-light"
					>Sapi!</span
				>
			</p>
		</footer>
	</body>
	<script>
		const themeToggle = document.getElementById("theme-toggle");
		if (themeToggle) {
			themeToggle.addEventListener("click", () => {
				const element = document.documentElement;
				element.classList.toggle("dark");
				const isDarkNow = element.classList.contains("dark");
				localStorage.setItem("theme", isDarkNow ? "dark" : "light");
			});
		}
	</script>
</html>`);

    // 2. Mapeo iterativo y condicional para estructurar los contenedores visuales de la paleta cromática
    let colorBoxesHtml = '';
    for (const color of colors) {
        const borderUtility = color.key.includes('black') 
            ? `border-transparent dark:border dark:border-${projectSlug}-${wLightKey}/50` 
            : (color.key.includes('white') ? `border-${projectSlug}-${bgLightKey}` : 'border-transparent');
            
        const resolvedTextClass = color.key.includes('white')
            ? `text-${projectSlug}-${bgDarkKey}`
            : `text-${projectSlug}-${wLightKey}`;

        colorBoxesHtml += `				<div
					class="p-4 bg-${projectSlug}-${color.key} h-fit rounded-2xl flex justify-between cursor-pointer border ${borderUtility} color-copy-btn"
					role="button"
					tabindex="0"
					data-color="${color.hex}"
				>
					<span class="font-${fontClass1} font-medium ${resolvedTextClass}">${color.key.charAt(0).toUpperCase() + color.key.slice(1)}</span>
					<span class="font-${fontClass2} font-medium ${resolvedTextClass}">${color.hex}</span>
				</div>\n`;
    }

    // 3. Escritura de la página principal index.astro con soporte responsivo y controladores de eventos DOM nativos
    const indexPath = path.join(srcDir, 'pages', 'index.astro');
    await fs.ensureFile(indexPath);
    
    await fs.writeFile(indexPath, `---
import Layout from "../layouts/Layout.astro";
import "../styles/global.css";
---

<Layout>
	<main class="w-full min-h-dvh pt-28 pb-12 md:pt-30 md:pb-20 xl:h-dvh xl:pt-20 xl:pb-0 flex justify-center items-center px-6 lg:px-8 xl:px-0">
		<div class="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 h-fit w-full">
			<div class="flex flex-col gap-6">
				<h2
					class="font-black font-${fontClass1} text-${projectSlug}-${colors[1]?.key || 'teal-dark'} dark:text-${projectSlug}-${wLightKey} text-4xl sm:text-4xl md:text-5xl lg:text-6xl uppercase transition-colors duration-300"
				>
					Colores y Tipografías <span class="text-${projectSlug}-${colorBaseName}-light"
						>seleccionados</span
					>
				</h2>
				<p
					class="font-medium font-${fontClass2} text-${projectSlug}-${bgLightKey} dark:text-${projectSlug}-${wSecondaryKey} text-base sm:text-lg transition-colors duration-300"
				>
					Los colores y tipografías fueron seleccionados basándose en
					lo que más se usa en el mercado, tómalos como guía o base,
					no olvides que puedes cambiarlos como quieras, la última
					decisión la tienes tú.
				</p>
				<div class="flex flex-row gap-6">
					<div
						class="flex flex-col p-4 bg-${projectSlug}-${colorBaseName}-light/10 border border-${projectSlug}-${colorBaseName}-light/60 hover:shadow-md hover:shadow-${projectSlug}-${bgLightKey}/70 transition-shadow duration-300 rounded-2xl w-fit"
					>
						<h3
							class="text-5xl font-${fontClass1} font-semibold text-${projectSlug}-${colors[1]?.key || 'teal-dark'} border border-${projectSlug}-${wLightKey}/20 dark:text-${projectSlug}-${wLightKey} p-4 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} rounded-2xl transition-colors duration-300"
						>
							Aa
						</h3>
						<p
							class="font-${fontClass1} font-medium text-lg text-${projectSlug}-${colorBaseName}-light w-full text-center pt-4"
						>
							${fontName1}
						</p>
					</div>
					<div
						class="flex flex-col p-4 bg-${projectSlug}-${colorBaseName}-light/10 border border-${projectSlug}-${colorBaseName}-light/60 hover:shadow-md hover:shadow-${projectSlug}-${bgLightKey}/70 transition-shadow duration-300 rounded-2xl w-fit"
					>
						<h3
							class="text-5xl font-${fontClass2} font-semibold text-${projectSlug}-${colors[1]?.key || 'teal-dark'} border border-${projectSlug}-${wLightKey}/20 dark:text-${projectSlug}-${wLightKey} p-4 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgDarkKey} rounded-2xl transition-colors duration-300"
						>
							Aa
						</h3>
						<p
							class="font-${fontClass2} font-medium text-lg text-${projectSlug}-${colorBaseName}-light w-full text-center pt-4"
						>
							${fontName2}
						</p>
					</div>
				</div>
			</div>

			<div
				class="h-fit transition-colors duration-300 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
			>
${colorBoxesHtml}			</div>
		</div>
	</main>
	<div
		id="toast-container"
		class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
	>
	</div>
</Layout>

<script>
	const toastContainer = document.getElementById("toast-container");
	
	const showToast = (color: string) => {
		if (!toastContainer) return;

		const toast = document.createElement("div");
		toast.className =
			"p-4 bg-${projectSlug}-${wLightKey} dark:bg-${projectSlug}-${bgLighterKey} border border-${projectSlug}-${bgLightKey}/10 dark:border-white/10 border-l-4 border-l-${projectSlug}-${colorBaseName}-light dark:border-l-${projectSlug}-${colorBaseName}-light text-${projectSlug}-${bgDarkKey} dark:text-${projectSlug}-${wLightKey} rounded-r-xl shadow-lg flex items-center gap-3 pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 font-roboto font-medium text-sm";
		toast.innerHTML = \`
			<span>copiado 👍</span>
			<span class="font-mono text-xs opacity-75 font-normal">\${color}</span>
		\`;

		toastContainer.appendChild(toast);

		toast.offsetHeight;

		toast.classList.remove("translate-y-4", "opacity-0");
		toast.classList.add("translate-y-0", "opacity-100");

		setTimeout(() => {
			toast.classList.remove("translate-y-0", "opacity-100");
			toast.classList.add("translate-y-[-10px]", "opacity-0");

			setTimeout(() => {
				toast.remove();
			}, 300);
		}, 2700);
	};

	const copyButtons =
		document.querySelectorAll<HTMLElement>(".color-copy-btn");
	copyButtons.forEach((btn) => {
		const handleCopy = async () => {
			const color = btn.getAttribute("data-color");
			if (!color) return;

			try {
				await navigator.clipboard.writeText(color);
				showToast(color);
			} catch (err) {
				console.error("Error al copiar el color: ", err);
			}
		};

		btn.addEventListener("click", handleCopy);
		btn.addEventListener("keydown", (e) => {
			if (e instanceof KeyboardEvent) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleCopy();
				}
			}
		});
	});
</script>`);
}
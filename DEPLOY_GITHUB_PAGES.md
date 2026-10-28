# 🚀 Guía de Despliegue en GitHub Pages (100% Gratis y Sin Servidor)

¡Buenas noticias! Esta aplicación es una SPA (Single Page Application) estática moderna construida con React y Vite. **No necesitas pagar ningún servidor ni backend**, ya que todos los datos, contraseñas, analíticas y personalizaciones se almacenan de forma local y persistente en el navegador del usuario (`localStorage`).

---

## 📋 Opción 1: Despliegue Automático con GitHub Actions (Recomendado)

1. **Sube este proyecto a tu repositorio de GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Inicializar BioLink El Amor Traspasa PWA"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Crea el archivo de despliegue automático**:
   El proyecto ya incluye el flujo en `.github/workflows/deploy.yml`.

3. **Activa GitHub Pages en tu repositorio**:
   - Ve a tu repositorio en GitHub.
   - Haz clic en **Settings** (Configuración) > pestaña **Pages** (en el menú lateral izquierdo).
   - En **Build and deployment > Source**, selecciona **GitHub Actions**.
   - ¡Listo! En 1 minuto tu web estará publicada en:
     `https://TU_USUARIO.github.io/TU_REPOSITORIO/` (o en tu dominio personalizado como `home.elamortraspasa.com`).

---

## 📦 Opción 2: Despliegue Manual con `gh-pages`

1. Compila el proyecto localmente:
   ```bash
   npm run build
   ```
2. La carpeta resultante `dist` contiene los archivos listos para publicar en cualquier hosting estático:
   - **GitHub Pages**
   - **Vercel** (Importar con 1 clic desde GitHub)
   - **Netlify**
   - **Cloudflare Pages**

---

## 📱 Progressive Web App (PWA) e Instalabilidad

La aplicación ya está configurada con:
- Service Worker que guarda en caché los estilos, fuentes e iconos para funcionar **sin conexión a internet**.
- Manifiesto oficial PWA (`manifest.webmanifest`) con nombre, colores e iconos de 192px y 512px.
- Botón **"Instalar App"** integrado directamente en la cabecera y en el pie para que cualquier persona en **Android**, **iPhone**, **iPad** o **PC/Mac** pueda instalarla en su pantalla de inicio como una aplicación nativa.

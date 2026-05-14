# 🚀 Plan de Despliegue a Producción — Chilaquiles Aristeus

Para llevar este menú de un "ambiente de pruebas" local a una URL pública profesional, utilizamos **Firebase Hosting**.

## Fase 1: Limpieza de Producción (Code Clean-up)
Antes de subir el archivo, generamos una versión de "Solo Lectura" mediante el script `generate_production.js`:
1.  **Eliminar Interfaz de Edición:** Quita las barras de herramientas y botones.
2.  **Desactivar Edición:** Cambia `contenteditable="true"` a `false`.
3.  **Sanear Imágenes:** Renombra archivos para quitar espacios y carpetas, actualizando las rutas.
4.  **Optimización Móvil:** Inyecta estilos CSS específicos para celulares.

## 🧪 Estrategia de Ambientes Finalizada

Para garantizar la calidad antes de cada lanzamiento, hemos establecido dos canales:

### 1. Ambiente de Pruebas (Preview)
*   **Finalidad:** Validar cambios de diseño, imágenes y precios antes de salir a producción.
*   **URL de Pruebas:** [https://aristeus-premium-menu--pruebas-pzek4r40.web.app](https://aristeus-premium-menu--pruebas-pzek4r40.web.app)
*   **Comando:** `firebase hosting:channel:deploy pruebas`

### 2. Ambiente de Producción (Live)
*   **Finalidad:** Enlace público para los clientes.
*   **URL Oficial:** [https://aristeus-premium-menu.web.app](https://aristeus-premium-menu.web.app)
*   **Comando:** `firebase deploy --only hosting`

---

## 🛠️ Flujo de Trabajo Establecido
1.  Realizar cambios en `menu-aristeus-ultra-premium-vf-2026.html`.
2.  Ejecutar `node generate_production.js`.
3.  Desplegar al canal de **pruebas**.
4.  Una vez aprobado por el usuario, desplegar a **producción**.

---

## 🔗 Enlaces del Proyecto
* **Consola de Firebase:** https://console.firebase.google.com/project/aristeus-premium-menu/overview

# Guía de Instalación de Claude Code Local (Ollama)

### **PASO 1: DESCARGAR OLLAMA**
1. Ve a **ollama.com**
2. Haz clic en **Download**.
3. Instálalo como cualquier aplicación normal.

---

### **PASO 2: DESCARGAR UN MODELO DE IA**
1. Abre la **Terminal** (Mac/Linux) o **CMD** (Windows).
2. Pega el siguiente comando y presiona Enter:
   ```bash
   ollama pull qwen3-coder
   ```
3. Espera a que termine la descarga (aproximadamente **20 minutos**).

---

### **PASO 3: INSTALAR CLAUDE CODE**
1. En la misma terminal, pega el comando según tu sistema:
   *   **Mac / Linux:**
       ```bash
       curl -fsSL https://claude.ai/install.sh | bash
       ```
   *   **Windows:**
       ```powershell
       curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd
       ```
2. Espera unos **2 minutos** a que se complete la instalación.

---

### **PASO 4: INICIAR CLAUDE CODE**
1. En tu terminal, pega:
   ```bash
   ollama launch claude
   ```
2. Selecciona tu **modelo** de la lista (ej. `qwen3-coder` o `qwen3:8b`).
3. **¡Listo!** Claude Code ya está corriendo localmente en tu máquina.

---

### **CÓMO USARLO**
Pídele a Claude Code que construya cosas por ti. Lee, escribe y edita archivos **directamente en tu computadora**. Ningún dato sale de tu máquina.

**Ejemplos de comandos:**
*   *"Build me a landing page for my business"*
*   *"Create a lead tracker spreadsheet"*
*   *"Write a Python script to organise my files"*
*   *"Make a hello world website"*

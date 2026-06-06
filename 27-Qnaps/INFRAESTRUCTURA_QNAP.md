# Infraestructura y Documentación NAS QNAP

Este documento centraliza toda la información técnica, credenciales, limitaciones y despliegues realizados en la NAS QNAP de la red local.

## 1. Credenciales de Acceso
* **IP Local:** `192.168.100.10`
* **Usuario:** `admin`
* **Contraseña:** `Amortiguad@r1`
* **Protocolos Activos:** SSH (Puerto 22), SMB (Mac/Windows).

## 2. Entorno y Arquitectura
El sistema operativo de la QNAP (QTS) es un entorno Linux incrustado (embedded) con ciertas restricciones importantes para el desarrollo y despliegue:

* **Arquitectura:** `armv7l` (ARM de 32 bits). **Nota:** Binarios compilados para `x64` o `arm64` (aarch64) no funcionarán.
* **Librerías Core (GLIBC):** La versión de `glibc` es antigua. Intentar correr binarios modernos (ej. Node.js v20 precompilado) arrojará errores de `GLIBC_2.27 not found`.
* **Herramientas Disponibles (Nativas SSH):** `curl`, `grep` (con soporte `-E`), `sed`, `awk`, `tar`, `scp`, `ssh`.
* **Herramientas NO Disponibles (Nativas SSH):** `node`, `npm`, `python`, `python3`, `jq`, `perl`, `php`.
* **Docker / Container Station:** Aunque Container Station esté instalado, el binario de `docker` no está expuesto directamente en el `$PATH` para el usuario SSH normal. El despliegue de contenedores debe hacerse mediante la interfaz web de QTS o subiendo archivos comprimidos a carpetas compartidas para importarlos manualmente en la UI.

## 3. Sistema de Archivos
* **Raíz del Volumen Principal:** `/share/CACHEDEV1_DATA/`
* **Carpeta Pública Compartida:** `/share/CACHEDEV1_DATA/Public/`
* **Directorio de Paquetes Instalados (QPKGs):** `/share/CACHEDEV1_DATA/.qpkg/`
* **Container Station:** `/share/CACHEDEV1_DATA/.qpkg/container-station/`

## 4. Tareas Programadas (CRON)
En QNAP, no se usa el comando `crontab -e` tradicional de la misma manera, ya que los cambios se borran al reiniciar. El flujo correcto es:

1. Editar el archivo principal: `vi /etc/config/crontab`
2. Recargar el crontab: `crontab /etc/config/crontab`
3. Reiniciar el demonio Cron: `/etc/init.d/crond.sh restart`

## 5. Despliegues y Proyectos Activos

### A. Chilaquiles Aristeus (Auto-Publisher)
* **Ubicación en NAS:** `/share/CACHEDEV1_DATA/aristeus-publisher`
* **Estrategia:** Debido a las limitaciones de Node.js y la arquitectura `armv7l`, se construyó un motor de publicación 100% nativo usando **BASH y CURL** (`publicar_qnap.sh`). Este script parsea el archivo `copias.conf` y se comunica directamente con las APIs de Facebook Graph (Meta).
* **Cron Jobs Activos:**
  * `0 12 * * * /share/CACHEDEV1_DATA/aristeus-publisher/publicar_qnap.sh`
  * `0 15 * * * /share/CACHEDEV1_DATA/aristeus-publisher/publicar_qnap.sh`

### B. Telegram Claude Bot (Proyecto 11)
* Desplegado usando la UI web de **Container Station**.
* Se conecta a las carpetas montadas en el host para persistencia de datos.

## 6. Sincronización Local (MacBook)
La MacBook utiliza el script `sync-documentos.sh` para montar el volumen SMB y usar `rsync` hacia la NAS:
* Comando de montaje: `mount_smbfs //admin:Amortiguad@r1@192.168.100.10/Public /Volumes/Public`

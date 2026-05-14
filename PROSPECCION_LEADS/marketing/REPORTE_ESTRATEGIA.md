# Reporte de Prospección - San Luis Potosí 2026

Este proyecto contiene las herramientas y contactos extraídos para la prospección de clientes industriales en San Luis Potosí, México.

## Herramientas Utilizadas
- **Prospeo.io**: Utilizada como alternativa principal a Hunter/Apollo. Se configuró mediante API para búsquedas masivas.
- **Snov.io**: Configurada como respaldo para búsquedas manuales y verificación.

## Contenido de la Carpeta
- `buscador_prospeo.py`: Script automatizado para buscar correos usando la API Key proporcionada.
- `prospectos_verificados.csv`: Lista inicial de contactos de alto nivel en BMW, Nestlé y Kellogg's.

## Dominios Clave Identificados
| Empresa | Dominio |
| :--- | :--- |
| BMW México | `bmw.com.mx` |
| Nestlé México | `nestle.com.mx` |
| Kellogg's México | `kelloggs.com.mx` |
| PepsiCo México | `pepsico.com.mx` |
| Kimberly-Clark | `kimberly-clark.com.mx` |
| Ternium | `ternium.com` |

## Instrucciones para el Futuro
1. Para buscar nuevas empresas, añade el dominio al archivo `buscador_prospeo.py` en la lista `DOMAINS`.
2. Ejecuta el script con `python3 buscador_prospeo.py`.
3. Revisa los resultados en el archivo CSV generado.

---
*Generado por Antigravity - Asistente de Prospección Inteligente.*

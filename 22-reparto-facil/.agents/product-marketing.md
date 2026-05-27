# Cerebro del Producto: RepartoFácil

## 1. Identidad de Marca y Concepto
**RepartoFácil** es una solución de logística local (San Luis Potosí) enfocada en organizar el caos de entregas a domicilio para restaurantes y dueños de flotillas que actualmente operan 100% por WhatsApp.

**Promesa Principal:** "Adiós al caos de WhatsApp. Hola, logística ordenada."

## 2. Ideal Customer Profile (ICP)
**Dueño de Flotilla / Restaurante Múltiple en SLP:**
- **Situación:** Gestiona repartidores propios a través de grupos de WhatsApp.
- **Problema Principal:** Pierde control sobre los pedidos; los repartidores se auto-asignan y chocan en la misma ubicación; al final del día tiene que sumar manualmente pedido por pedido buscando en el historial del chat para hacer el corte de caja.
- **Deseo:** Quiere orden y visibilidad total (saber quién hace qué y cuánto le deben) SIN tener que migrar a sus clientes (tenderos) a una app nueva, y SIN facturar/pasar por el SAT (operación 100% en efectivo).

## 3. Propuesta de Valor Única (USP)
- **Cero Fricción para Clientes:** Los tenderos siguen pidiendo por WhatsApp.
- **Asignación Automática y Exclusiva:** Un solo repartidor por pedido ("Yo lo tomo").
- **Corte de Caja Automático:** Matemática lista al instante al terminar la jornada.

## 4. Arquitectura de la Solución (Low-Code MVP)
1. **Bot de WhatsApp:** Para que los tenderos envíen direcciones y el bot registre el pedido automáticamente (WhatsApp Cloud API + Twilio).
2. **Panel Web de Dueño:** Control en vivo de estatus, repartidores y corte diario (FlutterFlow + Firebase).
3. **App PWA Repartidor:** Listado de pedidos, toma de pedidos y actualización de estatus (FlutterFlow).

## 5. Zonas de Cobertura y Tarifas (SLP)
- **Centro ($40):** Zona Centro, Barrio de Santiago, Tequisquiapan, Real de Catorce, Av. Carranza hasta Morales, San Luis Rey.
- **Norte ($50 - $60):** Las Terceras, El Saucito, Retornos, Rural Atlas, El Morro, Soledad de Graciano Sánchez.
- **Sur ($50 - $60):** Lomas, Tangamanga, Balcones del Valle, Himno Nacional, Zona Industrial, Pozos.
*(Nota: Regla de cruce de zona = Promedio de ambas zonas).*

## 6. Planes de Suscripción (B2B SaaS)
- **Despegue ($699/mes):** MVP con 8 repartidores. Bot WA, Panel Dueño, App Repartidores y corte diario.
- **Crecimiento ($1,299/mes):** Recomendado. Repartidores ilimitados, geofencing, reportes, chat interno y soporte 24/7.
- **Empresarial ($2,499/mes):** Para flotas 24/7. Múltiples paneles, APIs, histórico de 12 meses y capacitación presencial.

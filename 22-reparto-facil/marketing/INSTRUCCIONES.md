# INSTRUCCIONES - RepartoFácil

## Resumen del Proyecto
Este documento establece la hoja de ruta para la construcción y lanzamiento de **RepartoFácil** (Fase Informativa Actual).

## Modelo Operativo
- Operación en San Luis Potosí.
- Transacciones 100% en efectivo (para evitar fricciones de facturación).
- Sin registro de cuentas complejas para clientes finales.

## Cronograma de Ejecución (4 Semanas)

### Semana 1: Configuración Core y Bot
- [ ] Configurar Firebase (Authentication y Firestore).
- [ ] Conectar WhatsApp Cloud API o proveedor (WATI/Twilio).
- [ ] Configurar webhook de recepción de direcciones y cálculo de tarifas según zona (Centro, Norte, Sur).

### Semana 2: Panel Administrativo (Dueño)
- [ ] Diseñar UI en FlutterFlow para vista web.
- [ ] Conectar a Firebase para lectura de pedidos en tiempo real.
- [ ] Implementar vista de mapa (Google Maps API) y vista de "Corte del día".

### Semana 3: App Repartidores (PWA)
- [ ] Diseñar UI móvil en FlutterFlow.
- [ ] Lógica de bloqueo de concurrencia: el primer repartidor que hace click en "Yo lo tomo" asigna el viaje a sí mismo.
- [ ] Gestión de estatus: Camino -> Recogido -> Entregado.
- [ ] Chat interno por pedido (visible para el dueño).
- [ ] Pruebas en campo con 1-2 repartidores reales.

### Semana 4: Lanzamiento y Ventas
- [ ] Ajustes post-pruebas.
- [ ] Publicación de Landing Page oficial.
- [ ] Cierre de ventas con prospectos bajo los planes (Despegue, Crecimiento, Empresarial).

---

## Restricciones Técnicas (MVP Boundaries)
**Lo que NO se debe incluir en esta fase:**
- Registro de usuarios con email/contraseña para clientes (se manejarán por WhatsApp).
- Pagos en línea vía Stripe/MercadoPago.
- Módulo de facturación/CFDI.
- Desarrollo de aplicación nativa para Play Store/App Store (se distribuirá como PWA).
- Funciones complejas de geofencing automático.

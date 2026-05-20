# HyperFrames Masterclass - Guía de Aplicación

Esta guía resume cómo se aplicaron las **Skills de Aprendizaje** en el proyecto de ejemplo.

## 1. Skill `hyperframes` (La Biblia)
- **Estructura**: El archivo `index.html` sigue la estructura de "Layout Primero". Hemos definido el diseño final en CSS y luego usamos `gsap.from()` (o animaciones al estado final) para la entrada.
- **Atributos**: Usamos `data-composition-id`, `data-width`, `data-height`, `data-start` y `data-duration` en el contenedor raíz.
- **Audio**: Aunque este ejemplo es visual, la Skill indica que el audio debe ir en una etiqueta `<audio>` separada.

## 2. Skill `hyperframes-cli` (El Flujo)
- **Init**: El proyecto se creó con `npx hyperframes init`.
- **Lint**: Usamos `npm run check` (o `npx hyperframes lint`) para validar que no falte nada.
- **Inspect**: Usamos `npx hyperframes inspect` para verificar que el texto no se salga de las tarjetas.

## 3. Skill `gsap` (Animación)
- **Registro**: El timeline se registra en `window.__timelines`.
- **Eases**: Usamos `back.out` y `expo.out` para darle ese toque "premium" y elástico.
- **Determinismo**: No hay valores aleatorios. El video se verá igual siempre.

## 4. Transiciones Avanzadas (Clip-Path)
- **Circle Iris**: En el segundo 4, usamos `clipPath: "circle(0% at 50% 50%)"` animado a `100%` para revelar la Escena 2 de forma orgánica.
- **Diamond Iris**: En el segundo 8, usamos un polígono de 4 puntos que se expande para revelar la Escena 3.
- **Regla de Oro**: Observa que no hay animaciones de salida (`exit animations`) antes de la transición. La transición misma es la que oculta la escena anterior.

🚀 **Desafío para ti**:
1. Cambia el color `--gold` en `index.html` por el de tu marca.
2. Intenta cambiar la duración del `Circle Iris` de `0.8` a `1.5` para ver cómo cambia el "feeling" del video.
3. Corre `npx hyperframes preview` para ver la magia.

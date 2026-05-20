# Storyboard: Chilaquiles Aristeus - Próxima Apertura

**Total Duration:** 15.0s
**Format:** 1080x1920 (9:16)

---

## Asset Audit

| Asset ID | Description | Source Path |
| :--- | :--- | :--- |
| `LOGO` | Premium Aristeus Logo | `assets/logo_aristeus_premium.png` |
| `HERO_FOOD` | Main Chilaquiles Shot | `assets/hero_real_aristeus.png` |
| `DETAIL_FOOD` | Close up of salsa/texture | `assets/detail_aristeus.jpg` |
| `GOLD_SIGNATURE` | Gold "Firma Oro" accent | `assets/aristeus_firma_oro.png` |
| `BG_TEXTURE` | Elegant cream texture | `(Procedural CSS/SVG)` |

---

## Scene Breakdown

### Beat 1: The Tease (0.0s - 3.0s)
- **Visual:** Slow zoom into `HERO_FOOD`. Dark overlay fades in.
- **Text:** "LA ESPERA TERMINA" (DM Serif Display, Gold).
- **Animation:** Text slides up with `Power3.out`. Subtle glow pulse on the plate.
- **Audio:** "La espera está por terminar."

### Beat 2: The Experience (3.0s - 8.0s)
- **Visual:** Wipe transition to `DETAIL_FOOD`. Slow pan right.
- **Text:** "RUTA 57: ULTRA PREMIUM" (Outfit, White).
- **Animation:** Text reveals with a typewriter effect. `GOLD_SIGNATURE` appears in the corner.
- **Audio:** "Descubre la 'Ruta 57': los chilaquiles más exclusivos de San Luis Potosí."

### Beat 3: The Quality (8.0s - 12.0s)
- **Visual:** Split screen or grid showing different salsa textures (from `IMAGENES` or `fotos de productos`).
- **Text:** "SALSAS ARTESANALES" (DM Serif Display, Gold).
- **Animation:** Each image scales up slightly when it appears.
- **Audio:** "Salsas artesanales, ingredientes premium y un sabor que no olvidarás."

### Beat 4: The Reveal (12.0s - 15.0s)
- **Visual:** Logo reveal. `LOGO` centered on `#FAF6F0` background.
- **Text:** "PRÓXIMA APERTURA" (Outfit, Navy, bold).
- **Animation:** Logo drops in from top with a bounce. "Muy pronto" fades in at bottom.
- **Audio:** "Aristeus. Muy pronto, en el corazón de la ciudad."

---

## Technical Specs
- **FPS:** 30
- **Transitions:** `gsap.to(..., { opacity: 0, duration: 0.5 })`
- **Audio:** Music should be "Cinematic/Elegant/Sophisticated" (Spanish guitar or soft modern lounge).

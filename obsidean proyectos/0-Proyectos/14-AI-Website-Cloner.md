---
title: "AI Website Cloner Template"
tipo: "Desarrollo / Tool / Plantilla"
estado: "activo"
avance: 80
creado: 2026-05-01
actualizado: 2026-05-11
ingresos_objetivo: 0
ingresos_actuales: 0
repo: "https://github.com/JCodesMore/ai-website-cloner-template"
tags: [dev, ia, nextjs, template, clonar]
---

# AI Website Cloner Template

**Carpeta:** `/Users/macbook/Proyectos/14-ai-website-cloner-template`
**Repo:** `https://github.com/JCodesMore/ai-website-cloner-template`
**Estado:** 🟢 Activo
**Tipo:** Desarrollo / Tool / Plantilla
**Tags:** #dev #ia #nextjs #template #clonar

## Visión General

Template reutilizable para clonar cualquier sitio web en un código Next.js limpio y moderno usando agentes de IA. Proyecto de código abierto (MIT License).

---

## Stack Tecnológico

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Radix primitives + Tailwind CSS v4
- **Tailwind CSS v4** — oklch design tokens
- **Lucide React** — iconos por defecto (reemplazados por SVGs extraídos durante clonado)

---

## Cómo Funciona

El skill `/clone-website` ejecuta un pipeline de múltiples fases:

1. **Reconnaissance** — screenshots, extracción de design tokens, interacción
2. **Foundation** — actualiza fonts, colors, globals, descarga assets
3. **Component Specs** — escribe specs detalladas por componente
4. **Parallel Build** — dispatch de agentes builders en paralelo (git worktrees)
5. **Assembly & QA** — merge de worktrees, wire up, visual diff

---

## Plataformas Soportadas

| Agente | Estado |
|--------|--------|
| Claude Code (Opus 4.6) | **Recomendado** |
| Codex CLI | Soportado |
| OpenCode | Soportado |
| GitHub Copilot | Soportado |
| Cursor | Soportado |
| Windsurf | Soportado |
| Gemini CLI | Soportado |
| Cline | Soportado |
| Roo Code | Soportado |
| Continue | Soportado |
| Amazon Q | Soportado |
| Augment Code | Soportado |
| Aider | Soportado |

---

## Comandos

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run typecheck # TypeScript check
npm run check    # lint + typecheck + build
```

### Docker

```bash
docker compose up app --build     # build and run
docker compose up dev --build     # dev mode en port 3001
```

---

## Casos de Uso

- ** Migración de plataforma** — rebuild de WordPress/Webflow/Squarespace a Next.js
- **Código perdido** — sitio vivo sin repo, developer dejó, o stack legacy
- **Aprendizaje** — deconstruct sitios producción para aprender

### NO Es Para
- Phishing o impersonación
- Pasar diseño ajeno como propio
- Violar terms of service

---

## Estructura del Proyecto

```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # SVG icons extraídos
  lib/utils.ts      # cn() utility
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Imágenes descargadas del target
  videos/           # Videos descargados
  seo/              # Favicons, OG images
docs/
  research/         # Output de extracción y component specs
  design-references/ # Screenshots
scripts/            # Scripts de sync
```

---

## Recursos

- Documentación completa en `AGENTS.md`
- Guía de inspección en `docs/research/INSPECTION_GUIDE.md`
- Discord community disponible

---

## Skills Relacionados

```
clone-website, nextjs-development, tailwind-css, shadcn-ui,
typescript, ai-coding-agents, website-reverse-engineering
```

---

*Creado: Mayo 2026*
*Repo: https://github.com/JCodesMore/ai-website-cloner-template*
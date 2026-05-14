# Napkin Runbook — BarberApp

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-05-07] iPad race condition — peticiones API sobrescriben estado**
   Do instead: usar AbortController para cancelar peticiones pendientes antes de hacer nuevas. Ver admin/dashboard y barbero/dashboard.

2. **[2026-05-07] Firebase private key en Vercel pierde saltos de línea**
   Do instead: guardar como `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII..."` con \n escapados. El sistema en firebase-admin.ts tiene lógica de reconstrucción automática.

## Shell & Command Reliability
1. **[2026-05-07] git diff en rutas con espacios falla**
   Do instead: usar comillas вокруг rutas o cd con escape. Siempre usar `cd "/Users/macbook/Proyectos/..."`.

## Domain Behavior Guardrails
1. **[2026-05-07] Estados de cita: pendiente → confirmada → completada/en_curso/no_show/cancelada_***
   Do instead: no confiar en transiciones de estado implícitas. Validar flujo completo.

2. **[2026-05-07] Custom Claims controlan acceso — barberia_id es crítico**
   Do instead: toda API route debe verificar role Y barberia_id antes de retornar datos.

3. **[2026-05-07] Cliente final (usuario) no tiene barbero_id en sus claims**
   Do instead: al agendar, el barberoId se guarda en la cita, no en claims del usuario.

## User Directives
1. **[2026-05-07] Hacer commit separado por cada fix urgente**
   Do instead: git add + git commit solo los archivos del fix específico, mensaje claro del bug.

## Skills Disponibles
1. **[2026-05-07] superpowers: workflow estructurado con TDD, debugging sistemático y subagents**
   Do instead: invocar /plugin install superpowers@claude-plugins-official o leer .claude/skills/superpowers/skills/using-superpowers/SKILL.md
2. **[2026-05-07] notebooklm-skill: integra NotebookLM como base de conocimiento**
   Do instead: invocar desde Claude Code tras instalar en ~/.claude/skills/

# SEO AUDIT CHECKLIST - Renta Montacargas Noreste
## Sitio B2B Por Lanzar | Región Noreste de México

---

## 1. TECHNICAL SEO FOUNDATIONS

### 1.1 Domain & Hosting

- [ ] Dominio registrado (mínimo 3 años)
- [ ] SSL certificate válido (HTTPS)
- [ ] Redirect HTTP → HTTPS configurado
- [ ] CDN configurado (Cloudflare/Vercel)
- [ ] TTFB < 600ms

### 1.2 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cotizador/resultado

Sitemap: https://tudominio.com/sitemap.xml
```

- [ ] Crear archivo robots.txt en raíz
- [ ] Verificar que no bloquea recursos CSS/JS
- [ ] Incluir referencia a sitemap.xml

### 1.3 XML Sitemap

- [ ] Generar sitemap.xml con todas las URLs públicas
- [ ] Incluir: Homepage, Servicios, Flota, Cobertura, Cotizador, Blog
- [ ] Agregar `<lastmod>` con fechas de actualización
- [ ] Agregar `<priority>` por página
- [ ] Agregar `<changefreq>` apropiado
- [ ] Submit en Google Search Console

### 1.4 Canonical URLs

- [ ] Configurar canonical en todas las páginas (self-referencing)
- [ ] HTTP → HTTPS canonical correcto
- [ ] www vs non-www consistencia

---

## 2. ON-PAGE SEO

### 2.1 Meta Tags por Página

#### Homepage
| Elemento | Content | Caracteres |
|----------|----------|-------------|
| Title | Renta de Montacargas Noreste \| 4 Ciudades, 1 Proveedor | 55 |
| Meta description | Renta de montacargas en Monterrey, Saltillo, Aguascalientes y SLP. Mantenimiento incluido, disponibilidad 24/7. Cotiza ahora. | 140 |

#### Página de Servicios
| Elemento | Content | Caracteres |
|----------|----------|-------------|
| Title | Renta de Montacargas \| Corta y Larga Duración | 52 |
| Meta description | Renta montacargas diaria, semanal y mensual. Flota eléctrica y combustión. Cobertura en 4 ciudades del noreste. | 138 |

#### Ciudad: Monterrey
| Elemento | Content | Caracteres |
|----------|----------|-------------|
| Title | Renta de Montacargas en Monterrey \| Servicio Industrial | 55 |
| Meta description | Renta de montacargas en Monterrey. Equipos eléctricos y diesel, mantenimiento incluido. Servicio 24/7 para industrias. | 138 |

### 2.2 Heading Structure (por página)

```
H1: [Keyword principal de la página]
  H2: Sección 1
    H3: Subsección 1.1
    H3: Subsección 1.2
  H2: Sección 2
    H3: Subsección 2.1
```

**Reglas:**
- Solo un H1 por página
- No saltar niveles (H1 → H3 → H4)
- Keywords en H2 y H3 cuando sea natural

### 2.3 Content Checklist

- [ ] Keyword en primera frase (100 palabras)
- [ ] Densidad keyword: 1-2% (no keyword stuffing)
- [ ] LSI keywords distribuidos naturalmente
- [ ] CTAs claros en cada página
- [ ] Datos de contacto visibles (teléfono, WhatsApp)
- [ ] Minimum 300 palabras por página

---

## 3. SCHEMA MARKUP

### 3.1 LocalBusiness (por ciudad)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Montacargas Norte - [Ciudad]",
  "image": "https://tudominio.com/images/logo.jpg",
  "telephone": "+52-81-XXXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[Ciudad]",
    "addressRegion": "[Estado]",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[lat]",
    "longitude": "[lng]"
  },
  "openingHours": "Mo-Su 00:00-23:59",
  "priceRange": "$$"
}
```

- [ ] Schema LocalBusiness para Monterrey
- [ ] Schema LocalBusiness para Saltillo
- [ ] Schema LocalBusiness para Aguascalientes
- [ ] Schema LocalBusiness para San Luis Potosí

### 3.2 Service Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Renta de Montacargas",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Montacargas Norte"
  },
  "areaServed": {
    "@type": "State",
    "name": "Nuevo León"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Renta de Montacargas",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Montacargas Eléctrico 2.5 ton"
        },
        "price": "18000",
        "priceCurrency": "MXN"
      }
    ]
  }
}
```

- [ ] Service schema para Renta Corta
- [ ] Service schema para Renta Larga
- [ ] Service schema para Venta
- [ ] Service schema para Mantenimiento

### 3.3 Product Schema (para montacargas en venta)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Montacargas Eléctrico Toyota 2.5 ton",
  "description": "Montacargas eléctrico 2,500 kg capacidad, batería de litio",
  "image": "https://tudominio.com/images/flota/electrico-25.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Toyota"
  },
  "offers": {
    "@type": "Offer",
    "price": "350000",
    "priceCurrency": "MXN",
    "availability": "https://schema.org/InStock"
  }
}
```

- [ ] Product schema por cada montacargas en venta

### 3.4 FAQ Schema (páginas de cobertura)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta rentar un montacargas en Monterrey?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los precios van desde $18,000/mes para montacargas eléctricos de 2.5 ton. Incluye mantenimiento."
      }
    }
  ]
}
```

- [ ] FAQ schema en `/cobertura/monterrey`
- [ ] FAQ schema en `/cobertura/saltillo`
- [ ] FAQ schema en `/cobertura/aguascalientes`
- [ ] FAQ schema en `/cobertura/san-luis-potosi`

### 3.5 Organization Schema (homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Montacargas Norte",
  "url": "https://tudominio.com",
  "logo": "https://tudominio.com/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-81-XXXX-XXXX",
    "contactType": "customer service",
    "availableHours": "Mo-Su 00:00-23:59"
  },
  "sameAs": [
    "https://www.facebook.com/montacargasnorte",
    "https://www.linkedin.com/company/montacargasnorte"
  ]
}
```

---

## 4. KEYWORD MAPPING

### 4.1 Primary Keywords por Página

| Página | Primary Keyword | Secondary Keywords |
|--------|----------------|-------------------|
| Homepage | renta de montacargas | arrendamiento montacargas, alquiler montacargas |
| Monterrey | renta de montacargas Monterrey | montacargas Nuevo León, arrendamiento MTY |
| Saltillo | renta de montacargas Saltillo | montacargas Coahuila, arrendamiento Saltillo |
| Aguascalientes | montacargas Aguascalientes | renta montacargas AGS, arrendamiento Aguascalientes |
| SLP | renta montacargas San Luis Potosi | montacargas SLP |
| Cotizador | cotizador montacargas | cotizar renta montacargas |
| Renta Corta | renta montacargas por día | alquiler diario montacargas |
| Renta Larga | renta montacargas mensual | arrendamiento mensual, rental mens |

### 4.2 Long-tail Keywords

- montacargas para bodega precio
- renta de montacargas electricos Monterrey
- arrendamiento montacargas 3 toneladas
- montacargas industrial para manufactura
- costo renta montacargas diesel

---

## 5. LOCAL SEO

### 5.1 Google Business Profile

- [ ] Crear GBP para Monterrey
- [ ] Crear GBP para Saltillo
- [ ] Crear GBP para Aguascalientes
- [ ] Crear GBP para San Luis Potosí

**Campos críticos:**
- [ ] Nombre del negocio consistente
- [ ] Categoría: "Renta de equipo para manejo de materiales"
- [ ] Telefono con lada local
- [ ] WhatsApp Business
- [ ] Horario: 24/7
- [ ] Fotos reales de flota y operaciones
- [ ] Reseñas solicitadas a clientes

### 5.2 NAP Consistency

- [ ] Nombre: "Montacargas Norte" (exacto en todas partes)
- [ ] Dirección: Formato correcto en cada ciudad
- [ ] Teléfono: Consistente en todas las plataformas
- [ ] Horarios idénticos

### 5.3 Local Citations

| Directorio | Monterrey | Saltillo | Aguascalientes | SLP |
|------------|-----------|----------|----------------|-----|
| Google Business | ✅ | ✅ | ✅ | ✅ |
| Bing Places | ✅ | ✅ | ✅ | ✅ |
| Yelp | ✅ | | | |
| Paginas Amarillas | ✅ | ✅ | ✅ | ✅ |
| Directorio industrial | ✅ | ✅ | | |

---

## 6. PERFORMANCE

### 6.1 Core Web Vitals Targets

| Métrica | Target | Status |
|---------|--------|---------|
| LCP | < 2.5s | [ ] |
| INP | < 200ms | [ ] |
| CLS | < 0.1 | [ ] |

### 6.2 Speed Optimizations

- [ ] Imágenes en WebP (comprimir al 80%)
- [ ] Lazy loading para imágenes below the fold
- [ ] Preload de fuentes Montserrat + Open Sans
- [ ] Minificar CSS y JavaScript
- [ ] Enable browser caching ( cache headers)
- [ ] Gzip compression en servidor
- [ ] Critical CSS inline, rest deferred

### 6.3 Mobile

- [ ] Responsive design (no m. subdomain)
- [ ] Tap targets > 48px
- [ ] Viewport configured
- [ ] No horizontal scroll
- [ ] Same content desktop mobile

---

## 7. PROGRAMMATIC SEO PAGES

### 7.1 Estructura de URLs

```
/renta-montacargas-{ciudad}/
/renta-montacargas-{ciudad}-{tipo}/
/montacargas-{industria}-{ciudad}/
```

### 7.2 Checklist por Página Programática

- [ ] Título único con {ciudad} + keyword
- [ ] Meta description única
- [ ] H1 con {ciudad}
- [ ] Content único (no duplicate)
- [ ] Schema LocalBusiness para {ciudad}
- [ ] FAQ schema local
- [ ] Internal links a páginas relacionadas
- [ ] Imagen con alt text contextual

### 7.3 Template de Contenido

```html
<!-- Title -->
<title>Renta de Montacargas en {Ciudad} | {Proveedor}</title>

<!-- Meta -->
<meta name="description" content="Renta de montacargas en {Ciudad}. {Característica única}. Mantenimiento incluido. Cobertura: {ciudades}. Cotiza ahora.">

<!-- H1 -->
<h1>Renta de Montacargas en {Ciudad}</h1>

<!-- Content sections -->
<h2>¿Por qué elegirnos en {Ciudad}?</h2>
<h2>Tipos de Montacargas Disponibles</h2>
<h2>Industrias que Servimos en {Ciudad}</h2>
<h2>Preguntas Frecuentes de {Ciudad}</h2>
```

---

## 8. INTERNAL LINKING

### 8.1 Link Architecture

- [ ] Homepage → Todas las secciones principales
- [ ] Nav: 7 items máximo
- [ ] Footer: Links a todas las páginas importantes
- [ ] Breadcrumbs en todas las páginas

### 8.2 Anchor Text Guidelines

| ✅ Good | ❌ Bad |
|---------|--------|
| "Renta de montacargas en Monterrey" | "Click aquí" |
| "Montacargas eléctricos para bodega" | "Más información" |
| "Cotizador de precios" | "Ver más" |

### 8.3 Cross-linking

- [ ] Páginas de flota → Páginas de servicios
- [ ] Páginas de cobertura → Cotizador
- [ ] Blog posts → Páginas de producto
- [ ] FAQ → Páginas de servicio relacionadas

---

## 9. CONTENT CHECKLIST

### 9.1 Homepage

- [ ] Propuesta de valor clara
- [ ] CTA principal (Cotizador)
- [ ] 3 diferenciadores mencionados
- [ ] Cobertura 4 ciudades visible
- [ ] Testimonio o caso de éxito
- [ ] Datos de contacto
- [ ] WhatsApp CTA flotante

### 9.2 Páginas de Servicio

- [ ] Descripción del servicio
- [ ] Beneficios incluidos
- [ ] Precios de referencia (o "Cotiza para precio exact")
- [ ] Proceso de contratación
- [ ] CTA a cotizador
- [ ] FAQ del servicio

### 9.3 Páginas de Flota

- [ ] Especificaciones técnicas completas
- [ ] Fotos de cada equipo
- [ ] Capacidad de carga
- [ ] Tipo de alimentación (eléctrico/diesel)
- [ ] Applicaciones ideales
- [ ] CTA a cotizador

### 9.4 Cotizador Page

- [ ] Formulario claro (3 steps)
- [ ] Progress indicator
- [ ] Campos requeridos marcados
- [ ] Privacidad de datos clara
- [ ] CTA final prominente

---

## 10. IMPLEMENTATION PRIORITY

### Prioridad 1 (Crítico - Antes de Lanzar)

- [ ] SSL certificate
- [ ] Canonical tags
- [ ] Meta titles y descriptions únicos
- [ ] Schema LocalBusiness por ciudad
- [ ] Schema Service
- [ ] Google Business Profile (4 ciudades)
- [ ] Mobile responsive

### Prioridad 2 (Alta - Primera Semana)

- [ ] XML sitemap
- [ ] Robots.txt
- [ ] FAQ schema
- [ ] Schema Product para venta
- [ ] NAP consistency check
- [ ] Image optimization

### Prioridad 3 (Media - Primer Mes)

- [ ] Programmatic SEO pages (50+)
- [ ] Blog con 5 posts iniciales
- [ ] Internal linking optimization
- [ ] Core Web Vitals optimization
- [ ] Local citations

### Prioridad 4 (Optimización - Mes 2+)

- [ ] Analytics tracking completo
- [ ] UTM parameters para campañas
- [ ] A/B testing de CTAs
- [ ] Content refresh calendar
- [ ] Link building strategy

---

## HERRAMIENTAS DE VERIFICACIÓN

| Check | Herramienta |
|-------|-------------|
| Schema markup | Google Rich Results Test |
| Meta tags | Meta SEO Inspector |
| Sitemap | Google Search Console |
| Mobile | Mobile-Friendly Test |
| Speed | PageSpeed Insights |
| Indexación | site:tudominio.com |
| Links rotos | Screaming Frog (version free) |

---

*SEO Audit Checklist creado: Mayo 2026*
*Versión 1.0*
*Para implementación en sitio nuevo*

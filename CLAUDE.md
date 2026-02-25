# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GVolts Astro is a professional services website for a company offering fire alarm systems, security/surveillance solutions, and electrical services. Built with Astro 5 using server-side rendering (SSR) and deployed to Hostinger via Dokploy.

## Technology Stack

- **Framework**: Astro 5.15+ (SSR mode with Node.js adapter)
- **Styling**: Tailwind CSS 4.1+ (via Vite plugin)
- **Icons**: Lucide Astro 0.561+ (direct imports for static icons)
- **Database**: Supabase (for newsletter subscriptions)
- **Animation**: GSAP 3.13+
- **Package Manager**: pnpm 10.24+
- **Deployment**: Hostinger with Dokploy (Docker containers)
- **Email**: Resend API for transactional emails

## Development Commands

All commands use pnpm (required):

- `pnpm dev` - Start dev server at localhost:4321
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview production build locally
- `pnpm start` - Start production server (runs dist/server/entry.mjs)


## Styling Patterns

- **Tailwind CSS 4**: Uses the new Vite plugin integration (not PostCSS)
- **Fonts**:
  - Roboto Mono (primary monospace font)
  - Variable font format loaded locally from `/public/fonts/`
  - Configured with `font-display: swap` for optimal performance
  - Defined in `src/styles/global.css` using `@font-face`
- **Responsive**: Mobile-first approach, test all changes across breakpoints
- **Components**: Self-contained styling within Astro components


## Performance Optimization

The project implements several critical performance optimizations to achieve Lighthouse scores of 85-95:



## Key Conventions

1. **Path Aliases**: Always use `@/` imports for src files (e.g., `@/components/Hero.astro`)
2. **Content-Driven**: Service pages pull from JSON; update content there, not in components
3. **SSR by Default**: Pages are server-rendered; use client directives sparingly
4. **SEO Ready**: Layout.astro handles meta tags, OG images, Twitter cards
5. **Validation**: Use Zod schemas in Actions for type-safe form handling
6. **Error Handling**: Services return `{success, error, message}` pattern

## Adding New Service Pages

1. Add service content to `src/data/services-content.json` following existing structure
2. Create page file in `src/pages/services/[service-name].astro`
3. Import and render appropriate components with content props
4. **Optimize and add images**:
   - Convert large images (>200KB) to WebP format
   - Use online tools like Squoosh or sharp library
   - Keep original formats as fallback
   - Add both to `public/img/gvolts/`
   - Use `<picture>` element with WebP + fallback
5. Update navigation if needed in Header.astro

### Image Optimization Workflow

For new images:
```bash
# Install sharp temporarily (if needed)
pnpm add -D sharp

```

## Working with Components

- **Astro components** (`.astro`) are the default choice
- Use `<script>` tags for client-side interactivity (avoid framework components unless necessary)
- GSAP animations are available for advanced effects
- Props are typed via TypeScript interfaces in component frontmatter

## Icons Pattern

The project uses **Lucide icons exclusively** for all iconography:

### Direct Lucide Imports (Preferred for Static Icons)


**When to use:**
- Component structure is fixed (not data-driven)
- Icon names are known at build time
- Performance is critical (Header, Footer, Contact pages)

**Benefits:**
- Tree-shaking: Only imports icons you use
- Type-safe: TypeScript autocomplete and validation
- Better performance: Direct component usage
- Smaller bundle size


**When to use:**
- Icon names come from JSON data or props
- Need to render icons dynamically based on data
- Content managed by non-developers


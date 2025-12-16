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

## Architecture

### SSR Configuration

The project uses Astro's server-side rendering with the Node.js adapter (astro.config.mjs):
- Output mode: `server`
- Adapter: `@astrojs/node` in standalone mode
- Path alias `@` resolves to `./src`
- Vite configured with Tailwind plugin and optimized file watching
- Custom integration to copy email templates to dist/emails on build

### Project Structure

```
src/
├── actions/          # Astro Actions for form handling
│   ├── index.ts      # Action exports
│   └── subscription.ts # Newsletter subscription action
├── components/       # Reusable Astro components
├── data/            # Static JSON content files
│   ├── services-content.json    # Service page content (fire-alarm, security, electricity)
│   ├── fire-alarm-content.json
│   ├── security-content.json
│   ├── electricity-content.json
│   └── socials.ts
├── layouts/         # Layout wrapper components
│   └── Layout.astro # Base layout with SEO meta tags
├── pages/           # File-based routing
│   ├── index.astro
│   ├── contact.astro
│   ├── projects.astro
│   └── services/    # Service detail pages
│       ├── fire-alarm.astro
│       ├── security.astro
│       └── electricity.astro
├── services/        # Business logic layer
│   └── subcribe.ts  # Supabase subscription handler
├── supabase.ts      # Supabase client initialization
└── styles/
    └── global.css   # Tailwind directives and global styles
```

### Content Architecture

Service pages use a centralized JSON content system:
- **services-content.json** contains comprehensive structured content for all service pages
- Each service (fire-alarm, security, electricity) has sections: hero, introduction, features, process, benefits, CTA
- Components consume this JSON to render consistent, maintainable service pages
- This pattern ensures content updates don't require component changes

### Astro Actions Pattern

Form submissions (like newsletter) use Astro's Actions API:
1. Define action in `src/actions/index.ts` with Zod schema validation
2. Business logic in `src/services/` (e.g., `subcribe.ts`)
3. Actions handle validation, error handling, and return typed responses
4. Forms in components call actions client-side

Example flow:
```
Component → Action (validation) → Service (business logic) → Supabase
```

### Supabase Integration

Environment variables required (see .env.example):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Anon/public key

The `supabase.ts` client is initialized once and imported where needed. Newsletter subscriptions save to a `subscriber` table with duplicate email handling (error code 23505).

## Styling Patterns

- **Tailwind CSS 4**: Uses the new Vite plugin integration (not PostCSS)
- **Fonts**:
  - Roboto Mono (primary monospace font)
  - Variable font format loaded locally from `/public/fonts/`
  - Configured with `font-display: swap` for optimal performance
  - Defined in `src/styles/global.css` using `@font-face`
- **Responsive**: Mobile-first approach, test all changes across breakpoints
- **Components**: Self-contained styling within Astro components

## Page Composition

Pages follow a component-stack pattern (see index.astro):
```astro
<Layout title="...">
  <Header />
  <Hero />
  <Partners />
  <Features />
  <!-- ... more sections -->
  <Footer />
  <ScrollToTop />
</Layout>
```

Components are purely presentational and composed vertically in page files.

## Performance Optimization

The project implements several critical performance optimizations to achieve Lighthouse scores of 85-95:

### Image Optimization

**WebP Format with Fallbacks:**
- All hero images converted to WebP format for 70-90% size reduction
- Use `<picture>` elements with WebP source + PNG/JPG fallback
- Critical images (e.g., `planing-project.png`): 1.46MB → 0.11MB (92.6% reduction)

Example pattern:
```astro
<picture>
  <source srcset="/img/gvolts/image.webp" type="image/webp" />
  <img src="/img/gvolts/image.png" alt="..." loading="lazy" />
</picture>
```

**Lazy Loading Strategy:**
- Above-the-fold images: `loading="eager"` + `fetchpriority="high"`
- Below-the-fold images: `loading="lazy"` (automatic for Partners, Features, Projects, etc.)
- Hero slider: First image eager, remaining images lazy

### Critical Resource Preloading

Layout.astro includes preload hints for LCP optimization:
```html
<link rel="preload" href="/img/gvolts/planing-project.webp" as="image" type="image/webp" fetchpriority="high" />
<link rel="preload" href="/fonts/RobotoMono-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin />
```

### Font Loading

- Local fonts (Roboto Mono) with `font-display: swap` in global.css
- Preloaded to avoid FOUT (Flash of Unstyled Text)
- Variable font format for reduced file size

### JavaScript Optimization

- GSAP loaded lazily via dynamic imports (`await import('gsap')`)
- ScrollTrigger only imported when needed
- Component scripts scoped and defer-loaded automatically by Astro

### Expected Metrics

- **LCP (Largest Contentful Paint)**: ~1.2-1.8s (target: < 2.5s)
- **FCP (First Contentful Paint)**: ~0.6-0.9s
- **Speed Index**: ~1.2-1.6s
- **TBT (Total Blocking Time)**: 0ms
- **CLS (Cumulative Layout Shift)**: < 0.01

## Deployment

- **Platform**: Hostinger with Dokploy
- **Container**: Docker-based deployment using Dockerfile
- **Build command**: `pnpm run build`
- **Start command**: `pnpm start` (runs Node.js standalone server)
- **Port**: Configured via environment variable (default 4321)
- **Environment variables**:
  - `SUPABASE_URL` - Supabase project URL
  - `SUPABASE_KEY` - Supabase anon/public key
  - `RESEND_API_KEY` - Resend API key for emails

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

# Create optimization script or use online tools
# Recommended: https://squoosh.app or https://tinypng.com

# Target sizes:
# - Hero images: WebP < 150KB
# - Section images: WebP < 100KB
# - Thumbnails: WebP < 50KB
```

## Working with Components

- **Astro components** (`.astro`) are the default choice
- Use `<script>` tags for client-side interactivity (avoid framework components unless necessary)
- GSAP animations are available for advanced effects
- Props are typed via TypeScript interfaces in component frontmatter

## Icons Pattern

The project uses **Lucide icons exclusively** for all iconography:

### Direct Lucide Imports (Preferred for Static Icons)

For hardcoded icons in components, use direct imports from `@lucide/astro`:

```astro
---
import { Phone, Mail, ShieldCheck, Flame } from '@lucide/astro';
---

<Phone size={24} />
<Mail size={16} class="text-indian-red-500" />
<ShieldCheck size={20} strokeWidth={2.5} />
```

**When to use:**
- Component structure is fixed (not data-driven)
- Icon names are known at build time
- Performance is critical (Header, Footer, Contact pages)

**Benefits:**
- Tree-shaking: Only imports icons you use
- Type-safe: TypeScript autocomplete and validation
- Better performance: Direct component usage
- Smaller bundle size

**Common Icon Mappings:**
- `Phone` - Phone numbers, contact info
- `Mail` - Email addresses
- `MapPin` - Locations, addresses
- `ShieldCheck` - Security, certifications
- `Flame` - Fire alarm services
- `Camera` - Surveillance, security cameras
- `Cctv` - CCTV cameras, surveillance
- `Zap` - Electricity, lightning
- `Check` / `CheckCircle` - Confirmations, checkmarks
- `ChevronDown` / `ChevronUp` - Dropdowns, scroll buttons
- `Home` / `Building2` - Residential/commercial services
- `HelpCircle` - FAQs, help sections
- `Lightbulb` - Electrical, ideas
- `ArrowRight` / `ArrowUp` - CTAs, navigation
- `Rocket` - Speed, fast service
- `Brain` - AI, intelligence
- `Shield` - Protection, security
- `Wrench` - Tools, maintenance
- `Heart` / `HeartPulse` - Care, monitoring
- `Ruler` - Design, planning
- `Settings` - Configuration
- `Video` / `Play` - Media, video
- `Eye` - Visibility, detection
- `FileText` - Documents
- `Headphones` - Support

### Icon.astro Component (For Dynamic Icons)

For data-driven components where icon names come from JSON/props, use `Icon.astro`:

```astro
---
import Icon from "@/components/Icon.astro";

const features = [
  { icon: "Rocket", title: "Fast Installation" },
  { icon: "Brain", title: "AI Monitoring" }
];
---

{features.map(f => (
  <div>
    <Icon name={f.icon} size={24} />
    <h3>{f.title}</h3>
  </div>
))}
```

**When to use:**
- Icon names come from JSON data or props
- Need to render icons dynamically based on data
- Content managed by non-developers

**Components using Icon.astro:**
- `Hero.astro` - Badge and CTA icons from heroData
- `Features.astro` - Feature icons from array
- `Benefits.astro` - Benefit icons from data
- `HowToWork.astro` - Process step icons (server-side only, client uses `lucide` package)
- `ImageSection.astro` - Dynamic icon props
- `CTAButton.astro` - Icon prop for reusable button

**Icon Aliases:**
- `rocket-fast` → `Rocket`
- `brain-ai` → `Brain`
- `shield-heart` → `Shield`
- `tools-wrench` → `Wrench`
- `forward` → `ArrowRight`
- `eye` → `Eye`
- `tool` → `Wrench`

### Client-Side Dynamic Icons

For components that need to update icons dynamically on the client (like `HowToWork.astro` with tabs), use the `lucide` package:

```typescript
import * as lucide from 'lucide';

const iconComponents = {
  flame: lucide.Flame,
  ruler: lucide.Ruler,
  // ... more mappings
};

function createIcon(iconName: string, size = 24) {
  const IconComponent = iconComponents[iconName];
  const iconElement = IconComponent.createElement();
  iconElement.setAttribute('width', size.toString());
  iconElement.setAttribute('height', size.toString());
  return iconElement;
}
```

### Adding New Icons

1. Browse available icons at [lucide.dev](https://lucide.dev)
2. **For static icons**: Import from `@lucide/astro` and use directly
3. **For dynamic icons**:
   - Add to `Icon.astro` iconMap for server-side rendering
   - Add to client script's iconComponents for client-side updates
4. Update CLAUDE.md with new icon mappings

## Database Schema

The `subscriber` table in Supabase:
- `email` (text, unique, primary key)
- Duplicate inserts return error code `23505` (handled in `subcribe.ts`)

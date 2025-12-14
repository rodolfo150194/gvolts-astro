# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GVolts Astro is a professional services website for a company offering fire alarm systems, security/surveillance solutions, and electrical services. Built with Astro 5 using server-side rendering (SSR) and deployed to Netlify.

## Technology Stack

- **Framework**: Astro 5.15+ (SSR mode with Netlify adapter)
- **Styling**: Tailwind CSS 4.1+ (via Vite plugin)
- **Icons**: Lucide Astro 0.561+ (direct imports for static icons)
- **Database**: Supabase (for newsletter subscriptions)
- **Animation**: GSAP 3.13+
- **Package Manager**: pnpm 10.24+
- **Deployment**: Netlify (serverless functions via esbuild)

## Development Commands

All commands use pnpm (required):

- `pnpm dev` - Start dev server at localhost:4321
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview production build locally

## Architecture

### SSR Configuration

The project uses Astro's server-side rendering with the Netlify adapter (astro.config.mjs):
- Output mode: `server`
- Path alias `@` resolves to `./src`
- Vite configured with Tailwind plugin and optimized file watching

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
  - Science Gothic (primary brand font)
  - JetBrains Mono & Roboto Mono (monospace variants)
  - Loaded via Google Fonts with preconnect optimization
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

## Deployment

- **Platform**: Netlify with serverless functions
- **Build command**: `pnpm run build` (defined in netlify.toml)
- **Publish directory**: `dist`
- **Functions bundler**: esbuild
- **Environment variables**: Set SUPABASE_URL and SUPABASE_KEY in Netlify dashboard

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
4. Add service-specific images to `public/img/gvolts/`
5. Update navigation if needed in Header.astro

## Working with Components

- **Astro components** (`.astro`) are the default choice
- Use `<script>` tags for client-side interactivity (avoid framework components unless necessary)
- GSAP animations are available for advanced effects
- Props are typed via TypeScript interfaces in component frontmatter

## Icons Pattern

The project uses a hybrid icon system to balance flexibility and performance:

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
- `Zap` - Electricity, lightning
- `Check` / `CheckCircle` - Confirmations, checkmarks
- `ChevronDown` / `ChevronUp` - Dropdowns, scroll buttons
- `Home` / `Building2` - Residential/commercial services
- `HelpCircle` - FAQs, help sections
- `Lightbulb` - Electrical, ideas
- `ArrowRight` - CTAs, navigation

### Icon.astro Component (For Dynamic Icons)

For data-driven components where icon names come from JSON/props, use `Icon.astro`:

```astro
---
import Icon from "@/components/Icon.astro";

const features = [
  { icon: "rocket-fast", title: "Fast Installation" },
  { icon: "brain-ai", title: "AI Monitoring" }
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
- Need custom SVG icons not in Lucide
- Content managed by non-developers

**Components using Icon.astro:**
- `Hero.astro` - Badge and CTA icons from heroData
- `Features.astro` - Feature icons from array
- `Benefits.astro` - Custom icons (rocket-fast, brain-ai, shield-heart, tools-wrench)
- `ImageSection.astro` - Dynamic icon props
- `CTAButton.astro` - Icon prop for reusable button

**Custom Icon Names (in sprite.svg):**
- `rocket-fast` - Speed, fast service
- `brain-ai` - AI, intelligence
- `shield-heart` - Protection with care
- `tools-wrench` - Maintenance, tools
- `eye` - Visibility, detection
- `tool` - Installation, technical work
- `forward` - Progress, next steps
- `play` - Video, media

### Adding New Icons

**For Lucide Icons:**
1. Browse available icons at [lucide.dev](https://lucide.dev)
2. Import the icon component: `import { IconName } from '@lucide/astro'`
3. Use directly: `<IconName size={20} />`

**For Custom Icons:**
1. Add SVG to `public/sprite.svg` with unique `id`
2. Use via Icon component: `<Icon name="custom-icon-id" size={24} />`
3. Update iconNames mapping in component if needed

### Migration Notes

Most components have been migrated to direct Lucide imports:
- ✅ Header, Footer, ContactForm
- ✅ ScrollToTop, HowToWork
- ✅ Certifications, FAQs, Contact
- ✅ Service pages (fire-alarm, security, electricity)
- ❌ Hero, Features, Benefits (use dynamic icons from data)

## Database Schema

The `subscriber` table in Supabase:
- `email` (text, unique, primary key)
- Duplicate inserts return error code `23505` (handled in `subcribe.ts`)

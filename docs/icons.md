# GVolts Control Room — Icon inventory

Icons found across the 11 artboards of the "GVolts Redesign" canvas
(https://claude.ai/artifact/AqCEusSzvYRLjc3f2Tohok). Grouped by page/component.
Project uses **Lucide Astro** with direct imports (see CLAUDE.md). Only icons marked
**needs custom generation** should go through the icon-generation skill — everything
else should be a direct Lucide import, no generation needed.

Not included here: illustrated UI diagrams that are not single icons (breaker-panel
switches, camera-viewer overlays, floor-plan room markers, zone LEDs, the 3D digital
twin on Home). Those are bespoke component graphics built with divs/SVG primitives,
not icon assets.

## Brand

| Slug | Description | Used in | Source |
|---|---|---|---|
| `brand-mark` | GVolts bolt-in-square logo mark (used in Nav, and as the giant ghost wordmark in Footer) | Nav, Footer | **needs custom generation** — this is brand identity, not a generic icon |

## Nav / Footer (shared components)

| Slug | Description | Used in | Source |
|---|---|---|---|
| `arrow-right` | Inline `→` arrow on CTA buttons/links (currently plain text glyph, not svg) | Nav, Footer, every page CTA | Lucide `ArrowRight` (optional upgrade from text glyph) |

## Home (Main.dc.html)

| Slug | Description | Used in | Source |
|---|---|---|---|
| none (all custom graphics) | Hero uses a bespoke 3D "digital twin" floor-plan illustration (zones, pulses, sweep radar) — not icon-shaped | Home hero | **needs custom generation** if we want a static/simplified SVG version for non-JS fallback; otherwise build in-component |

## FireAlarm.dc.html (+ FireAlarmSim variant)

| Slug | Description | Used in | Lucide equivalent |
|---|---|---|---|
| `shield-check` | Certification / compliance check | Intro checklist, Benefits ("Garantía total") | `ShieldCheck` — use Lucide directly |
| `clock` | Fast installation / response time | Intro checklist | `Clock` — use Lucide directly |
| `headset` | 24/7 monitoring support | Intro checklist | `Headset` — use Lucide directly |
| `building-2` | Commercial industry (office windows grid) | Applications grid | `Building2` — use Lucide directly |
| `factory` | Industrial industry | Applications grid | `Factory` — use Lucide directly |
| `home` | Residential industry | Applications grid | `Home` — use Lucide directly |
| `hospital` | Institutional industry (hospitals/schools/hotels) | Applications grid | `Hospital` — use Lucide directly |
| `award` | Certified experience benefit | Benefits grid | `Award` — use Lucide directly |
| `zap` | Ultra-fast response benefit | Benefits grid | `Zap` — use Lucide directly |
| `wrench` | Lifetime support benefit | Benefits grid | `Wrench` — use Lucide directly |
| `trending-up` | Proven ROI benefit | Benefits grid | `TrendingUp` — use Lucide directly |
| `leaf` | Sustainable technology benefit | Benefits grid | `Leaf` — use Lucide directly |
| `check` | Success checkmark (contact-confirmation reuse, alarm reset icon) | Sim panel / confirmation states | `Check` — use Lucide directly |

## Security.dc.html

| Slug | Description | Used in | Lucide equivalent |
|---|---|---|---|
| `sparkles` | AI pattern-learning | Intro checklist | `Sparkles` — use Lucide directly |
| `smartphone` | Mobile app control | Intro checklist, Ecosystem diagram center | `Smartphone` — use Lucide directly |
| `cloud` | Redundant local + cloud storage | Intro checklist | `Cloud` — use Lucide directly |
| none (custom) | Camera viewer AI overlay (bounding boxes, virtual tripwire) | Hero camera viewer | build in-component, not an icon |
| none (custom) | Orbit/ecosystem diagram (concentric rings + nodes) | Ecosystem section | build in-component, not an icon |

## Electricity.dc.html

| Slug | Description | Used in | Lucide equivalent |
|---|---|---|---|
| `zap` | Master electrician license highlight | Intro checklist | `Zap` (reuse) |
| `shield-check` | $2M liability insurance | Intro checklist | `ShieldCheck` (reuse) |
| `leaf` | Energy-efficiency specialists | Intro checklist | `Leaf` (reuse) |
| `car-charging` | EV charging stations specialty | Specialties grid | **needs custom generation** — no exact Lucide match (closest is `Fuel`/`BatteryCharging`, not a car+plug combo); or approximate with `BatteryCharging` if acceptable |
| `sun-medium` | Solar-ready panel prep | Specialties grid | `Sun` — use Lucide directly |
| `factory` | Industrial installations | Specialties grid | `Factory` (reuse) |
| `lightbulb` | Emergency/exit lighting | Specialties grid | `Lightbulb` — use Lucide directly |
| `hard-hat` | Continuous safety training | Safety grid | `HardHat` — use Lucide directly |
| `flask-conical` | Exhaustive testing | Safety grid | `FlaskConical` — use Lucide directly (closest to the test-tube path used) |
| `file-check-2` | Full documentation | Safety grid | `FileCheck2` — use Lucide directly |
| `shield` | Robust insurance | Safety grid | `Shield` — use Lucide directly |

## Projects.dc.html (+ ProjectsPlanner variant)

No standalone icons — uses photo cards, category filter chips (text-only), and
the planner variant's device markers (detector/camera/reader/panel), which are
bespoke shape glyphs (circle / square / diamond / bar), not icon imports.

## About.dc.html

No standalone icons — hero photo, credential grid (text stats), phase cards.

## Contact.dc.html

| Slug | Description | Used in | Lucide equivalent |
|---|---|---|---|
| `check` | Form-submitted confirmation | Success state | `Check` (reuse) |

## Summary

- **Lucide, no generation needed**: 21 icons (shield-check, clock, headset, building-2,
  factory, home, hospital, award, zap, wrench, trending-up, leaf, check, sparkles,
  smartphone, cloud, sun-medium, lightbulb, hard-hat, flask-conical, file-check-2,
  shield)
- **Needs custom generation**: 3 (`brand-mark` logo, `car-charging` EV icon if the
  Lucide approximation isn't acceptable, and an optional static fallback for the
  Home hero digital-twin illustration)

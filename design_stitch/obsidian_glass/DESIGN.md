---
name: Obsidian Glass
colors:
  surface: '#14121d'
  surface-dim: '#14121d'
  surface-bright: '#3a3744'
  surface-container-lowest: '#0f0d18'
  surface-container-low: '#1c1a26'
  surface-container: '#201e2a'
  surface-container-high: '#2b2835'
  surface-container-highest: '#363340'
  on-surface: '#e6e0f1'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e6e0f1'
  inverse-on-surface: '#312f3b'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#f751a1'
  on-tertiary-container: '#570032'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#14121d'
  on-background: '#e6e0f1'
  surface-variant: '#363340'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The brand identity targets creative engineers, technologists, and digital artisans seeking premium editorial knowledge. It evokes focused calm, cutting-edge technical authority, and refined digital craft.

The aesthetic fuses deep space minimalism with precision glassmorphism:
- **Depth and Surface:** An infinite obsidian void overlaid with ambient chromatic light meshes and layered translucent frosted planes.
- **Atmosphere:** Controlled glowing neon gradients diffused through smoked glass, keeping reading environments immersive, distraction-free, and high-tech.
- **Structure:** Modular bento-grid layouts with generous negative space, high-precision hairline borders, and sculptural organic curves.

## Colors

The palette operates on absolute high-contrast discipline over a deep cosmic dark canvas:

- **Canvas & Neutral:** `#0b0914` (Deep obsidian violet) acts as the base dark surface. Card fills avoid opaque neutrals in favor of low-alpha frosted whites (`rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.08)`).
- **Primary (Electric Amethyst):** `#8b5cf6` drives brand recognition, key calls to action, and active state highlights.
- **Secondary (Neon Cyan):** `#06b6d4` provides high-energy contrast for engineering/tech tags, interactive accents, and code callouts.
- **Tertiary (Soft Magenta):** `#ec4899` anchors creative disciplines, sale ribbons, and gradient blends.
- **Typography & Details:**
  - Crisp Primary: `#f8fafc` (98% contrast against canvas).
  - Lavender Secondary: `#a7a3c2` (readable, calm, low visual fatigue).
  - Specular Hairline: `rgba(255, 255, 255, 0.12)` for subtle edges.

## Typography

Typography prioritizes technical legibility with an editorial polish:
- **Headings (Plus Jakarta Sans):** Generously kerned, tight tracking (`-0.02em`), geometric clarity with rounded letterforms that soften technical density.
- **Body Text (Plus Jakarta Sans):** Balanced letter-spacing and open aperture to retain optical clarity over dark glassmorphic backdrops.
- **Microcopy & Metadata (Inter):** Applied across tags, pill badges, prices, and specs for optimal baseline rendering at small optical scales.

## Layout & Spacing

The layout utilizes a structured 12-column bento-grid system for desktop and tablet, collapsing to 4 columns on mobile:
- **Desktop (1200px+):** 12 columns, `1.5rem` (24px) gutters, and `3rem` (48px) canvas margin. Bento tiles span 4, 6, 8, or 12 modules for asymmetrical, publication-grade hierarchy.
- **Tablet (768px - 1199px):** 8 columns, `1.25rem` (20px) gutters, `2rem` (32px) canvas margin. Modules adjust to 4 or 8 column spans.
- **Mobile (<768px):** 4 columns, `1rem` (16px) gutters, `1.25rem` (20px) canvas margin. Modules stack into a single linear feed.
- **Bento Flow:** Cards maintain uniform gap rhythm using `space-lg`, pairing wide horizontal showcase banners with vertical metadata panels.

## Elevation & Depth

Visual hierarchy relies on optical refraction, alpha stacking, and chromatic luminescence rather than heavy opaque drop shadows:

- **Layer 0 (Canvas):** Pure `#0b0914` background augmented with 2-3 fixed, non-scrolling radial gradients:
  - Top-left ambient blur: Amethyst (`rgba(139, 92, 246, 0.15)`), 200px blur radius.
  - Bottom-right accent blur: Neon Cyan (`rgba(6, 182, 212, 0.12)`), 240px blur radius.
- **Layer 1 (Standard Surface):**
  - Background: `rgba(255, 255, 255, 0.04)`
  - Filter: `backdrop-filter: blur(20px)`
  - Edge: `1px solid rgba(255, 255, 255, 0.10)`
  - Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.36)`
- **Layer 2 (Elevated & Hover Glass):**
  - Background: `rgba(255, 255, 255, 0.07)`
  - Filter: `backdrop-filter: blur(24px)`
  - Edge: `1px solid rgba(255, 255, 255, 0.20)`
  - Shadow: `0 12px 40px 0 rgba(0, 0, 0, 0.45), 0 0 20px 0 rgba(139, 92, 246, 0.15)`
- **Layer 3 (Floating Modals & Sheets):**
  - Background: `rgba(18, 14, 33, 0.75)`
  - Filter: `backdrop-filter: blur(32px)`
  - Edge: `1px solid rgba(255, 255, 255, 0.25)`
  - Shadow: `0 24px 64px -12px rgba(0, 0, 0, 0.65), 0 0 32px 0 rgba(139, 92, 246, 0.2)`

## Shapes

The shape system leverages organic curvature to contrast technical engineering content:
- **Base Components:** Standard inputs, buttons, and list items use `rounded-lg` (1rem / 16px).
- **Cards & Bento Units:** Major structural modules use `rounded-2xl` (1.5rem / 24px) or `rounded-3xl` (2rem / 32px) for larger displays.
- **Status & Indicators:** Metadata pills, reading-time badges, and action chips use full continuous pill borders (`rounded-full` / 9999px).

## Components

- **Buttons:**
  - *Primary Vibrant Gradient:* Linear gradient from `#8b5cf6` through `#06b6d4`, crisp `#ffffff` text, subtle inner top glow (`inset 0 1px 1px rgba(255, 255, 255, 0.4)`), and hover box-shadow with colored blur (`0 0 24px rgba(139, 92, 246, 0.45)`).
  - *Glass Secondary:* `rgba(255, 255, 255, 0.06)` background, `1px solid rgba(255, 255, 255, 0.15)`, text `#f8fafc`. Transitions to `rgba(255, 255, 255, 0.12)` on hover.
  - *Tertiary Ghost:* Transparent background, `#a7a3c2` text, `#ffffff` on hover.

- **Badges & Chips:**
  - Pill silhouette (`rounded-full`), padded `space-xs` vertical, `space-sm` horizontal.
  - Base: `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.12)`.
  - Category variant (e.g., "Web3", "Systems"): Subtle colored radial glow tint matching the category accent color (e.g., cyan fill at 10% opacity, cyan border at 30% opacity).

- **Bento E-Book Cards:**
  - Container: Frosted smoked glass (`rgba(255, 255, 255, 0.04)`), `rounded-2xl`, hairline border `rgba(255, 255, 255, 0.12)`.
  - Asset container: High-definition 3D book cover rendered over an ambient matching back-glow.
  - Micro-details: Specular gradient top-border (`linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)`).

- **Input Fields & Search:**
  - Smoked inset: `rgba(255, 255, 255, 0.03)`, `backdrop-filter: blur(12px)`.
  - Border: `1px solid rgba(255, 255, 255, 0.12)`.
  - Focus State: Border color shifts to `#8b5cf6` alongside an outer cyan/violet focus ring (`0 0 0 3px rgba(139, 92, 246, 0.25)`). Text is high-contrast `#f8fafc`.

- **Checkboxes & Radios:**
  - Base: `rgba(255, 255, 255, 0.06)`, `1px solid rgba(255, 255, 255, 0.2)`.
  - Active: Amethyst gradient fill with a crisp `#ffffff` checkmark or center pip, illuminated by an ambient `0 0 8px rgba(139, 92, 246, 0.5)` glow.

- **E-Reader Preview Modal:**
  - Full frosted overlay with ambient dark shading (`#0b0914` at 85% opacity, `blur(32px)`).
  - Floating central leaf panel with split reader pane, high contrast typography, progress bar illuminated in neon cyan (`#06b6d4`).
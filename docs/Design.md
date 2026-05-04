---
name: SashFlow ERP
colors:
  surface: '#f8faf9'
  surface-dim: '#d8dada'
  surface-bright: '#f8faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f3'
  surface-container: '#eceeed'
  surface-container-high: '#e6e9e8'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#3f4948'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f0'
  outline: '#6f7978'
  outline-variant: '#bec8c8'
  surface-tint: '#1e6868'
  primary: '#004c4c'
  on-primary: '#ffffff'
  primary-container: '#196565'
  on-primary-container: '#9be0df'
  inverse-primary: '#8ed2d2'
  secondary: '#7d4c87'
  on-secondary: '#ffffff'
  secondary-container: '#f6baff'
  on-secondary-container: '#764580'
  tertiary: '#69361c'
  on-tertiary: '#ffffff'
  tertiary-container: '#854d31'
  on-tertiary-container: '#ffc8af'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aaefee'
  primary-fixed-dim: '#8ed2d2'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#fdd6ff'
  secondary-fixed-dim: '#edb2f6'
  on-secondary-fixed: '#33033f'
  on-secondary-fixed-variant: '#63346e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#6c391f'
  background: '#f8faf9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  display-hero:
    fontFamily: Spline Sans
    fontSize: 96px
    fontWeight: '800'
    lineHeight: '0.92'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Spline Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.03em
  editorial-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-md:
    fontFamily: Spline Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  code-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  gutter: 24px
  container-padding: 24px
---

## Overview

SashFlow presents itself in two closely related visual modes. The core product is a calm, operational SaaS workspace built around clean panels, measured spacing, and muted chrome so dense business workflows stay readable. The marketing experience shifts into a more cinematic register with oversized editorial headlines, dark interstitial sections, motion-led storytelling, and a stronger sense of spectacle.

The common thread is disciplined restraint. Even when the marketing surface becomes expressive, the UI still feels product-first rather than decorative-first. Interfaces are crisp, high-contrast, and modern, with teal used as the main action color, mauve-purple as a secondary accent, and pale aqua plus warm yellow reserved for moments of emphasis.

## Colors

The primary palette is intentionally compact and semantic. Most product screens sit on near-white backgrounds with dark graphite text and subtle gray borders, allowing the system color accents to carry interaction and hierarchy without visual noise.

- **Primary:** Deep teal drives primary actions, active states, progress accents, and route feedback.
- **Secondary:** A muted mauve-purple adds range for alternate emphasis, data accents, and some module-level differentiation.
- **Accent:** Pale aqua is used sparingly for hover fills, soft highlights, and sidebar emphasis.
- **Highlight:** Warm yellow appears as a promotional or editorial accent, especially in the marketing layer.
- **Neutral surfaces:** White, off-white, and soft gray define the bulk of the application shell.
- **Dark mode and cinematic surfaces:** Dark charcoal and deep graphite are used for dark theme panels and for the marketing sections that intentionally feel more immersive.

The product prefers tonal layering over busy color stacking. A screen should usually have one dominant action color, one supporting accent, and otherwise remain neutral.

## Typography

The type system uses three distinct voices to balance brand character with operational clarity.

- **Spline Sans** is the primary identity font. It is used for major headings, hero moments, and page titles to provide a sharp, geometric confidence. It also serves as the functional typeface for UI labels and button text, where its rhythmic spacing ensures high legibility.
- **Public Sans** is the day-to-day UI workhorse. Optimized for on-screen reading, it carries body copy, cards, and dense information sets with a neutral, professional, and efficient tone.
- **Newsreader** (Editorial) appears selectively for more literary or explanatory sections such as pricing or content-led marketing moments, adding warmth and sophistication.
- **Space Grotesk** is reserved for technical or code-adjacent content where tabular precision and a slightly industrial feel are required.

Headings are usually tight-tracked and visually compact. Body text is comfortable rather than airy. Labels often trend uppercase with deliberate positive tracking in marketing contexts to create a more controlled brand rhythm.

## Layout

The layout system is based on a 4px unit with strong 8px and 24px rhythms layered on top. Product screens tend to use compact but breathable spacing: small control gaps, 16px card padding for standard units, and 24px padding for more important containers. Marketing sections open up considerably, frequently using 32px to 128px vertical spacing to create scroll-driven pacing and clear narrative beats.

Content is generally centered inside wide containers, but the application shell uses inset sidebars, cards, and dashboard grids to keep information grouped and manageable. The preferred feel is structured rather than fluid-chaotic: panels align cleanly, gutters stay consistent, and dense information is separated through grouping rather than through aggressive decoration.

## Elevation & Depth

Depth is understated in the application shell. Standard surfaces rely on low-contrast rings, borders, and soft ambient shadows rather than heavy drop shadows. Cards and dialogs feel slightly lifted, but never float dramatically.

The marketing layer uses depth differently. Instead of stacking many shadows, it creates atmosphere through dark backdrops, video overlays, gradient fades, blur, and animated reveal states. This produces visual depth without making the interface chrome feel bulky. In short: the app uses subtle containment, while the marketing pages use mood and contrast.

## Shapes

The shape language is rounded but controlled. Standard controls land around 8px to 12px radii, which keeps forms and buttons approachable without feeling soft or playful. Cards expand to 12px, 16px, and occasionally 24px radii depending on prominence. Larger marketing surfaces can stretch into more expressive radii, but they still preserve a geometric, product-oriented silhouette.

Nothing in the system should feel sharp-cornered unless it is intentionally raw or technical. At the same time, the design should avoid overly pillowy corners on ordinary app screens. The default posture is modern, precise rounding.

## Components

Buttons are direct and high-contrast. Primary actions use the teal brand color with white text. Secondary emphasis can use the mauve-purple tone, while outline and ghost styles rely on contrast, borders, and soft accent fills instead of saturated backgrounds.

Inputs are compact, lightly bordered, and visually quiet. Their role is to support productivity, not to dominate the page. Focus treatment should come from ring color and state clarity rather than from thick outlines or loud fills.

Cards are the dominant containment primitive in the SaaS product. They use white or near-white surfaces, modest radius, subtle ring definition, and restrained shadow. Featured cards, pricing blocks, and spotlight modules may increase radius and padding before they increase saturation.

Sidebars and modal surfaces are slightly separated from the main canvas using off-white or darkened neutrals, never dramatic chroma shifts. The marketing layer can diverge with charcoal canvases, blurred media backdrops, giant type, and bold sectional contrast, but call-to-action elements should still inherit the main palette so the brand reads as one system rather than two unrelated products.

## Do's and Don'ts

- Do keep the operational product shell neutral and let teal carry the primary interaction load.
- Do use Spline Sans for major headline moments and UI labels, and Public Sans for everyday body copy.
- Do preserve the contrast between the restrained app shell and the cinematic marketing sections.
- Do use soft rings, borders, and ambient shadows before introducing stronger depth effects.
- Don't flood product screens with multiple saturated accent colors at once.
- Don't make ordinary dashboard surfaces feel glassy, glossy, or excessively elevated.
- Don't use large editorial typography for dense application content where scanning speed matters more than brand drama.
- Don't mix ultra-rounded playful controls with the system's otherwise precise, structured geometry.
---
name: Ancestral Modernity
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434843'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#737872'
  outline-variant: '#c3c8c1'
  surface-tint: '#4f6354'
  primary: '#182a1d'
  on-primary: '#ffffff'
  primary-container: '#2d4032'
  on-primary-container: '#96ab99'
  inverse-primary: '#b6ccb9'
  secondary: '#00677d'
  on-secondary: '#ffffff'
  secondary-container: '#7bdffd'
  on-secondary-container: '#006277'
  tertiary: '#172b19'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c412d'
  on-tertiary-container: '#95ad93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e8d4'
  primary-fixed-dim: '#b6ccb9'
  on-primary-fixed: '#0d1f13'
  on-primary-fixed-variant: '#384b3d'
  secondary-fixed: '#b2ebff'
  secondary-fixed-dim: '#6fd4f2'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#d0e9ce'
  tertiary-fixed-dim: '#b5cdb2'
  on-tertiary-fixed: '#0c200f'
  on-tertiary-fixed-variant: '#374c38'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
  earth-charcoal: '#070F08'
  sand-stone: '#E6E6E6'
  deep-teal: '#0A4D5C'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  quote-italic:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  section-gap: 8rem
  stack-gap: 2rem
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 60px
---

## Brand & Style

This design system embodies a "Sovereign Minimalist" aesthetic. It bridges ancestral wisdom with modern leadership through a layout that prioritizes **breath, presence, and somatic rhythm**. The brand personality is soulful and grounded, yet maintains a high-fidelity, premium feel suitable for executive-level leadership performance.

The visual direction is **Minimalist with Tactile accents**. We leverage generous whitespace (negative space as a "breath") and a rhythmic vertical flow to mirror the pacing of somatic work. Transitions are intentional and slow, avoiding the frantic energy of typical SaaS platforms in favor of a guided, reflective experience.

**Key Stylistic Pillars:**
- **Rhythmic Spacing:** Large margins and intentional gaps to allow ideas to land.
- **Organic Precision:** A blend of sharp, modern grids with soft, organic textures and rounded UI elements.
- **Atmospheric Depth:** Using color and subtle blurs rather than aggressive shadows to create a sense of environment.

## Colors

The palette is rooted in Earth and Water. The primary **Forest Green (#2D4032)** provides a grounded, ancestral foundation, while the **Luminous Teal (#118FAB)** acts as a modern, energetic catalyst for action and digital interaction.

We use **Neutral (#F7F5F2)** as the primary background color—a warm, off-white that reduces eye strain and feels more organic than pure white. 

**Functional Application:**
- **Primary:** Headlines and high-importance backgrounds.
- **Secondary:** Primary CTAs and active states.
- **Tertiary:** Borders, dividers, and secondary iconography.
- **Neutral:** Page backgrounds and subtle container fills.

## Typography

The typographic pairing represents the intersection of history and clarity. **Libre Caslon Text** is used for display and headings to convey "Wisdom" and "History." Its traditional serifs provide a sense of authority and timelessness. 

**Hanken Grotesk** is the functional counterpart, used for body copy and UI labels. Its contemporary, clean geometry ensures maximum legibility and a "Modern" feel.

**Stylistic Notes:**
- **Italicized Serifs:** Use sparingly for "Guiding Questions" or philosophical callouts to emphasize the somatic and reflective nature of the content.
- **Generous Line Height:** Body text maintains a 1.6 ratio to ensure a comfortable, unhurried reading experience.
- **Uppercase Labels:** Used for navigation and small headers to provide a clear structural anchor.

## Layout & Spacing

This design system utilizes a **Fixed Grid with Fluid Breathing Room**. On desktop, content is centered within a 1200px container. The layout philosophy is built on "Vertical Momentum"—the idea that the user is guided down a path of discovery.

- **Section Spacing:** We use a massive `8rem` gap between major thematic blocks to create "air" between concepts.
- **The 12-Column Grid:** Elements should typically span 6 columns (for text blocks) or 8-10 columns (for imagery) to maintain wide margins.
- **Breakpoints:**
  - **Mobile (< 768px):** Single column, reduced section gaps (4rem), margins of 20px.
  - **Tablet (768px - 1024px):** 12-column grid, 40px margins.
  - **Desktop (> 1024px):** Full 1200px container, 60px margins.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Atmospheric Blurs** rather than traditional drop shadows.

- **Surface Levels:** 
  - **Base:** Neutral (#F7F5F2).
  - **Elevated (Cards/Modals):** Pure White (#FFFFFF) with a soft 1px border in Earth-Charcoal at 5% opacity.
- **Shadow Character:** When shadows are necessary for functional clarity (e.g., a floating CTA), they should be "Ambient"—very long blur radius (30px+), very low opacity (5%), and tinted with the Primary color (#2D4032) to feel integrated with the "ground."
- **Backdrop Blurs:** Use `blur(12px)` on navigation overlays to maintain a sense of the context "behind" the current action, reflecting the interconnected nature of the somatic work.

## Shapes

The shape language is **Rounded and Organic**. We avoid sharp 90-degree corners to keep the UI feeling "Human" and "Approachable." 

- **Standard Elements:** Buttons and Input fields use a 0.5rem (8px) radius.
- **Large Components:** Cards and Image containers use 1rem (16px) to 1.5rem (24px) for a softer, more fluid appearance.
- **Dividers:** Use soft, organic lines or the triple-asterisk (`* * *`) motif centered with generous vertical padding to denote transitions.

## Components

### Buttons
- **Primary:** Solid Forest Green (#2D4032) with White text. Rounded (8px). Subtle lift on hover.
- **Secondary:** Outlined Forest Green.
- **Tertiary (Somatic):** Luminous Teal (#118FAB) text with a Chevron-right icon. No background.

### Input Fields
- Transparent background with a bottom-border only (2px Earth-Charcoal at 10% opacity). Transitions to a 2px Teal border on focus. This mimics the "blank slate" of a journal.

### Cards
- White background, 16px corner radius, and a very light Forest Green tint in the background to separate from the main page. Used for "Training Phases" or "Service Tiers."

### Progress Indicators / Phases
- Vertical lines connecting nodes. Use Teal for active phases and Muted Green for upcoming ones.

### Quotes & Reflections
- Large, centered Caslon Italic text. Often paired with a subtle background texture (e.g., a grainy paper effect) to provide a tactile feel.

### Navigation
- Sticky header with a backdrop blur. Minimalist text links in Hanken Grotesk (Uppercase). The "logo" is a centered typographic treatment of "Ricki Reign" in Caslon.
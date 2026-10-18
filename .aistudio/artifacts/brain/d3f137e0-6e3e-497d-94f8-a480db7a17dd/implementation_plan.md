# Vivida — Swiss-Grid Astronomical Almanac & Editorial Celestial Masterplan

This plan elevates Vivida into a bespoke, designer-grade astronomical almanac and personal observatory—combining a Swiss-grid architectural ledger with an interactive astrolabe hero, custom geometric SVG celestial illustrations, a unified top bar with a persistent sky telemetry strip, and refined interactive workspaces across landing, public hubs, and authenticated views.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and aesthetic decisions incorporate your confirmed preferences from our design interview and govern the full-platform overhaul:

- **Confirmed Hero Centerpiece — Interactive Astronomical Astrolabe & Live Sky Dial**: The landing page hero will anchor around an interactive, multi-ring SVG astrolabe and live sky dial. Visitors can switch between *Natal Specimen*, *Live Tbilisi Sky*, and *Synastry Axis* modes, click any zodiac sector or planetary placement on the dial, and inspect real-time degree, house cusp, planetary ruler, and transit synthesis in an adjacent tabular ledger.
- **Confirmed Structural System — Swiss-Grid Architectural Ledger with 1px Brass & Hairline Rules**: Pages will be structured as continuous architectural ledgers with exposed `1px` structural rules (`#222634` and calibrated `#D4AF37` brass accents), subtle intersection crosshair markers, numbered index rails (`01`, `02`, `03`), and zero nested card-in-card clutter.
- **Confirmed Navigation Architecture — Unified Top Bar + Persistent Context Strip + Slide-Over Drawer**: Both public hubs and authenticated workspaces will share a disciplined 3-zone top bar paired with a secondary *Celestial Context Strip* (live solar/lunar telemetry, section breadcrumb, and a smooth slide-over observatory drawer for rapid tool switching).
- **Confirmed Full-Platform Visual Scope**: Deep structural and interactive upgrades across (1) Landing Page & Conversion Funnel, (2) Bespoke SVG Celestial & Lunar Glyphs (replacing generic OS emojis), (3) Tarot, Moon Calendar, and Numerology Interactive Hubs, and (4) Authenticated Observatory Dashboard, Natal Chart Report, and Synastry Workspace.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms Vivida from a standard web app into a tactile, instrument-grade astronomical publication and personal psychological observatory in both Georgian (`ka`) and English (`en`).
- **Target Audience / Persona**: Discerning readers and astrology/psychology enthusiasts who expect the typographic authority of a museum monograph paired with the interactive precision of an astronomical observatory.
- **Key Value**: Immediate visual credibility and tactile engagement—visitors can interact with a live astrolabe right on the landing page, read clean tabular ephemeris data without visual noise, and move effortlessly between public almanac tools and their personal natal workspace.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Landing & Interactive Astrolabe Discovery**:
   - The visitor lands on a full-viewport Swiss-grid hero ledger split into an editorial proposition column on the left and the **Interactive Astrolabe & Sky Dial Console** on the right, underpinned by a 4-column astronomical telemetry ribbon.
   - Clicking any planet or zodiac sign on the astrolabe ring highlights its geometric chord and updates the specimen readout panel with exact arc-minutes, house placement, and elemental balance.
   - Below the fold, asymmetric bento matrices, an interactive compatibility preview calculator, numbered methodology chapters, and a transparent credit/tier comparison matrix guide the visitor toward chart creation.
2. **Unified Navigation & Slide-Over Observatory Drawer**:
   - The primary top bar strictly honors the 3-Zone Contract: Brand Wordmark (left), 5 single-line navigation links (center), and Primary Action / Account Menu (right).
   - Directly below sits a compact `36px` **Celestial Context Strip** displaying current date (`UTC+4`), live Moon phase & zodiac sign with a custom SVG lunar disc, contextual breadcrumb, and an *"All Instruments"* trigger that opens a smooth slide-over architectural drawer containing all observatory tools, assessments, and almanac directories.
3. **Interactive Public Hubs (Tarot, Moon Calendar, Numerology, Horoscope)**:
   - **Tarot Studio**: Features custom geometric SVG card backs with engraved brass filigrees, an interactive 3-card spread mat (*Root · Present · Path*), smooth card flip reveals, and an inline follow-up consultation thread.
   - **Moon Ephemeris Calendar**: Replaces OS moon emojis with bespoke SVG illuminated lunar phase discs rendered accurately for all 8 phases, an interactive 30-day ephemeris matrix, and an annual New/Full Moon ledger.
   - **Numerology Almanac**: Provides an interactive Life Path calculator that displays the mathematical digit-reduction steps in tabular monospace alongside a 12-archetype Swiss grid.
4. **Authenticated Personal Observatory (Dashboard, Natal Chart, Synastry)**:
   - **Dashboard**: Opens with the user's *Primary Natal Axis (Big Three)* in a 3-column architectural ledger, followed by an asymmetric 8/4 split housing the *Daily Ritual & Transit Synthesis* on the left and a sticky *Live Lunar Telemetry & Ephemeris Card* on the right.
   - **Natal Chart Report**: Pairs the interactive SVG Natal Chart Wheel with a sticky underline chapter bar, a full planetary positions and house cusps ledger, an interactive aspect filter matrix, and collapsible editorial interpretation chapters.
   - **Synastry Workspace**: Organizes partner profiles and relationship compatibility breakdowns into clean comparative ledgers with aspect orb readouts.

### Visual Identity & Theme

- **Aesthetic Direction**: *Swiss-Grid Astronomical Almanac & Editorial Celestial*—combining museum-grade editorial typography with precision astronomical instrumentation.
- **Color Palette & 60-30-10 Distribution**:
  - **60% Dominant Canvas (`--background`)**: Deep Obsidian Ink (`#090A0F`)—a rich, low-saturation night-sky slate that makes fine brass lines and warm ivory typography pop with effortless contrast.
  - **30% Structural Surfaces (`--card`, `--secondary`, `--border`)**: Matte Observatory Charcoal (`#10131C`), Elevated Slate (`#161A26`), and crisp `1px` structural hairlines (`#232838`) with subtle brass-tinted rule accents (`rgba(212, 175, 55, 0.22)`).
  - **10% Calibrated Accents (`--primary`, `--accent`)**: Astrolabe Brass (`#D4AF37`) for primary interactive triggers, active indicators, and key astronomical coordinates; Celestial Silver (`#94A3B8`) for secondary telemetry; and semantic elemental tones (Solar Amber, Terra Sage, Aether Silver, Abyssal Indigo).
- **Typography & Hierarchy (The 2+1 Font Rule)**:
  - **Display & Editorial Headings (`--font-display`)**: `Fraunces` (for Latin display headings and numerals) paired with `Noto Sans Georgian` in calibrated semibold tracking (`-0.02em`) for Georgian headlines, always constrained with `text-wrap: balance`.
  - **Body Prose (`--font-sans`)**: `Noto Sans Georgian` at `15px–16px` with `1.65` line height and `65ch–72ch` optimal reading measure.
  - **Astronomical Telemetry & Ephemeris Data (`--font-mono`)**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for all degrees (`14°28′`), timestamps, house numbers, orb percentages, and numbered section indices.
- **Bespoke SVG Iconography & Zero-Pill Discipline**:
  - Custom vector SVG illustrations for the 8 lunar phases, zodiac glyphs, planetary symbols, and astrolabe reticles—eliminating generic system emojis (`🌑`, `🌕`, `✨`) from data displays.
  - Metadata is rendered as clean inline text with middle-dot (`·`) or slash (`/`) separators; interactive filters use crisp segmented control bars.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Interactive Astrolabe Console on the Landing Page**
  - *Chosen Approach*: Build an interactive client-side SVG astrolabe with clickable zodiac/planet nodes and a 3-mode selector (*Natal Specimen · Live Sky · Synastry*) directly in the hero section.
  - *Why*: Gives first-time visitors an immediate, tangible experience of Vivida's astronomical precision before they even create an account, turning a static graphic into a memorable signature interaction.
  - *Alternatives Considered*: Static illustration or video loop—passed over because interactive telemetry creates far stronger engagement and demonstrates product quality firsthand.
- **Decision 2: Unified Top Bar + Persistent Context Strip + Slide-Over Drawer**
  - *Chosen Approach*: Consolidate navigation into a clean 3-zone top bar accompanied by a `36px` persistent context bar and a slide-over observatory drawer for secondary tools, replacing fragmented navigation patterns.
  - *Why*: Preserves full `1440px` desktop horizontal width for Swiss-grid ledgers and split-screen chart inspections while keeping every tool (Dashboard, Natal Chart, Synastry, Tarot, Ask, Tests, Moon Calendar, Numerology) one click away.
  - *Alternatives Considered*: Permanent wide multi-column sidebars on every page—passed over because the user selected a unified top bar with persistent context strip and slide-over drawers for a cleaner, more architectural full-bleed grid.
- **Decision 3: Custom SVG Lunar & Celestial Geometry Over System Emojis**
  - *Chosen Approach*: Render lunar phases, zodiac symbols, and card backs using precision vector SVG geometry styled in `#D4AF37` brass and `#F4F0EA` ivory.
  - *Why*: Operating system emojis (`🌑`, `🌕`) render inconsistently across platforms and immediately break the illusion of a bespoke designer interface.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED NAVIGATION & CONTEXT SHELL                       │
│  ┌───────────────────────┬──────────────────────────┬─────────────────────┐  │
│  │ Zone 1: Brand Lockup  │ Zone 2: 5 Primary Links  │ Zone 3: Action/User │  │
│  ├───────────────────────┴──────────────────────────┴─────────────────────┤  │
│  │ Persistent Celestial Context Strip (Live Moon SVG · UTC+4 · Drawer)    │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐
│   LANDING & CONVERSION      │ │   PUBLIC ALMANAC HUBS       │ │  AUTHENTICATED OBSERVATORY  │
│                             │ │                             │ │                             │
│ ┌─────────────────────────┐ │ │ ┌─────────────────────────┐ │ │ ┌─────────────────────────┐ │
│ │ Swiss-Grid Hero Ledger  │ │ │ │ Tarot Studio            │ │ │ │ Big Three Axis Ledger   │ │
│ │  ├─ Proposition & CTA   │ │ │ │  ├─ Engraved SVG Deck   │ │ │ ├─────────────────────────┤ │
│ │  ├─ Interactive         │ │ │ │  ├─ 3-Card Spread Stage │ │ │ │ 8/4 Observatory Split   │ │
│ │  │  Astrolabe Dial      │ │ │ │  └─ Follow-up Thread    │ │ │ │  ├─ Daily Ritual &      │ │
│ │  └─ 4-Col Sky Telemetry │ │ │ ├─────────────────────────┤ │ │ │  │  Transit Breakdown   │ │
│ ├─────────────────────────┤ │ │ │ Moon Ephemeris Hub      │ │ │ │  └─ Sticky Lunar &      │ │
│ │ Asymmetric Bento Ledger │ │ │ │  ├─ SVG Lunar Phase Disc│ │ │ │     Instrument Rail     │ │
│ ├─────────────────────────┤ │ │ │  └─ 30-Day & Year Grid  │ │ │ ├─────────────────────────┤ │
│ │ Live Compatibility      │ │ │ ├─────────────────────────┤ │ │ │ Natal Chart & Synastry  │ │
│ │ Preview Calculator      │ │ │ │ Numerology Almanac      │ │ │ │  ├─ SVG Astrolabe Wheel │ │
│ ├─────────────────────────┤ │ │ │  ├─ Reduction Stepper   │ │ │ │  ├─ Positions & Houses  │ │
│ │ Numbered Chapters &     │ │ │ │  └─ 12-Archetype Grid   │ │ │ │  └─ Interactive Aspects │ │
│ │ Pricing Matrix          │ │ │ └─────────────────────────┘ │ │ └─────────────────────────┘ │
│ └─────────────────────────┘ │ └─────────────────────────────┘ └─────────────────────────────┘
```

### Interactive Component & State Mapping

- **Interactive Astrolabe & Sky Dial (`HeroPreview` + `ZodiacWheel`)**:
  - *State*: `activeMode` (`"natal"` | `"transit"` | `"synastry"`), `selectedBodyKey` (`"sun"` | `"moon"` | `"ascendant"` | `"mercury"` | `"venus"` | `"mars"`).
  - *Interaction*: Clicking a planetary node or placement row highlights the corresponding vector spoke on the SVG astrolabe wheel, animates the active reticle ring, and updates the bottom telemetry readout with exact degrees, house cusp, and interpretation.
- **Unified Top Bar, Celestial Context Strip & Slide-Over Drawer**:
  - *State*: `drawerOpen` (`boolean`), active route detection, and live client/server lunar telemetry snapshot.
  - *Interaction*: Clicking the *"Observatory Drawer / Menu"* button opens a full-height slide-over architectural panel with keyboard `Escape` support, backdrop click dismissal, and direct links to all workspace and public hubs.
- **Bespoke SVG Lunar Phase & Celestial Primitives**:
  - *Deterministic Geometry*: Accepts `phaseKey` or `illumination` (`0.0–1.0`) and renders an accurate geometric terminator curve on a brass-rimmed SVG lunar disc, used consistently across the Context Strip, Moon Calendar, and Dashboard Moon Card.
- **Tarot Reader & Spread Stage**:
  - *State*: `spreadId`, `question`, `status`, `reading`, `activeCardIndex`, `historyOpen`.
  - *Interaction*: Custom engraved SVG card backs animate into the 3-card spread slots; clicking any revealed card highlights its position breakdown; history drawer and follow-up composer maintain full idempotency and credit guardrails.

# VIBE — Distinctive Design System Specification
Inspired by TinkerHub, Make-A-Ton, and Indian Railway Transit Narratives

## 1. Executive Design Philosophy

VIBE is a voluntary, journey-scoped social connection platform for train travelers.
It combines:
1. **TinkerHub's Community Warmth**: Human-first storytelling, community badges, learning paths, friendly editorial hierarchy, and warm paper/slate contrast.
2. **Make-A-Ton's Creative Energy**: Electric accents, bold large-scale typography, asymmetric bento layouts, high-energy interactive transitions, and builder spirit.
3. **VIBE's Railway Soul**: Tracks, passing scenery, changing daylight horizons, transit lounges, station milestones, and thoughtful icebreakers that shorten long journeys.

---

## 2. Color Palette & Tokens

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `surface-canvas` | `#080C14` | Midnight ink canvas for immersive sections and dark theme |
| `surface-paper` | `#FAF8F5` | Warm off-white/paper background for editorial contrast |
| `surface-card-dark` | `#0E1726` | Deep slate card background with subtle blue undertones |
| `surface-card-light` | `#FFFFFF` | Crisp elevated paper cards |
| `accent-lime` | `#10B981` / `#22C55E` / `#84CC16` | Electric maker-lime for primary CTAs, live indicators, progress |
| `accent-violet` | `#6366F1` / `#8B5CF6` | AI match intelligence, curiosity spark, creative badges |
| `accent-amber` | `#F59E0B` | Station lights, achievements, community highlights |
| `accent-coral` | `#F43F5E` | Restrained warnings, emergency helplines, report actions |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` / `rgba(15, 23, 42, 0.08)` | Hairline dividers |

---

## 3. Typography Hierarchy

- **Display Headings**: Bold, character-rich editorial typography with controlled widths (`max-w-3xl`) and intentional line-breaks.
- **Section Markers**: Monospace uppercase index tags (`[ 01 // ONBOARDING ]`, `[ 02 // DISCOVERY ]`).
- **Body Text**: High legibility, 150% line-height, balanced contrast against dark and warm paper backgrounds.
- **Micro-labels**: Monospace badge chips with dot indicators (`sys-tag`).

---

## 4. Signature Interactive Elements

1. **Scroll-Driven Train Animation**:
   - Stylized train with locomotive and illuminated passenger coaches.
   - Railway tracks with ties and railhead highlights spanning the page.
   - Dynamic horizon that transitions from morning golden hour -> river bridge -> sunset mountains -> night canopy.
   - Interactive station markers acting as chapter waypoints.
2. **Multiplayer Travel Games**:
   - *Train Trivia Blitz*: Timed duels on heritage, engineering, and cultural lore.
   - *Station Word Chain*: Linguistic game linking verified Indian Railway station names.
   - *Tactical Rail Grid*: Quick 2-player board game with rematch and chat integration.
   - *Curiosity Roulette*: Icebreakers for travelers to break awkward silence politely.
3. **Communication-First Shell**:
   - Header with quick navigation: Home, Discover, Journey, Play, Messages, Profile.
   - Live reputation meter, active train badge, and quick QR Pass launcher.
   - Accessible emergency dialer for RailMadad 139 and Emergency 112.

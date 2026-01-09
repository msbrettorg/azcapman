# Site-Wide Style Consistency TODO

## IN PROGRESS

(none)

## Completed

- [x] **REWORK LANDING PAGE** - Restored:
  - icon-card-grid CSS layout (2x2 grid for 4 cards)
  - Original 4 cards: Forecast, Procure, Allocate, Monitor
  - scenario-section with 3-column layout
  - explore-section with 3-column layout
  - Hero section with blue background
- [x] **DESIGN POLISH** (Frontend Design Review):
  - Fixed hero h1 color (was dark, now white)
  - Changed icon-card-grid from 3-column to 2x2 layout (eliminates orphan card)
  - Increased category label font-size (11px → 12px) and letter-spacing
  - Made hero plus-pattern more visible (opacity 0.08 → 0.12)
  - Added card hover lift effect (translateY + enhanced shadow)

- [x] Extract MS Learn CSS values for alert boxes, code blocks, tables, typography
- [x] Update `templates/custom/public/main.css` with MS Learn-aligned styles
- [x] Fix dark mode CSS selector (changed from @media prefers-color-scheme to [data-bs-theme="dark"])
- [x] Style all alert types: NOTE, TIP, WARNING, IMPORTANT, CAUTION
- [x] Style code blocks and tables
- [x] Red-team security review - PASSED
- [x] Blue-team validation - PASSED

## FUCKUPS

1. Expanded landing page from 4 cards to 6 cards without authorization
2. Then reverted entire file instead of surgically fixing just the cards
3. Lost all the CSS class-based styling work on landing page

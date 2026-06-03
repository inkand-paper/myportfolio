# Portfolio — Ink & Paper

A professional portfolio website built with pure HTML, CSS, and vanilla JavaScript.

## Design System

- **Style:** Exaggerated Minimalism + Anti-Polish Raw Aesthetic
- **Palette:** Near-black (#0a0a0a) base, off-white text, acid yellow (#e8ff47) accent
- **Typography:** Space Grotesk (sans) + Space Mono (mono) — Google Fonts
- **Breakpoints:** 375 / 768 / 1024 / 1440px (mobile-first)
- **Animations:** All respect `prefers-reduced-motion`

## Structure

```
myportfolio/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/main.js
└── README.md
```

## Sections

1. **Hero** — Animated heading, stats counter, scroll indicator
2. **Marquee** — Tech stack ticker
3. **About** — Bio, tags, info card
4. **Work** — 4 project entries with hover effects
5. **Skills** — 4 capability cards
6. **Process** — 4-step workflow
7. **Testimonial** — Featured quote
8. **Contact** — Info + validated form

## Customisation

- Replace placeholder name/bio in `index.html`
- Swap `hello@inkandpaper.dev` with your real email
- Add project images: set `.project-hover-placeholder` backgrounds to actual `<img>` tags
- Add your photo inside `.about-card-image`

## Performance

- No JavaScript frameworks or CSS preprocessors
- Google Fonts loaded with `font-display: swap`
- SVG icons inline (no external icon library)
- All images lazy-loaded by default
- Intersection Observer for scroll animations (no scroll event polling)

## Accessibility

- WCAG AA colour contrast throughout
- All interactive elements keyboard navigable
- Focus rings visible on all focusable elements
- Aria labels on icon-only controls
- Form errors announced via `role="alert"`
- `prefers-reduced-motion` respected globally

# Letterflow Design System & Styling Guidelines

This document outlines the styling rules and conventions followed throughout the Letterflow project to ensure consistency and maintainability.

## Color Palette

### Primary Colors

- **Emerald**: Used for primary actions, highlights, and brand identity
  - Primary: `emerald-500` (#10B981)
  - Light: `emerald-400` (#34D399)
  - Dark: `emerald-600` (#059669)
  - Extra Dark: `emerald-700` (#047857)

### Neutral Colors

- **Slate**: Used for backgrounds, text, and containers
  - Background Dark: `slate-900` (#0F172A) to `slate-950` (#020617)
  - Container Dark: `slate-800` (#1E293B)
  - Borders: `slate-700` (#334155)
  - Text Light: `slate-300` (#CBD5E1)
  - Text Medium: `slate-400` (#94A3B8)
  - Text Muted: `slate-500` (#64748B)

### Accent & Status Colors

- Success: `green-500` (#22C55E)
- Warning: `yellow-500` (#EAB308)
- Error: `red-500` (#EF4444)
- Info: `blue-500` (#3B82F6)

## Typography

### Font Family

- Primary: Inter (Sans-serif)
- Monospace: JetBrains Mono (for code blocks)

### Font Sizes

- Headings:

  - h1: `text-4xl sm:text-5xl md:text-6xl` (mobile to desktop)
  - h2: `text-3xl md:text-4xl`
  - h3: `text-2xl md:text-3xl`
  - h4: `text-xl`
  - h5: `text-lg`
  - h6: `text-base font-semibold`

- Body:
  - Regular: `text-base` (16px)
  - Small: `text-sm` (14px)
  - Extra Small: `text-xs` (12px)
  - Large: `text-lg` (18px)
  - Extra Large: `text-xl` (20px)

### Font Weights

- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

## Spacing System

We follow the Tailwind CSS spacing scale:

- `px`: 1px
- `0.5`: 0.125rem (2px)
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `5`: 1.25rem (20px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `10`: 2.5rem (40px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)
- `20`: 5rem (80px)
- `24`: 6rem (96px)

## Borders & Shadows

### Borders

- Default: `border border-slate-700/50`
- Subtle: `border border-slate-800`
- Accent: `border border-emerald-500/20`
- Inputs: `border border-slate-700 focus:border-emerald-500/50`

### Border Radius

- None: `rounded-none`
- Small: `rounded-sm` (0.125rem)
- Default: `rounded` (0.25rem)
- Medium: `rounded-md` (0.375rem)
- Large: `rounded-lg` (0.5rem)
- Extra Large: `rounded-xl` (0.75rem)
- 2XL: `rounded-2xl` (1rem)
- Full: `rounded-full` (9999px)

### Shadows

- Subtle: `shadow-sm`
- Default: `shadow`
- Medium: `shadow-md`
- Large: `shadow-lg`
- Extra Large: `shadow-xl`
- 2XL: `shadow-2xl`
- Colored: `shadow-lg shadow-emerald-500/20`

## Layout & Containers

### Max Widths

- Default container: `max-w-7xl mx-auto px-4`
- Small: `max-w-md`
- Medium: `max-w-lg`
- Large: `max-w-xl`
- Extra Large: `max-w-5xl`

### Responsive Breakpoints

Following Tailwind CSS defaults:

- Small (sm): 640px and above
- Medium (md): 768px and above
- Large (lg): 1024px and above
- Extra Large (xl): 1280px and above
- 2XL: 1536px and above

### Grid Layouts

- Base: `grid grid-cols-1`
- Small screens: Maintain single column
- Medium screens: Consider `md:grid-cols-2`
- Large screens: Use `lg:grid-cols-12` with column spans

### Flexbox Usage

- Standard row: `flex items-center`
- Row with space between: `flex items-center justify-between`
- Column: `flex flex-col`
- Responsive: `flex flex-col sm:flex-row`

## Animation & Transitions

### Framer Motion Variants

Common animation variants are used throughout the project:

```typescript
// Container staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Item animations within containers
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};
```

### Transition Durations

- Fast: `duration-200` (200ms)
- Default: `duration-300` (300ms)
- Slow: `duration-500` (500ms)
- Very Slow: `duration-700` (700ms)

### Hover & Focus Effects

- Default: `hover:bg-slate-800`
- Accent: `hover:bg-emerald-600`
- Scale: `hover:scale-105`
- Opacity: `hover:opacity-90`

## Component-Specific Styling

### Buttons

- Primary: `bg-emerald-600 hover:bg-emerald-700 text-white`
- Secondary: `bg-slate-800 hover:bg-slate-700 text-white`
- Outline: `border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white`
- Ghost: `text-slate-400 hover:text-white hover:bg-slate-800/50`
- Sizes:
  - Small: `h-8 px-3 text-sm`
  - Default: `h-10 px-4`
  - Large: `h-12 px-6`

### Cards

- Default: `bg-slate-800 border border-slate-700/50 rounded-lg`
- Interactive: `hover:border-emerald-500/30 transition-colors`
- With shadow: `shadow-lg shadow-emerald-900/5`

### Inputs

- Default: `bg-slate-800 border border-slate-700 rounded-md px-3 py-2`
- Focus: `focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20`

## Utilities and Helper Classes

### Background Patterns & Effects

- Grid pattern: `bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]`
- Gradient overlay: `bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent`
- Glass effect: `bg-white/10 backdrop-blur-sm`

### Status Indicators

- Online: `bg-emerald-500`
- Offline: `bg-slate-500`
- Away: `bg-yellow-500`
- Busy: `bg-red-500`

## Accessibility Considerations

- Ensure text contrast meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- Include focus styles for keyboard navigation
- Use semantic HTML elements
- Provide appropriate aria attributes where needed
- Consider color-blind friendly design (don't rely solely on color to convey information)

## Dark Mode

The design system is primarily dark mode by default, with consideration for light mode alternatives:

- Dark backgrounds: `bg-slate-900` to `bg-slate-950`
- Dark surfaces: `bg-slate-800`
- Dark text: `text-white` or `text-slate-300`

## Implementation Guidelines

1. **Consistency First**: Always check existing components before creating new styling patterns
2. **Mobile-First**: Design for small screens first, then enhance for larger screens
3. **Component Composition**: Build complex UI from simple, reusable components
4. **Performance**: Use appropriate loading strategies (lazy, eager) for images and animations
5. **Responsive Design**: Test all components across multiple breakpoints

## Animation Best Practices

1. Use subtle animations that enhance UX rather than distract
2. Keep animations under 500ms for UI feedback
3. Prefer opacity and transform properties for better performance
4. Apply `will-change` only where necessary
5. Consider reduced motion preferences

# Torii Web Admin - Design System 

## Philosophy: "Professional Minimal Admin"
This design system aims for a **Premium Zen** aesthetic—clean, breathable, and highly professional. It prioritizes content clarity through subtle visual hierarchy rather than heavy "administrative" decoration.

---

## 1. Layout & Structure

### Containers
- **Cards & Content Areas**: Use `rounded-xl` or `rounded-2xl` for main content blocks.  
- **Backgrounds**: Use layers of transparency.  
  - Main background: `bg-background`
  - Secondary areas: `bg-muted/5` to `bg-muted/20`
  - **Avoid**: Solid heavy gray backgrounds for large areas.

### Spacing
- **Padding**: Be generous. Use `p-6` or `p-8` for page containers.  
- **Gap**: Use `gap-4` to `gap-6` to separate logical groups.

---

## 2. Borders & Separation

### Soft Borders
Instead of solid default borders (`border-border`), use opacity to create softness:
- **Standard**: `border border-border/50`
- **Subtle**: `border border-border/10`
- **Active/Highlight**: `border-primary/20`

### Shadows
- **Standard**: `shadow-sm` (Subtle depth)
- **Active/Floating**: `shadow-md` or `shadow-lg` (Dropdowns, modals)

---

## 3. Typography & Language

### Language
- **Vietnamese**: Use natural, professional Vietnamese.  
  - *Yes*: "Tìm kiếm theo tên hoặc email..."
  - *No*: "Search..." (Unlocalized)
- **Tone**: Polite, administrative, and clear.

### Text Hierarchy
- **Headings**: `font-bold tracking-tight text-foreground`
- **Body**: `text-sm font-medium text-foreground/80`
- **Auxiliary Labels**: `text-[10px] or text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50`
  - *Usage*: Table headers, column labels, section kickers.

---

## 4. Components

### Buttons & Inputs
- **Radius**: `rounded-lg` (Use `rounded-xl` for large featured inputs).
- **Height**: Standardize on `h-9` (Compact), `h-10` (Default), or `h-11`/`h-12` (Prominent).
- **Style**: 
  - Inputs: `bg-background border-border/50 focus-visible:ring-primary/20`
  - Secondary Buttons: `variant="ghost" hover:bg-muted/50 text-muted-foreground`
  - **Login/Auth Inputs**: `pl-10` for icon integration, `rounded-lg` for cleaner look.

### Tables
- **Header**: Transparent or very subtle background (`bg-muted/30`).
- **Cells**: `text-sm`, `py-3` or `py-4`.
- **Borders**: Horizontal dividers only (`border-b border-border/50`). Avoid vertical borders unless necessary for grouping.

### Navigation (Sidebar)
- **Active State**: `bg-primary/10 text-primary`
- **Inactive State**: `text-muted-foreground/70 hover:text-foreground`
- **Icons**: `size-4.5` or `size-5`.

---

## 5. Visual Effects

### Glassmorphism / Blur
Use sparingly to indicate depth or sticky headers:
- `backdrop-blur-xl`
- `bg-background/80`

### Animations
Use `lucide-react` + `tailwindcss-animate` for subtle entrance and interaction:
- Page Load: `animate-in fade-in duration-500`
- Hover: `transition-all duration-200`

---

## 6. Authentication Pages

### Layout
- **Split View**: Hero section (visual) + Form section (functional).
- **Typography**: Large, bold headings for welcome messages.
- **Forms**: Clean, single-column layout with clear labels and iconography.

### Form Elements
- **Icons**: Use absolute positioning for lead icons (`Mail`, `Lock`) inside inputs.
- **Feedback**: Use distinct error states (`text-rose-500`, `bg-rose-500/5`).
- **Language**: All labels, placeholders, and buttons must be in Vietnamese.

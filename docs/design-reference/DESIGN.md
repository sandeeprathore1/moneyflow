---
name: Premium Aurora Fintech
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#434655'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  accent-cyan: '#38BDF8'
  positive-emerald: '#16A34A'
  negative-red: '#EF4444'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels a crisp, minimal aesthetic rooted in Modern Corporate design principles, tailored specifically for an intelligent personal finance platform. The brand personality balances professional authority with approachable intelligence, evoking trust, clarity, and forward-thinking financial mastery. The interface relies on generous whitespace, precise alignment, and deliberate splashes of vibrant color to guide user attention through complex financial data without cognitive overload.

## Colors

The color palette is anchored by a deep navy for text and high-contrast structure, paired with a vibrant primary blue and a sophisticated secondary violet. Functional states are clearly communicated through distinct positive emerald and negative red accents. Subtle aurora gradients—merging primary blue, secondary violet, and accent cyan—are reserved exclusively for high-priority hero cards and AI-driven financial insights to create moments of delightful visual elevation.

## Typography

Typography utilizes Inter (with system fallback to SF Pro) to deliver an uncompromisingly clean, systematic, and readable text hierarchy. Scale steps are tightly controlled to maintain proportion across dense data dashboards and spacious mobile viewports alike. Numeric figures should utilize tabular lining nums wherever financial data is displayed to ensure vertical alignment in tables and lists.

## Layout & Spacing

This design system employs a strict 8pt spacing rhythm combined with a fluid grid layout model. Content adapts smoothly across devices using responsive breakpoints (Mobile: < 640px, Tablet: 640px–1024px, Desktop: > 1024px). Outer margins scale down on smaller viewports to maximize data density, while internal component padding strictly adheres to the defined space tokens to maintain visual rhythm.

## Elevation & Depth

Visual hierarchy is achieved primarily through a combination of clean surface layering and low-contrast outlines, avoiding heavy drop shadows. Surfaces elevate from the background `#F7F8FC` to pure white `#FFFFFF` cards defined by subtle borders (`#E5E7EB`). For hero cards and AI insight modules, ambient, diffused shadows tinted with primary blue at low opacities are paired with subtle aurora gradients to create a weightless, premium floated effect.

## Shapes

A balanced, rounded shape language (`2`) is utilized throughout the interface to soften the utilitarian nature of financial data. Base components feature a standard `0.5rem` border radius, while larger containers and cards scale up to `1rem` (`rounded-lg`) and `1.5rem` (`rounded-xl`). Pill shapes are reserved exclusively for status chips, tags, and primary action triggers.

## Components

### Buttons
Primary buttons utilize the solid primary blue (`#2563EB`) with white text and rounded-lg corners, featuring a subtle color shift on hover. Secondary buttons employ ghost or outlined variants with border `#E5E7EB` and deep navy text. 

### Input Fields
Inputs feature a crisp white background, `#E5E7EB` borders, and `0.5rem` corner radius. Focus states transition smoothly to the primary blue with a soft matching ring shadow. Error states invoke the negative red (`#EF4444`).

### Cards
Standard cards use pure white surfaces, subtle borders, and `1rem` corner rounding. Hero and AI insight cards may incorporate the signature aurora gradient background at low opacity or as a thin top-border accent.

### Chips & Badges
Compact pill-shaped elements used for categorization and status. Positive states use light emerald backgrounds with dark emerald text; negative states use light red with dark red text.

### Checkboxes & Radios
Clean geometric structures using primary blue for active selected states, paired with smooth micro-animations on toggle.

### Lists
Structured data rows featuring generous vertical padding, dividing lines in `#E5E7EB`, and right-aligned tabular figures for currency values.
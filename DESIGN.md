---
name: IWMS Pro
description: Tactical industrial warehouse operating system with high-precision scanability, dual light/dark mode, anti-slop clarity, and interactive 3D facility shelf gliders.
themes:
  light:
    canvas-bg: "#F8FAFC"
    surface-card: "#FFFFFF"
    surface-elevated: "#F1F5F9"
    surface-border: "#E2E8F0"
    text-primary: "#0F172A"
    text-secondary: "#475569"
    text-muted: "#64748B"
  dark:
    canvas-bg: "#090D16"
    surface-card: "#0F1524"
    surface-elevated: "#151E32"
    surface-border: "rgba(255, 255, 255, 0.08)"
    text-primary: "#F8FAFC"
    text-secondary: "#94A3B8"
    text-muted: "#64748B"
colors:
  primary-indigo: "#4F46E5"
  primary-indigo-hover: "#4338CA"
  status-emerald: "#10B981"
  status-amber: "#F59E0B"
  status-crimson: "#EF4444"
  accent-cyan: "#06B6D4"
typography:
  heading:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  data-mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  interactive-shelf-3d:
    physics: "Damped lerp glide with pointer coordinates"
    lighting: "Ambient + Key directional + Follower point light + Bin hover spotlight"
    hoverShader: "Emissive elevation & specular bloom"
---

# Design System: IWMS Pro (Anti-Slop Craft Edition)

## 1. Anti-Slop UI Principles

IWMS Pro follows uncompromising, production-grade frontend craft guidelines designed to prevent generic "AI Slop" aesthetics:
- **No decorative blur on text surfaces:** Every panel, table row, and form input provides high contrast (>= 4.5:1 text-to-background ratio).
- **No gratuitous rainbow gradients:** Functional, restrained color palette reserved for real operational semantics.
- **Strict 4px/8px layout grid:** Rhythmic, harmonious padding with breathing room between controls and data surfaces.
- **Tactile feedback:** All interactive buttons and cards provide instant 150ms state response, clear hover lifts, and subtle active depressions (`scale(0.98)`).
- **Tabular numerals:** Quantities, currency, coordinates, and timestamps strictly utilize JetBrains Mono with `font-variant-numeric: tabular-nums` to eliminate column jitter.

## 2. Dual Light and Dark Mode Color System

The application features full bidirectional theme switching with zero hardcoded visual traps:

### Dark Mode (Shift Operations)
- **Ground Canvas (`#090D16`):** Deep tactical slate foundation that minimizes eye strain in dark industrial environments.
- **Elevated Surfaces (`#0F1524` & `#151E32`):** Solid charcoal cards with refined 1px structural borders (`rgba(255, 255, 255, 0.08)`).
- **Text:** Crisp white (`#F8FAFC`) primary labels, cool slate (`#94A3B8`) secondary copy.

### Light Mode (Office & Sunlit Facility)
- **Ground Canvas (`#F8FAFC`):** Clean, architectural neutral slate-50 base.
- **Elevated Surfaces (`#FFFFFF` & `#F1F5F9`):** Pure white solid cards with subtle 1px border (`#E2E8F0`) and soft, layered shadow (`0 1px 3px rgba(0,0,0,0.05)`).
- **Text:** Deep slate-900 (`#0F172A`) primary labels, slate-600 (`#475569`) secondary copy.

## 3. Interactive 3D Smart Shelf System (`InteractiveShelf3D`)

Inspired by world-class 3D web experiences (Linear, Apple, Stripe Press, Lusion):
- **Organic Pointer Glide Physics:** The 3D warehouse rack responds dynamically to the user's mouse arrow movements. Rotation and tilt are smoothed via damping lerp calculations (`lerp factor: 0.06`), producing an organic, physical weight feel.
- **Real-Time Pointer Lighting:** A dynamic 3D follower point light tracks cursor coordinates across the metallic steel frame, casting authentic specular reflections.
- **Hover Raycasting & Emissive Glow:** Bins under the cursor smoothly lift forward along the Z-axis, illuminate their status LED strips and emissive shaders, and present a floating inspection HUD with SKU data.
- **Facility Integration:** Available in 3D Smart Shelf mode, 2D Floor Matrix mode, and Dual Spatial Twin mode on the Warehouse Floor Topology page, as well as an interactive live demo on the Landing Page.

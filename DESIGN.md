---
name: IWMS Pro
description: Tactical industrial warehouse operating system with high-precision scanability and zero cloud dependencies.
colors:
  canvas-bg: "#090D14"
  surface-card: "#0F1523"
  surface-elevated: "#151D2E"
  surface-border: "rgba(255, 255, 255, 0.08)"
  primary-indigo: "#4F46E5"
  primary-indigo-hover: "#4338CA"
  status-emerald: "#10B981"
  status-amber: "#F59E0B"
  status-crimson: "#EF4444"
  accent-cyan: "#06B6D4"
  text-primary: "#F8FAFC"
  text-secondary: "#94A3B8"
  text-muted: "#64748B"
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
  button-primary:
    backgroundColor: "{colors.primary-indigo}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-indigo-hover}"
---

# Design System: IWMS Pro

## Overview

IWMS Pro is an industrial warehouse management operating system designed for concrete tilt-up logistics centers, high-density racking facilities, and Wi-Fi dead zones. It prioritizes rapid physical floor execution (receiving, dispatch, bin-to-bin transfers), spatial awareness, and instant scanability under harsh industrial lighting.

## Colors

- **Ground Canvas (`#090D14`):** Deep tactical slate foundation that reduces glare and eye fatigue during prolonged shift operations.
- **Elevated Surfaces (`#0F1523` & `#151D2E`):** Crisp solid panels with subtle structural borders (`rgba(255, 255, 255, 0.08)`), replacing superficial glassmorphism.
- **Primary Operational Indigo (`#4F46E5`):** Reserved for primary floor actions, active navigation tabs, and system confirmations.
- **Semantic Status Signals:**
  - **Optimal / Synced (`#10B981`):** In-stock buffer satisfied, LAN connection live, zero unsynced mutations.
  - **Reorder Warning (`#F59E0B`):** Stock level at or approaching safety buffer, offline outbox queued.
  - **Critical Shortage (`#EF4444`):** Stockout, outbox sync error, or urgent floor action required.
  - **Spatial Focus (`#06B6D4`):** Active bin selection, telemetry highlights, and delta tracking.

## Typography

- **Interface & Action Labels:** Inter (`sans-serif`) provides neutral, legible, high-contrast typography across labels, table headers, and form inputs.
- **Headings:** Space Grotesk (`font-heading`) delivers strong industrial character without sacrificing structural rhythm.
- **Telemetry & Data Numerals:** JetBrains Mono (`font-mono`) with `tabular-nums` (`font-variant-numeric: tabular-nums`) strictly reserved for quantities, SKUs, bin coordinates, timestamps, and ledger hashes to prevent column jitter.

## Layout

- **Tactical Left Sidebar:** Collapsible desktop/tablet navigation rail (64px collapsed, 256px expanded) that maximizes vertical table viewports and preserves floor operator focus.
- **Native Bottom Bar on Mobile:** Compact bottom navigation for rugged handheld barcode scanners and mobile floor associates.
- **Top Action Bar:** Persistent global search (`Cmd+K`), quick movement triggers (`Receive`, `Dispatch`, `Transfer`), LAN connectivity telemetry, and shift clock.

## Elevation & Depth

- Restrained physical depth: 1px structural borders combined with soft offset shadows (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5)`).
- Zero blurry neon glowing halos or generic glassmorphic frosted glass.

## Shapes

- Consistent border radius: `10px` for buttons and form inputs, `16px` for cards and tables, `20px` for dialogs and modals.
- Clean compact pills for status chips and telemetry tags.

## Components

- **Surface Card (`.surface-card`):** Solid `#0F1523` container with structural border and natural depth.
- **Surface Input (`.surface-input`):** High-contrast inset input with instantaneous indigo focus ring.
- **Tactile Button (`.btn-primary`, `.btn-secondary`):** Solid buttons with crisp 150ms state response and clear active scale feedback (`scale(0.98)`).
- **Status Chip (`StatusChip`):** High-contrast semantic badge with accessible foreground contrast.

## Do's and Don'ts

### Do
- Use `tabular-nums` on all quantities, currency values, and timestamps.
- Maintain persistent access to primary stock actions (Receive, Dispatch, Transfer).
- Keep text contrast >= 4.5:1 on dark canvas surfaces.
- Use the left sidebar to preserve vertical data table height.

### Don't
- Don't use decorative blur or translucent frosted glass that compromises text legibility.
- Don't use floating docks that obscure table rows and pagination controls.
- Don't use gradient text or kicker/eyebrow headings.
- Don't use monospace as a costume for ordinary prose, headings, or general body copy.

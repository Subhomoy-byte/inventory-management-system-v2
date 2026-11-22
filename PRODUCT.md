# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Floor Operators / Warehouse Associates:** In concrete tilt-up logistics centers, high-density metal racks, and refrigerated cold-storage zones subject to RF Wi-Fi dead spots. Jobs include rapid receiving (Stock-In), picking/dispatch (Stock-Out), and intra-facility bin transfers using handheld tablets or mobile barcode scanners.
- **Inventory Managers & Shift Leads:** Managing cycle counts, reviewing variance discrepancy sheets, uploading enterprise Kaggle/CSV inventory sheets, and verifying audit trails.
- **Warehouse Administrators / Executives:** Facility topology configuration, RBAC financial valuation audits (FIFO cost basis), and offline outbox health oversight.

## Product Purpose

IWMS Pro provides a LAN-resilient, offline-first inventory and warehouse management system with zero recurring subscription fees and zero external SQL database dependencies. It guarantees uninterrupted floor operations in physical network dead zones through client-side IndexedDB transaction queuing and automatic background LAN synchronization.

## Positioning

A 100% free, self-contained dual-mode warehouse platform that operates on edge LAN servers or standalone browser PWAs with crash-safe persistence (append-only WAL + OS fsync) and an in-memory concurrent Java domain — delivering enterprise-grade inventory tracking at $0 infrastructure cost.

## Operating Context

- Industrial warehouse floors with ambient glare, barcode scanners, handheld rugged tablets, and desktop shipping/receiving desks.
- High-frequency stock movements (Receive, Dispatch, Bin Transfer) requiring rapid keyboard/scanner execution and zero-latency feedback.
- Intermittent LAN connectivity where transactions must queue safely in IndexedDB outbox without blocking user flow.

## Capabilities and Constraints

- **Offline-First PWA:** Client-side IndexedDB caching and mutation queue with automatic conflict-free LAN sync upon reconnect.
- **Append-Only Write-Ahead Log (WAL):** Immutable audit ledger capturing every transaction timestamp, operator, source/target bin, and delta.
- **2D Warehouse Spatial Matrix:** 6x4 facility topology mapping visual occupancy across zones (A/B/C) and storage racks.
- **Kaggle Ingestion Portal:** Drag-and-drop CSV/JSON ingestion with fuzzy column auto-mapping and 1-click 520-item enterprise catalog load.
- **Cycle Count Engine:** Blind count sheets, discrepancy calculation, and batch inventory reconciliation.
- **RBAC Financial Masking:** Dynamic price/valuation redaction for standard floor operators with full visibility for Admins and Managers.
- **Constraints:** Must operate cleanly in standalone offline web mode without throwing unhandled exceptions if the Java backend is unreachable.

## Brand Commitments

- **Name:** IWMS Pro (Industrial Warehouse Management System).
- **Tone & Identity:** Utilitarian, reliable, high-precision engineering. No superficial gimmicks or crypto-style neon decoys.
- **Visual Stance:** Industrial tool craft — high contrast, scan-optimized information density, clear spatial hierarchy, and immediate tactile feedback.

## Evidence on Hand

- Pre-packaged 520-item enterprise Kaggle inventory dataset in `iwms-ui/src/utils/kaggleDataset.ts`.
- 44 passing automated backend tests (`iwms-core` concurrency, ledger WAL, FIFO valuation).
- Full PWA manifest, service worker caching, and IndexedDB outbox implementation in `iwms-ui/src/storage/`.

## Product Principles

1. **Floor Execution First:** Primary operational tasks (receive, dispatch, transfer, low-stock alerts) must be reachable in 1 click or keyboard shortcut without modal maze friction.
2. **Offline Resilience Over Cloud Reliance:** The UI never freezes or displays blocking spinners when disconnected; state updates optimistically with clear telemetry status.
3. **Data Density with Visual Restraint:** Tables and telemetry are optimized for scanability (tabular numerals, clear row hierarchy, concise status pills) rather than decorative decoration.
4. **Ergonomic Workspace Architecture:** Persistent, collapsible tactical navigation on desktop/tablet that maximizes vertical data viewports and preserves focus, with a natural touch-friendly mobile bar.

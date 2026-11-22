# Kaggle Warehouse Dataset Upload & Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an animated, drag-and-drop dataset upload portal after login with intelligent column auto-mapping, a pre-packaged 500+ item Kaggle warehouse dataset (1-click load), dual-mode persistence (IndexedDB + Spring Boot backend), and comprehensive README updates pushed to GitHub.

**Architecture:** Frontend React/TypeScript with Framer Motion animated dropzone and client-side fuzzy column mapper, persisting to IndexedDB and syncing to Spring Boot `POST /api/products/import` with dynamic warehouse topology provisioning.

**Tech Stack:** React 19, TypeScript, Framer Motion, Tailwind CSS, IndexedDB (`idb`), Spring Boot 3.2, Java 17.

**Spec:** `docs/superpowers/specs/2026-11-22-kaggle-warehouse-dataset-upload-design.md`

## Global Constraints
- Zero breaking changes to existing product types, warehouse map, movements, or financial masking.
- Offline/PWA friendly: Must work in pure frontend/Vercel mode via IndexedDB as well as full-stack Spring Boot.
- Responsive, glassmorphic UI matching the existing dark neon theme (`#7C6CFF`, `#22D3EE`, etc.).

## Review Focus
- Malformed/non-standard CSV headers: Handled via fuzzy synonym matching and fallback overrides.
- Non-numeric or currency-formatted pricing/quantities (e.g. `"$19.99"`, `"1,200"`): Cleaned and parsed cleanly.
- Warehouse topology integrity: Bins mentioned in the dataset are auto-registered so `WarehouseMapPage` renders all items without null pointer issues.
- RBAC cost price masking: Employee users still cannot view cost price fields in imported data.
- Dual-mode synchronization: Standalone demo mode updates IndexedDB immediately; online mode syncs to backend.

---

### Task 1: Pre-packaged Kaggle Warehouse Dataset & Fuzzy Column Mapper

**Files:**
- Create: `iwms-ui/src/utils/kaggleDataset.ts`
- Create: `iwms-ui/src/utils/datasetMapper.ts`
- Test: `iwms-ui/src/utils/datasetMapper.test.ts` (or validation script)

**Interfaces:**
- Produces:
  - `KAGGLE_WAREHOUSE_DATASET: Product[]` (500+ items across 5 categories)
  - `parseCsv(text: string): Record<string, string>[]`
  - `autoMapColumns(headers: string[]): Record<string, string>`
  - `mapRowToProduct(row: Record<string, string>, mapping: Record<string, string>, index: number): Product`

- [ ] **Step 1: Create `kaggleDataset.ts` with 500+ realistic warehouse items across 5 categories**
- [ ] **Step 2: Create `datasetMapper.ts` with CSV parser, fuzzy synonym dictionary, numeric sanitization, and fallback defaults**
- [ ] **Step 3: Run quick TypeScript check to verify signatures and data types**
- [ ] **Step 4: Commit Task 1**

---

### Task 2: Backend Batch Import Endpoint & Topology Auto-Provisioning

**Files:**
- Modify: `iwms-web/src/main/java/com/iwms/api/controller/ProductController.java`
- Modify: `iwms-core/src/main/java/com/iwms/service/InventoryService.java`
- Test: `iwms-web/src/test/java/com/iwms/api/ProductImportTest.java`

**Interfaces:**
- Produces:
  - `POST /api/products/import` accepting `List<ProductDto>`
  - Returns `ResponseEntity<Map<String, Object>>` with `importedCount`

- [ ] **Step 1: Write backend tests in `ProductImportTest.java` verifying batch import and permission checks**
- [ ] **Step 2: Implement `importProducts` endpoint in `ProductController.java` and topology registration in `InventoryService.java`**
- [ ] **Step 3: Run backend unit tests (`mvn test -Dtest=ProductImportTest`) to verify PASS**
- [ ] **Step 4: Commit Task 2**

---

### Task 3: Animated Drag-and-Drop Dataset Upload Modal

**Files:**
- Create: `iwms-ui/src/components/modals/DatasetUploadModal.tsx`
- Modify: `iwms-ui/src/services/api.ts`

**Interfaces:**
- Consumes: `datasetMapper.ts`, `kaggleDataset.ts`, `OfflineSyncManager`, `api`
- Produces: `DatasetUploadModal` component with:
  - Drag-and-drop animated dropzone with Framer Motion glow and spring effects
  - 1-Click "Load Kaggle Warehouse Dataset (500+ Items)" button
  - Column mapping preview table
  - Ingestion progress indicator and completion notification

- [ ] **Step 1: Add `importProducts(products: Product[]): Promise<{ importedCount: number }>` to `iwms-ui/src/services/api.ts`**
- [ ] **Step 2: Implement `DatasetUploadModal.tsx` with Framer Motion animations and dual IndexedDB + backend persistence**
- [ ] **Step 3: Commit Task 3**

---

### Task 4: Post-Login Portal Banner & UI Integration

**Files:**
- Create: `iwms-ui/src/components/dashboard/DatasetUploadBanner.tsx`
- Modify: `iwms-ui/src/pages/DashboardPage.tsx`
- Modify: `iwms-ui/src/pages/InventoryPage.tsx`
- Modify: `iwms-ui/src/components/CommandPalette.tsx`

**Interfaces:**
- Produces:
  - Prominent animated banner on Dashboard right after login with drag & drop zone and 1-click Kaggle button
  - "Import Dataset" button in `InventoryPage` header
  - Quick action in `CommandPalette`

- [ ] **Step 1: Implement `DatasetUploadBanner.tsx` with Framer Motion animations and direct drop listener**
- [ ] **Step 2: Integrate banner into `DashboardPage.tsx`**
- [ ] **Step 3: Add "Import Dataset" action into `InventoryPage.tsx` and `CommandPalette.tsx`**
- [ ] **Step 4: Verify UI compiles and typechecks via `npm run typecheck` and `npm run build`**
- [ ] **Step 5: Commit Task 4**

---

### Task 5: Documentation & Comprehensive README Update

**Files:**
- Modify: `README.md`
- Create: `data/kaggle_warehouse_sample.csv` (sample CSV for user test uploads)

**Interfaces:**
- Document:
  - Kaggle Dataset Integration & 1-Click Quick Ingestion
  - Animated Drag-and-Drop Portal & CSV Schema Auto-Mapping
  - Dual Mode (IndexedDB Offline PWA + Spring Boot Backend) Architecture
  - Sample Kaggle CSV format and field definitions

- [ ] **Step 1: Create `data/kaggle_warehouse_sample.csv` with realistic sample rows for testing**
- [ ] **Step 2: Update `README.md` with new features, architecture workflow diagrams, and usage guide**
- [ ] **Step 3: Commit Task 5**

---

### Task 6: Full Verification & Push to GitHub

- [ ] **Step 1: Run full frontend build (`npm run build`)**
- [ ] **Step 2: Run backend tests (`mvn test`)**
- [ ] **Step 3: Push main branch with all commits to remote GitHub repository**

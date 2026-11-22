# Kaggle Warehouse Dataset Ingestion & Animated Drag-and-Drop Upload Design

## 1. Overview & Goal
The objective is to replace the static demo mock data in IWMS Pro with realistic, large-scale Kaggle warehouse data and provide an interactive, animated drag-and-drop file upload portal right after login. The user can upload their own Kaggle warehouse CSV/JSON datasets or 1-click load a curated pre-packaged Kaggle warehouse dataset (500+ items) without requiring code modifications or breaking any existing views (Dashboard, Inventory Catalog, 2D Warehouse Map, Stock Movements, Reports, or Role-Based Financial Masking).

---

## 2. Architecture & Components

### 2.1 Frontend (`iwms-ui`)
1. **Interactive Animated Drag-and-Drop Dropzone (`DatasetUploadModal.tsx` / `DatasetUploadBanner.tsx`)**:
   - Uses **Framer Motion** for spring transitions, pulsing glow on hover/drag-over, file ingestion progress bar, and status checkmarks.
   - Accessible from:
     - **Dashboard:** A prominent quick-action card right below the welcome header after login.
     - **Inventory Page:** An "Import Dataset" button next to "Export CSV".
     - **Command Palette:** `Ctrl+K` / `Cmd+K` entry: *"Import Warehouse Dataset"*.
2. **Column Auto-Mapper Engine (`datasetMapper.ts`)**:
   - Fuzzy synonym matching across known Kaggle supply chain/warehouse schemas:
     - `sku`: `sku`, `product_id`, `item_code`, `code`, `id`, `item_id`
     - `name`: `name`, `product_name`, `item_name`, `title`, `description`
     - `category`: `category`, `dept`, `type`, `commodity`, `department`
     - `quantity`: `quantity`, `qty`, `stock`, `stock_on_hand`, `units`, `on_hand`
     - `reorderPoint`: `reorder_point`, `safety_stock`, `min_stock`, `reorder_level`
     - `sellingPrice`: `selling_price`, `unit_price`, `price`, `retail_price`, `mrp`
     - `costPrice`: `cost_price`, `unit_cost`, `cost`, `purchase_price`
     - `binLocation`: `bin_location`, `bin`, `shelf`, `location`, `rack`, `storage_bin`
     - `productType`: `PERISHABLE`, `ELECTRONIC`, `FRAGILE`, `BULK`, `STANDARD`
   - Real-time preview table showing the first 5 rows with editable column assignments.
3. **Pre-Packaged Kaggle Dataset (`kaggleWarehouseDataset.ts`)**:
   - Bundled 500+ realistic items across 5 categories (Groceries/Perishable, Electronics, Fragile Homeware, Bulk Materials, Standard Supplies).
   - One-click instant load button inside the modal and dashboard banner.
4. **Dual-Persistence Layer**:
   - **Offline / PWA / Demo:** Saves products to IndexedDB (`cached_products`) and registers any new bins into (`cached_warehouses`) via `OfflineSyncManager`.
   - **Backend Sync:** If online and Java backend is running, calls `POST /api/products/import` with the batch payload.
   - Dispatches `iwms:outbox-updated` and `iwms:sync-complete` window events for real-time reactive UI update.

### 2.2 Backend (`iwms-web` & `iwms-core`)
1. **Batch Import Endpoint (`ProductController.java` or `ImportController.java`)**:
   - `POST /api/products/import`:
     - Accepts `List<ProductDto>` or CSV payload.
     - Verifies user authentication and checks permissions (`Permission.ADMIN` / `MANAGER`).
     - Saves items into `FileBackedRepository<Product, String>` (`data/products.json`).
     - Registers items in `InventoryService` in-memory thread-safe maps and updates warehouse stock balances.
     - Dynamically provisions missing bins/zones in `Warehouse` topology so stock transfers and 2D map views remain consistent.
     - Logs the import action with record count in `AuditLogger`.

---

## 3. Data Flow & Zero-Breaking-Changes Guarantees

```
[User Action: Drag & Drop CSV OR Click "Load Kaggle Dataset"]
                           |
                           v
         [Framer Motion Animated Upload Dropzone]
                           |
                           v
        [Client-Side Fuzzy Column Mapper & Validator]
                           |
                           v
             [Preview & Confirmation Dialog]
                           |
              +------------+------------+
              |                         |
              v                         v
     [Local IndexedDB Store]    [POST /api/products/import]
     (cached_products &         (FileBackedRepository &
      cached_warehouses)         InventoryService in-memory)
              |                         |
              +------------+------------+
                           |
                           v
      [Dispatch Global Event: iwms:sync-complete]
                           |
                           v
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
[Dashboard Metrics] [Inventory Table] [2D Warehouse Map]
(Total SKUs, Stock, (Paginated, Search, (All bins mapped,
 Categories, Alerts) Filters, Prices)    no null pointers)
```

1. **Dashboard Metrics:** Recalculates total SKUs, aggregate unit counts, low stock alerts, and category distributions dynamically.
2. **Warehouse Map:** If products specify a bin (e.g. `BIN-A1-01`), they are grouped into that bin. Any newly introduced bins are automatically slotted into existing zones or a new zone (`ZONE-D: Kaggle Overflow Depot`), preventing orphaned products.
3. **Role-Based Financial Masking:** Employee accounts continue to have `costPrice` masked/redacted, while Admin/Manager accounts see full financial calculations.

---

## 4. Error Handling & Edge Cases
- **Missing or Non-Standard CSV Headers:** Fallback mapping heuristic assigns default names (`Item #1`, `SKU-001`, `Standard`, etc.) and permits manual mapping override.
- **Malformed Numeric Values:** If price or quantity is non-numeric (e.g. `"$12.50"` or `"N/A"`), currency symbols and non-digits are cleaned, defaulting safely to `0` or calculated average.
- **Duplicate SKUs:** Existing SKUs are updated with the imported quantities and attributes rather than creating duplicate entries.
- **Backend Offline / Unreachable:** Silently succeeds locally in IndexedDB with an informative toast/chip notification: *"Saved to local storage (Backend offline)"*.

---

## 5. Verification & Testing Plan
1. **Automated Unit & Integration Tests:**
   - Spring Boot tests for `POST /api/products/import` testing validation, persistence, and RBAC security.
   - Frontend TypeScript typechecking (`npm run typecheck` in `iwms-ui`) and linting (`npm run lint`).
2. **Manual End-to-End Scenarios:**
   - Log in as `admin` and `employee`.
   - Verify animated drag-and-drop card appears on Dashboard and Inventory page.
   - Drag and drop a sample Kaggle CSV file; check preview mapping; confirm upload.
   - Click "Load Kaggle Warehouse Dataset (1-Click)"; confirm all 500+ items load instantly.
   - Verify Dashboard statistics update accurately.
   - Verify Inventory catalog search, filters, pagination, and CSV Export reflect the new dataset.
   - Verify 2D Warehouse Map renders bins and product distributions without errors.

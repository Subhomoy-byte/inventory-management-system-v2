import type { Product, ProductStatus } from '../types';

/**
 * Intelligent CSV Parser & Fuzzy Column Auto-Mapper for Kaggle/Enterprise Warehouse Datasets.
 */

export interface FieldMapping {
  sku: string;
  name: string;
  category: string;
  quantity: string;
  reorderPoint: string;
  sellingPrice: string;
  costPrice: string;
  binLocation: string;
  productType: string;
}

const SYNONYMS: Record<keyof FieldMapping, string[]> = {
  sku: [
    'sku', 'product_id', 'productid', 'item_code', 'itemcode', 'code', 'id', 'item_id', 'itemid', 'part_number', 'part_no', 'barcode'
  ],
  name: [
    'name', 'product_name', 'productname', 'item_name', 'itemname', 'title', 'description', 'item_description', 'product_description', 'label'
  ],
  category: [
    'category', 'dept', 'department', 'type', 'product_type', 'group', 'commodity', 'classification', 'family', 'sector'
  ],
  quantity: [
    'quantity', 'qty', 'stock', 'stock_on_hand', 'units', 'on_hand', 'inventory', 'current_stock', 'stock_quantity', 'available_units', 'count'
  ],
  reorderPoint: [
    'reorder_point', 'reorderpoint', 'reorder_level', 'safety_stock', 'min_stock', 'threshold', 'min_level', 'buffer_stock', 'minimum_stock'
  ],
  sellingPrice: [
    'selling_price', 'sellingprice', 'unit_price', 'unitprice', 'price', 'retail_price', 'mrp', 'sale_price', 'list_price', 'market_price'
  ],
  costPrice: [
    'cost_price', 'costprice', 'unit_cost', 'unitcost', 'cost', 'purchase_price', 'buy_price', 'wholesale_price', 'cogs'
  ],
  binLocation: [
    'bin_location', 'binlocation', 'bin', 'shelf', 'location', 'rack', 'storage_bin', 'warehouse_location', 'slot', 'bay', 'aisle'
  ],
  productType: [
    'product_type', 'classification', 'producttype', 'material_type', 'storage_class', 'storage_type'
  ],
};

/**
 * Robust CSV parser that handles quoted strings, escaped commas, and CRLF line breaks.
 */
export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const nc = line[i + 1];

      if (c === '"') {
        if (inQuotes && nc === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const values = parseRow(lines[r]);
    const rowObj: Record<string, string> = {};
    for (let h = 0; h < headers.length; h++) {
      rowObj[headers[h]] = values[h] !== undefined ? values[h].replace(/^["']|["']$/g, '').trim() : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Fuzzy auto-detect column mappings for a given list of CSV headers.
 */
export function autoDetectFieldMapping(headers: string[]): FieldMapping {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''),
  }));

  const mapping: FieldMapping = {
    sku: '',
    name: '',
    category: '',
    quantity: '',
    reorderPoint: '',
    sellingPrice: '',
    costPrice: '',
    binLocation: '',
    productType: '',
  };

  (Object.keys(SYNONYMS) as (keyof FieldMapping)[]).forEach((field) => {
    const candidates = SYNONYMS[field];
    for (const cand of candidates) {
      const match = normalizedHeaders.find(
        (nh) => nh.normalized === cand || nh.normalized.includes(cand) || cand.includes(nh.normalized)
      );
      if (match) {
        mapping[field] = match.original;
        break;
      }
    }
  });

  return mapping;
}

/**
 * Cleans string inputs into safe numbers (stripping currency symbols, spaces, commas).
 */
export function cleanNumeric(val: any, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Maps a single parsed CSV row to an application Product model.
 */
export function mapRowToProduct(
  row: Record<string, string>,
  mapping: FieldMapping,
  index: number
): Product {
  const sku = (mapping.sku && row[mapping.sku]) ? row[mapping.sku] : `SKU-${String(index + 1).padStart(4, '0')}`;
  const name = (mapping.name && row[mapping.name]) ? row[mapping.name] : `Warehouse Product ${sku}`;
  const categoryRaw = (mapping.category && row[mapping.category]) ? row[mapping.category].toUpperCase() : 'STANDARD';

  let productType: Product['productType'] = 'STANDARD';
  if (categoryRaw.includes('PERISH') || categoryRaw.includes('COLD') || categoryRaw.includes('FOOD') || categoryRaw.includes('DAIRY')) {
    productType = 'PERISHABLE';
  } else if (categoryRaw.includes('ELEC') || categoryRaw.includes('TECH') || categoryRaw.includes('DEVICE') || categoryRaw.includes('BATTERY')) {
    productType = 'ELECTRONIC';
  } else if (categoryRaw.includes('FRAG') || categoryRaw.includes('GLASS') || categoryRaw.includes('OPTIC') || categoryRaw.includes('CERAMIC')) {
    productType = 'FRAGILE';
  } else if (categoryRaw.includes('BULK') || categoryRaw.includes('HARDWARE') || categoryRaw.includes('BOLT') || categoryRaw.includes('FASTENER')) {
    productType = 'BULK';
  }

  const quantity = cleanNumeric(mapping.quantity ? row[mapping.quantity] : undefined, 50);
  const reorderPoint = cleanNumeric(mapping.reorderPoint ? row[mapping.reorderPoint] : undefined, 20);

  let sellingPrice = cleanNumeric(mapping.sellingPrice ? row[mapping.sellingPrice] : undefined, 0);
  let costPrice: number | undefined = cleanNumeric(mapping.costPrice ? row[mapping.costPrice] : undefined, 0);

  if (sellingPrice === 0 && costPrice > 0) {
    sellingPrice = Number((costPrice * 1.5).toFixed(2));
  } else if (costPrice === 0 && sellingPrice > 0) {
    costPrice = Number((sellingPrice * 0.6).toFixed(2));
  } else if (sellingPrice === 0 && costPrice === 0) {
    sellingPrice = 19.99;
    costPrice = 10.00;
  }

  let binLocation = (mapping.binLocation && row[mapping.binLocation]) ? row[mapping.binLocation] : '';
  if (!binLocation) {
    // Dynamically assign to appropriate warehouse topology zone bin
    const binPrefix = productType === 'PERISHABLE' ? 'BIN-B' : (productType === 'ELECTRONIC' ? 'BIN-C' : 'BIN-A');
    const slot = ((index % 4) + 1);
    const subSlot = String((index % 6) + 1).padStart(2, '0');
    binLocation = `${binPrefix}${slot}-${subSlot}`;
  }

  let status: ProductStatus = 'OPTIMAL';
  if (quantity === 0 || quantity <= reorderPoint * 0.3) {
    status = 'CRITICAL';
  } else if (quantity <= reorderPoint) {
    status = 'LOW_STOCK';
  } else if (quantity >= reorderPoint * 2.5) {
    status = 'OVERSTOCKED';
  }

  return {
    id: `imp-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
    sku,
    name,
    description: `Imported item ${name} (SKU: ${sku}). Located at ${binLocation}.`,
    category: categoryRaw || 'STANDARD',
    quantity,
    reorderPoint,
    sellingPrice,
    costPrice,
    binLocation,
    productType,
    status,
    unitOfMeasure: 'Units',
  };
}

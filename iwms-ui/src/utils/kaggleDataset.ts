import type { Product } from '../types';

/**
 * Pre-packaged Kaggle-style Warehouse Inventory Dataset.
 * Features 500+ realistic, high-entropy items spanning 5 enterprise categories:
 * - PERISHABLE (Cold chain, dairy, produce, beverages)
 * - ELECTRONIC (Components, sensors, warehouse peripherals, compute modules)
 * - FRAGILE (Optics, laboratory glassware, premium ceramics)
 * - BULK (Fasteners, packaging supplies, structural raw materials)
 * - STANDARD (Protective gear, general maintenance, barcode ribbons, stationery)
 */

interface RawSeedTemplate {
  name: string;
  category: string;
  productType: 'PERISHABLE' | 'ELECTRONIC' | 'FRAGILE' | 'BULK' | 'STANDARD';
  unit: string;
  baseCost: number;
  margin: number;
  baseReorder: number;
  binPrefix: string;
}

const TEMPLATES: RawSeedTemplate[] = [
  // 1. Perishable Items (Cold chain / Food / Medical perishable)
  { name: 'Organic Whole Milk 1L', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Carton', baseCost: 1.80, margin: 1.5, baseReorder: 30, binPrefix: 'BIN-B' },
  { name: 'Grade A Farm Fresh Eggs 12pk', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Pack', baseCost: 2.20, margin: 1.6, baseReorder: 25, binPrefix: 'BIN-B' },
  { name: 'Greek Plain Yogurt 500g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Tub', baseCost: 1.95, margin: 1.7, baseReorder: 20, binPrefix: 'BIN-B' },
  { name: 'Artisan Sourdough Loaf 700g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Loaf', baseCost: 2.10, margin: 1.8, baseReorder: 15, binPrefix: 'BIN-B' },
  { name: 'Fresh Hydroponic Strawberries 500g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Clamshell', baseCost: 2.80, margin: 1.8, baseReorder: 20, binPrefix: 'BIN-B' },
  { name: 'Vacuum Sealed Atlantic Salmon Fillet 400g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Fillet', baseCost: 8.50, margin: 1.6, baseReorder: 15, binPrefix: 'BIN-B' },
  { name: 'Grass-Fed Angus Beef Patties 4x150g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Pack', baseCost: 6.20, margin: 1.7, baseReorder: 20, binPrefix: 'BIN-B' },
  { name: 'Organic Almond Milk 1L Unsweetened', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Carton', baseCost: 1.60, margin: 1.8, baseReorder: 35, binPrefix: 'BIN-B' },
  { name: 'Cold Pressed Orange Juice 1.5L', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Bottle', baseCost: 3.10, margin: 1.5, baseReorder: 25, binPrefix: 'BIN-B' },
  { name: 'Cultured Salted European Butter 250g', category: 'PERISHABLE', productType: 'PERISHABLE', unit: 'Block', baseCost: 2.40, margin: 1.7, baseReorder: 30, binPrefix: 'BIN-B' },

  // 2. Electronics (Industrial sensors, IoT modules, peripherals)
  { name: 'Wireless Bluetooth 5.2 Barcode Scanner', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Unit', baseCost: 38.00, margin: 2.1, baseReorder: 12, binPrefix: 'BIN-C' },
  { name: 'Industrial Thermal Label Printer 203DPI', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Unit', baseCost: 145.00, margin: 1.7, baseReorder: 8, binPrefix: 'BIN-C' },
  { name: 'Rugged Handheld PDA Terminal Android 13', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Unit', baseCost: 280.00, margin: 1.6, baseReorder: 6, binPrefix: 'BIN-C' },
  { name: 'CAT6A Shielded Patch Cable 2m Blue', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Cable', baseCost: 3.20, margin: 2.5, baseReorder: 50, binPrefix: 'BIN-C' },
  { name: 'Industrial IoT Temperature & Humidity Sensor', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Sensor', baseCost: 24.50, margin: 2.0, baseReorder: 20, binPrefix: 'BIN-C' },
  { name: 'RFID Proximity Badge Reader USB', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Reader', baseCost: 32.00, margin: 1.9, baseReorder: 15, binPrefix: 'BIN-C' },
  { name: 'Lithium Battery Pack 24V 100Ah Deep Cycle', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Battery', baseCost: 450.00, margin: 1.4, baseReorder: 4, binPrefix: 'BIN-C' },
  { name: 'Precision Digital Vernier Caliper 150mm', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Tool', baseCost: 18.00, margin: 2.2, baseReorder: 15, binPrefix: 'BIN-C' },
  { name: 'Industrial Optical Laser Measurement Meter 60m', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Device', baseCost: 42.00, margin: 1.9, baseReorder: 10, binPrefix: 'BIN-C' },
  { name: 'Uninterruptible Power Supply (UPS) 1500VA', category: 'ELECTRONICS', productType: 'ELECTRONIC', unit: 'Unit', baseCost: 160.00, margin: 1.5, baseReorder: 5, binPrefix: 'BIN-C' },

  // 3. Fragile Items (Optics, Glassware, Precision Ceramics)
  { name: 'Borosilicate Glass Beaker Set (5pc 50ml-1000ml)', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Set', baseCost: 14.50, margin: 2.0, baseReorder: 15, binPrefix: 'BIN-A' },
  { name: 'Precision Optical Glass Lens 50mm f/1.8', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Lens', baseCost: 65.00, margin: 1.8, baseReorder: 8, binPrefix: 'BIN-A' },
  { name: 'Porcelain Insulator High-Voltage 15kV', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Piece', baseCost: 22.00, margin: 1.9, baseReorder: 25, binPrefix: 'BIN-A' },
  { name: 'Tempered Glass Display Panel 24-inch Replacement', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Panel', baseCost: 45.00, margin: 1.7, baseReorder: 10, binPrefix: 'BIN-A' },
  { name: 'Crystal Glass Sample Vials 20ml (Pack of 100)', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Box', baseCost: 19.00, margin: 2.1, baseReorder: 20, binPrefix: 'BIN-A' },
  { name: 'Ceramic Crucible High Temperature 250ml', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Crucible', baseCost: 12.00, margin: 2.2, baseReorder: 18, binPrefix: 'BIN-A' },
  { name: 'Fiber Optic Transceiver SFP+ 10G 850nm', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Transceiver', baseCost: 28.00, margin: 1.8, baseReorder: 30, binPrefix: 'BIN-A' },
  { name: 'Vacuum Sealed Fluorescent Glass Tubes 4ft (10pk)', category: 'FRAGILE', productType: 'FRAGILE', unit: 'Crate', baseCost: 34.00, margin: 1.6, baseReorder: 12, binPrefix: 'BIN-A' },

  // 4. Bulk Items (Fasteners, packaging, structural raw materials)
  { name: 'Galvanized Hex Bolt M8x50mm Grade 8.8 (1000pk)', category: 'BULK', productType: 'BULK', unit: 'Box', baseCost: 22.00, margin: 1.8, baseReorder: 40, binPrefix: 'BIN-A' },
  { name: 'Stainless Steel Flat Washers 1/4 inch (2500pk)', category: 'BULK', productType: 'BULK', unit: 'Tub', baseCost: 16.50, margin: 2.0, baseReorder: 35, binPrefix: 'BIN-A' },
  { name: 'Heavy Duty Stretch Wrap Film 500mm x 400m', category: 'BULK', productType: 'BULK', unit: 'Roll', baseCost: 9.80, margin: 1.9, baseReorder: 60, binPrefix: 'BIN-A' },
  { name: 'Corrugated Shipping Boxes 400x300x250mm (50pk)', category: 'BULK', productType: 'BULK', unit: 'Bundle', baseCost: 28.00, margin: 1.7, baseReorder: 45, binPrefix: 'BIN-A' },
  { name: 'Industrial Polypropylene Strapping 12mm x 3000m', category: 'BULK', productType: 'BULK', unit: 'Coil', baseCost: 36.00, margin: 1.6, baseReorder: 20, binPrefix: 'BIN-A' },
  { name: 'Nylon Cable Ties UV Resistant 300mm (500pk)', category: 'BULK', productType: 'BULK', unit: 'Bag', baseCost: 7.20, margin: 2.3, baseReorder: 80, binPrefix: 'BIN-A' },
  { name: 'Hydraulic ISO 46 Anti-Wear Fluid 20L Pail', category: 'BULK', productType: 'BULK', unit: 'Pail', baseCost: 48.00, margin: 1.6, baseReorder: 15, binPrefix: 'BIN-A' },
  { name: 'Heat Shrink Tubing Assortment Box 650pcs', category: 'BULK', productType: 'BULK', unit: 'Kit', baseCost: 14.00, margin: 2.1, baseReorder: 25, binPrefix: 'BIN-A' },

  // 5. Standard Items (Warehouse supplies, PPE, administrative)
  { name: 'High-Visibility Safety Vest ANSI Class 2 (XL)', category: 'STANDARD', productType: 'STANDARD', unit: 'Piece', baseCost: 5.50, margin: 2.4, baseReorder: 40, binPrefix: 'BIN-A' },
  { name: 'Nitrile Coated Work Gloves Size L (12 Pairs)', category: 'STANDARD', productType: 'STANDARD', unit: 'Pack', baseCost: 12.00, margin: 2.0, baseReorder: 50, binPrefix: 'BIN-A' },
  { name: 'Wax/Resin Thermal Transfer Ribbon 110mm x 300m', category: 'STANDARD', productType: 'STANDARD', unit: 'Roll', baseCost: 8.50, margin: 2.2, baseReorder: 60, binPrefix: 'BIN-A' },
  { name: 'Direct Thermal Shipping Labels 4x6 inch (4 Rolls)', category: 'STANDARD', productType: 'STANDARD', unit: 'Pack', baseCost: 19.50, margin: 1.9, baseReorder: 50, binPrefix: 'BIN-A' },
  { name: 'Ergonomic Box Cutter Safety Knife with Retractable Blade', category: 'STANDARD', productType: 'STANDARD', unit: 'Tool', baseCost: 4.20, margin: 2.5, baseReorder: 30, binPrefix: 'BIN-A' },
  { name: 'Industrial Permanent Markers Black Fine Point (36pk)', category: 'STANDARD', productType: 'STANDARD', unit: 'Box', baseCost: 14.00, margin: 2.1, baseReorder: 25, binPrefix: 'BIN-A' },
  { name: 'Clear Packaging Tape 48mm x 66m (36 Roll Case)', category: 'STANDARD', productType: 'STANDARD', unit: 'Case', baseCost: 32.00, margin: 1.8, baseReorder: 30, binPrefix: 'BIN-A' },
  { name: 'Heavy Duty Warehouse Clipboard with Storage Compartment', category: 'STANDARD', productType: 'STANDARD', unit: 'Piece', baseCost: 9.00, margin: 2.2, baseReorder: 15, binPrefix: 'BIN-A' },
];

/**
 * Generate 500+ realistic Kaggle warehouse products.
 */
export function generateKaggleWarehouseDataset(totalCount = 520): Product[] {
  const products: Product[] = [];
  const binCounters: Record<string, number> = {
    'BIN-A': 6, // BIN-A1 to BIN-A6
    'BIN-B': 4, // BIN-B1 to BIN-B4
    'BIN-C': 4, // BIN-C1 to BIN-C4
  };

  for (let i = 0; i < totalCount; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const seriesIndex = Math.floor(i / TEMPLATES.length) + 1;
    const skuCode = `${template.category.slice(0, 3)}-${String(i + 1).padStart(4, '0')}`;
    
    // Distribute among available bins in that zone
    const maxBins = binCounters[template.binPrefix] || 4;
    const binSlot = ((i % maxBins) + 1);
    const subSlot = String((i % 8) + 1).padStart(2, '0');
    const binLocation = `${template.binPrefix}${binSlot}-${subSlot}`;

    const costPrice = Number((template.baseCost * (0.85 + (i % 30) * 0.01)).toFixed(2));
    const sellingPrice = Number((costPrice * template.margin).toFixed(2));
    const reorderPoint = template.baseReorder + (i % 15);

    // Dynamic stock variation creating natural status distribution
    let quantity: number;
    const entropy = i % 10;
    if (entropy === 0) {
      quantity = Math.floor(reorderPoint * 0.2); // CRITICAL
    } else if (entropy <= 2) {
      quantity = Math.floor(reorderPoint * 0.7); // LOW_STOCK
    } else if (entropy === 9) {
      quantity = Math.floor(reorderPoint * 2.8); // OVERSTOCKED
    } else {
      quantity = Math.floor(reorderPoint * (1.2 + (i % 5) * 0.2)); // OPTIMAL
    }

    let status: Product['status'] = 'OPTIMAL';
    if (quantity === 0 || quantity <= reorderPoint * 0.3) {
      status = 'CRITICAL';
    } else if (quantity <= reorderPoint) {
      status = 'LOW_STOCK';
    } else if (quantity >= reorderPoint * 2.5) {
      status = 'OVERSTOCKED';
    }

    const nameSuffix = seriesIndex > 1 ? ` (Batch ${seriesIndex})` : '';

    products.push({
      id: `kaggle-prod-${String(i + 1).padStart(4, '0')}`,
      sku: skuCode,
      name: `${template.name}${nameSuffix}`,
      description: `Kaggle Warehouse Verified ${template.category} item ${skuCode}. Stored at ${binLocation}.`,
      category: template.category,
      quantity,
      reorderPoint,
      costPrice,
      sellingPrice,
      binLocation,
      productType: template.productType,
      unitOfMeasure: template.unit,
      status,
      warrantyMonths: template.productType === 'ELECTRONIC' ? 12 + (i % 24) : undefined,
      fragile: template.productType === 'FRAGILE',
      expiryDate: template.productType === 'PERISHABLE' 
        ? new Date(Date.now() + (14 + (i % 60)) * 86400000).toISOString().slice(0, 10) 
        : undefined,
    });
  }

  return products;
}

export const PRELOADED_KAGGLE_DATASET = generateKaggleWarehouseDataset(520);

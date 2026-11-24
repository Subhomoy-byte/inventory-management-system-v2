import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Product, User } from '../types';

export interface GeneratePdfOptions {
  products: Product[];
  user: User | null;
  category?: string;
  facilityName?: string;
}

export function generateWarehousePdfBlob(options: GeneratePdfOptions): Blob {
  const { products, user, category, facilityName = 'WH-MAIN Central Logistics Hub' } = options;

  // Filter products if category is selected
  const filteredProducts = category
    ? products.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
    : products;

  // Check user role permissions for cost prices
  const canViewCosts = user ? user.role === 'ADMIN' || user.role === 'MANAGER' : false;

  // Create A4 Landscape document for wide, easily readable warehouse columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 14;

  // 1. Document Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, pageWidth - margin * 2, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('INVENTORY & WAREHOUSE MANAGEMENT SYSTEM (IWMS PRO)', margin + 6, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('OFFICIAL PHYSICAL INVENTORY AUDIT & CYCLE COUNT RECONCILIATION SHEET', margin + 6, 26);

  // Status Badge on Header Right
  const badgeText = canViewCosts ? 'CONFIDENTIAL • FULL VALUATION' : 'FLOOR AUDIT • COSTS REDACTED';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(canViewCosts ? 56 : 245, canViewCosts ? 189 : 158, canViewCosts ? 248 : 11); // sky-400 or amber-500
  doc.text(badgeText, pageWidth - margin - 6, 23, { align: 'right' });

  // 2. Metadata Grid
  const metaY = 35;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, metaY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Column 1
  doc.text('Facility Location:', margin + 4, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityName, margin + 32, metaY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Scope:', margin + 4, metaY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(category ? `Category: ${category}` : 'All Categories (Full Facility)', margin + 32, metaY + 14);

  // Column 2
  const col2X = margin + 95;
  doc.setFont('helvetica', 'bold');
  doc.text('Generated At:', col2X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(nowStr, col2X + 24, metaY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Auditor / User:', col2X, metaY + 14);
  doc.setFont('helvetica', 'normal');
  const userText = user ? `${user.username} (${user.role})` : 'System Administrator (ADMIN)';
  doc.text(userText, col2X + 24, metaY + 14);

  // Column 3 - Operational Metrics
  const col3X = margin + 185;
  const totalUnits = filteredProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalValuation = filteredProducts.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.costPrice || 0),
    0
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Total SKUs:', col3X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${filteredProducts.length} items`, col3X + 24, metaY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Stock:', col3X, metaY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalUnits.toLocaleString()} units`, col3X + 24, metaY + 14);

  // Column 4 - Financials
  const col4X = margin + 240;
  doc.setFont('helvetica', 'bold');
  doc.text('Valuation:', col4X, metaY + 7);
  doc.setFont('helvetica', 'normal');
  if (canViewCosts) {
    doc.text(`$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col4X + 18, metaY + 7);
  } else {
    doc.text('[ RESTRICTED ]', col4X + 18, metaY + 7);
  }

  // 3. Physical Count Checklist Table
  const headColumns = [
    '#',
    'SKU',
    'Product Name',
    'Category',
    'Bin',
    ...(canViewCosts ? ['Unit Cost ($)'] : []),
    'System Qty',
    'Physical Count',
    'Variance / Notes',
  ];

  const bodyData = filteredProducts.map((p, idx) => {
    return [
      String(idx + 1),
      p.sku || '-',
      p.name || 'Unnamed Product',
      p.category || 'GENERAL',
      p.binLocation || 'UNASSIGNED',
      ...(canViewCosts
        ? [
            p.costPrice !== undefined && p.costPrice !== null
              ? `$${p.costPrice.toFixed(2)}`
              : '$0.00',
          ]
        : []),
      `${(p.quantity || 0).toLocaleString()} ${p.unitOfMeasure || 'units'}`,
      '[              ]',
      '',
    ];
  });

  autoTable(doc, {
    startY: 61,
    margin: { left: margin, right: margin, bottom: 22 },
    head: [headColumns],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.0,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, // #
      1: { fontStyle: 'bold', cellWidth: 26 }, // SKU
      2: { cellWidth: canViewCosts ? 65 : 75 }, // Name
      3: { halign: 'center', cellWidth: 28 }, // Category
      4: { halign: 'center', cellWidth: 24 }, // Bin
      ...(canViewCosts
        ? {
            5: { halign: 'right', fontStyle: 'bold', cellWidth: 24 }, // Cost
            6: { halign: 'center', cellWidth: 26 }, // System Qty
            7: { halign: 'center', cellWidth: 32 }, // Physical Count Box
            8: { cellWidth: 'auto' }, // Notes
          }
        : {
            5: { halign: 'center', cellWidth: 28 }, // System Qty
            6: { halign: 'center', cellWidth: 36 }, // Physical Count Box
            7: { cellWidth: 'auto' }, // Notes
          }),
    },
    didDrawPage: (data) => {
      // Running Footer on every page
      const pageStr = `Page ${data.pageNumber} of {total_pages_count_string}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      doc.text(
        'IWMS Pro Physical Warehouse Audit Sheet • Generated for inventory cycle reconciliation',
        margin,
        pageHeight - 8
      );
      doc.text(pageStr, pageWidth - margin, pageHeight - 8, { align: 'right' });
    },
  });

  // Calculate total pages for footer substitution
  if (typeof (doc as any).putTotalPages === 'function') {
    (doc as any).putTotalPages('{total_pages_count_string}');
  }

  // 4. Sign-off Verification Block (Add to the bottom of the table or next page)
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const signBlockHeight = 24;

  let signY = finalY + 6;
  if (signY + signBlockHeight > pageHeight - 16) {
    doc.addPage();
    signY = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, signY, pageWidth - margin * 2, signBlockHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  const signCol1 = margin + 8;
  const signCol2 = margin + 145;

  doc.text('Count Conducted By:', signCol1, signY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: _____________________________________', signCol1, signY + 14);
  doc.text('Date / Time: __________________', signCol1 + 76, signY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Supervisor Verification:', signCol2, signY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: _____________________________________', signCol2, signY + 14);
  doc.text('Date / Time: __________________', signCol2 + 76, signY + 14);

  return doc.output('blob');
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

package com.iwms.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Data Transfer Object for bulk dataset ingestion from CSV/JSON.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductImportDto(
        String sku,
        String name,
        String category,
        Double unitPrice,
        Double sellingPrice,
        Double costPrice,
        Integer minStockLevel,
        Integer reorderPoint,
        Integer currentStock,
        Integer quantity,
        String binLocation,
        String productType
) {
    public double effectiveUnitPrice() {
        if (unitPrice != null && unitPrice > 0) return unitPrice;
        if (sellingPrice != null && sellingPrice > 0) return sellingPrice;
        if (costPrice != null && costPrice > 0) return costPrice * 1.5;
        return 19.99;
    }

    public double effectiveCostPrice() {
        if (costPrice != null && costPrice > 0) return costPrice;
        return effectiveUnitPrice() * 0.6;
    }

    public int effectiveMinStock() {
        if (minStockLevel != null && minStockLevel >= 0) return minStockLevel;
        if (reorderPoint != null && reorderPoint >= 0) return reorderPoint;
        return 20;
    }

    public int effectiveQuantity() {
        if (quantity != null && quantity >= 0) return quantity;
        if (currentStock != null && currentStock >= 0) return currentStock;
        return 50;
    }
}

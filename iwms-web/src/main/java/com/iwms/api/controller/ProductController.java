package com.iwms.api.controller;

import com.iwms.api.dto.ProductDto;
import com.iwms.api.dto.ProductImportDto;
import com.iwms.api.filter.CustomAuthFilter;
import com.iwms.model.*;
import com.iwms.repository.Repository;
import com.iwms.service.InventoryService;
import com.iwms.storage.AuditLogger;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final InventoryService inventoryService;
    private final Repository<Product, String> productRepository;
    private final AuditLogger auditLogger;

    public ProductController(InventoryService inventoryService,
                             Repository<Product, String> productRepository,
                             AuditLogger auditLogger) {
        this.inventoryService = inventoryService;
        this.productRepository = productRepository;
        this.auditLogger = auditLogger;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts(HttpServletRequest request) {
        User user = (User) request.getAttribute(CustomAuthFilter.AUTH_USER_ATTR);
        boolean canViewCosts = user != null && user.hasPermission(Permission.VIEW_COST_PRICES);

        List<ProductDto> dtoList = inventoryService.getAllProducts().stream()
                .map(p -> toDto(p, canViewCosts))
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{sku}")
    public ResponseEntity<?> getProductBySku(@PathVariable("sku") String sku, HttpServletRequest request) {
        User user = (User) request.getAttribute(CustomAuthFilter.AUTH_USER_ATTR);
        boolean canViewCosts = user != null && user.hasPermission(Permission.VIEW_COST_PRICES);

        Product p = inventoryService.getProduct(sku);
        if (p == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found: " + sku));
        }

        inventoryService.recordProductView(sku);
        return ResponseEntity.ok(toDto(p, canViewCosts));
    }

    @DeleteMapping("/{sku}")
    public ResponseEntity<?> deleteProduct(@PathVariable("sku") String sku, HttpServletRequest request) throws Exception {
        User user = (User) request.getAttribute(CustomAuthFilter.AUTH_USER_ATTR);
        if (user == null || !user.hasPermission(Permission.DELETE_PRODUCTS)) {
            auditLogger.log(user != null ? user.getUsername() : "anonymous", "DELETE_PRODUCT", sku, "FORBIDDEN", "Insufficient permissions");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Permission denied: DELETE_PRODUCTS required"));
        }

        productRepository.deleteById(sku);
        auditLogger.log(user.getUsername(), "DELETE_PRODUCT", sku, "SUCCESS", "Product deleted by " + user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully: " + sku));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importProducts(@RequestBody List<ProductImportDto> importList, HttpServletRequest request) throws Exception {
        User user = (User) request.getAttribute(CustomAuthFilter.AUTH_USER_ATTR);
        if (user == null || (user.getRole() != Role.ADMIN && user.getRole() != Role.MANAGER)) {
            auditLogger.log(user != null ? user.getUsername() : "anonymous", "IMPORT_PRODUCTS", "BATCH", "FORBIDDEN", "Insufficient permissions");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Permission denied: Admin or Manager permission required to import products"));
        }

        if (importList == null || importList.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Import product list cannot be empty"));
        }

        int importedCount = 0;
        String creator = user.getUsername();

        for (ProductImportDto dto : importList) {
            if (dto.sku() == null || dto.sku().isBlank() || dto.name() == null || dto.name().isBlank()) {
                continue;
            }

            Category cat = Category.GENERAL;
            String catStr = (dto.category() != null ? dto.category() : (dto.productType() != null ? dto.productType() : "")).toUpperCase();
            if (catStr.contains("PERISH") || catStr.contains("FOOD") || catStr.contains("DAIRY")) {
                cat = Category.PERISHABLE;
            } else if (catStr.contains("ELEC") || catStr.contains("TECH") || catStr.contains("DEVICE")) {
                cat = Category.ELECTRONICS;
            } else if (catStr.contains("FRAG") || catStr.contains("GLASS") || catStr.contains("CERAMIC")) {
                cat = Category.FRAGILE;
            } else if (catStr.contains("BULK") || catStr.contains("HARDWARE")) {
                cat = Category.BULK;
            }

            Product product;
            switch (cat) {
                case PERISHABLE -> product = PerishableProduct.builder()
                        .sku(dto.sku().trim()).name(dto.name().trim()).category(cat)
                        .unitPrice(dto.effectiveUnitPrice()).costPrice(dto.effectiveCostPrice())
                        .minStockLevel(dto.effectiveMinStock()).shelfLifeDays(30)
                        .createdBy(creator).build();
                case ELECTRONICS -> product = ElectronicProduct.builder()
                        .sku(dto.sku().trim()).name(dto.name().trim()).category(cat)
                        .unitPrice(dto.effectiveUnitPrice()).costPrice(dto.effectiveCostPrice())
                        .minStockLevel(dto.effectiveMinStock()).warrantyMonths(12)
                        .createdBy(creator).build();
                case FRAGILE -> product = FragileProduct.builder()
                        .sku(dto.sku().trim()).name(dto.name().trim()).category(cat)
                        .unitPrice(dto.effectiveUnitPrice()).costPrice(dto.effectiveCostPrice())
                        .minStockLevel(dto.effectiveMinStock()).fragilityIndex(6)
                        .createdBy(creator).build();
                default -> product = BulkProduct.builder()
                        .sku(dto.sku().trim()).name(dto.name().trim()).category(Category.BULK)
                        .unitPrice(dto.effectiveUnitPrice()).costPrice(dto.effectiveCostPrice())
                        .minStockLevel(dto.effectiveMinStock()).weightKg(5.0)
                        .createdBy(creator).build();
            }

            productRepository.save(product);
            inventoryService.registerOrUpdateProduct(product);

            String binId = (dto.binLocation() != null && !dto.binLocation().isBlank()) ? dto.binLocation().trim() : "BIN-A1";
            Bin bin = inventoryService.ensureBinExists(binId, cat.name() + " Storage", cat);

            int qty = dto.effectiveQuantity();
            if (qty > 0 && inventoryService.getCurrentStock(product.getSku()) == 0) {
                try {
                    inventoryService.stockIn(product.getSku(), "BATCH-IMP-" + product.getSku(), bin.getId(), qty,
                            LocalDate.now().plusMonths(6), "Dataset Import", creator);
                } catch (Exception ignored) {
                }
            }

            importedCount++;
        }

        auditLogger.log(creator, "IMPORT_PRODUCTS", "COUNT:" + importedCount, "SUCCESS", "Imported " + importedCount + " products");
        return ResponseEntity.ok(Map.of("message", "Successfully imported " + importedCount + " products", "importedCount", importedCount));
    }

    private ProductDto toDto(Product p, boolean canViewCosts) {
        int currentStock = inventoryService.getCurrentStock(p.getSku());
        Double costPrice = canViewCosts ? p.getCostPrice() : null;
        return new ProductDto(
                p.getSku(),
                p.getName(),
                p.getCategory().name(),
                p.getUnitPrice(),
                costPrice,
                p.getMinStockLevel(),
                currentStock,
                p.calculateStorageCost(),
                p.getHandlingRules()
        );
    }
}

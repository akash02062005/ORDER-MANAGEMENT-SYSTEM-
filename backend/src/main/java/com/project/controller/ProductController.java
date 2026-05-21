package com.project.controller;

import com.project.model.Product;
import com.project.service.ProductService;
import com.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        product.setId(null); // ensure new document
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Product existing = productService.getProductById(id);
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStock(product.getStock());
        existing.setCategory(product.getCategory());
        if (product.getImageUrl() != null) existing.setImageUrl(product.getImageUrl());
        return ResponseEntity.ok(productService.saveProduct(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /** Quick stock adjustment: PATCH /api/products/{id}/stock?delta=50 */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> adjustStock(@PathVariable String id, @RequestParam int delta) {
        try {
            Product product = productService.getProductById(id);
            int oldStock = product.getStock();
            int newStock = Math.max(0, oldStock + delta);
            product.setStock(newStock);
            Product saved = productService.saveProduct(product);

            // Push notification for stock change
            String action = delta > 0 ? "restocked" : "reduced";
            notificationService.push(
                null,
                "Stock " + (delta > 0 ? "Restocked" : "Updated"),
                product.getName() + " " + action + ": " + oldStock + " → " + newStock + " units",
                "warning",
                "/inventory"
            );

            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }
}

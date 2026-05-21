package com.project.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String customerId;
    private String customerName;
    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private String status; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;

        @JsonAlias({"qty"})
        private int quantity;

        @JsonAlias({"price"})
        private BigDecimal unitPrice;

        private BigDecimal subtotal;
    }
}

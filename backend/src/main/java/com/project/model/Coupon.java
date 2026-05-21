package com.project.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupons")
public class Coupon {
    @Id
    private String id;
    private String code;
    private String type; // PERCENT, FLAT
    private BigDecimal value;
    private Integer usageLimit;
    private Integer usageCount;
    private LocalDate expiresAt;
    private boolean active;
    private BigDecimal minOrderValue;
}

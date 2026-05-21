package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerStats {
    private String customerId;
    private String customerName;
    private long orderCount;
    private BigDecimal totalSpent;
}

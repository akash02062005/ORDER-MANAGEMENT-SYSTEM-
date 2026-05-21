package com.project.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a SaaS subscription a user holds.
 * One row per (user, plan) lifecycle. Status transitions:
 *   PENDING  -> ACTIVE  (after webhook confirms payment)
 *   ACTIVE   -> CANCELLED (user cancels)
 *   ACTIVE   -> PAST_DUE  (recurring charge fails)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subscriptions")
public class Subscription {
    @Id
    private String id;

    private String userId;
    private String userEmail;

    private String plan;          // FREE | PREMIUM | PRO
    private String gateway;       // razorpay
    private String status;        // PENDING | ACTIVE | CANCELLED | PAST_DUE | EXPIRED

    // Gateway references
    private String gatewayCustomerId;
    private String gatewaySubscriptionId;
    private String gatewayPaymentId;
    private String gatewayOrderId;

    private BigDecimal amount;
    private String currency;      // usd | inr
    private String interval;      // month | year

    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
}

package com.project.service;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Single source of truth for SaaS plan pricing.
 * Amounts are in the SMALLEST currency unit (paise / cents).
 * Razorpay is the sole payment gateway.
 */
@Component
public class PlanCatalog {

    public static class Plan {
        public final String id;
        public final String name;
        public final long amountInr;     // paise
        public final long amountUsd;     // cents
        public final int orderQuota;
        public final List<String> features;

        Plan(String id, String name, long inr, long usd, int quota, List<String> features) {
            this.id = id;
            this.name = name;
            this.amountInr = inr;
            this.amountUsd = usd;
            this.orderQuota = quota;
            this.features = features;
        }
    }

    private final Map<String, Plan> plans = Map.of(
            "FREE", new Plan("FREE", "Free", 0, 0, 100,
                    List.of("Up to 100 orders / month", "Basic analytics", "Community support", "1 team member")),
            "PREMIUM", new Plan("PREMIUM", "Premium", 249900, 2900, 5000,
                    List.of("Unlimited orders", "Advanced analytics", "Priority support", "5 team members", "Custom export")),
            "PRO", new Plan("PRO", "Pro", 799900, 9900, Integer.MAX_VALUE,
                    List.of("Everything in Premium", "API access", "White-labeling", "Dedicated manager", "24/7 phone support"))
    );

    public Plan get(String id) {
        Plan p = plans.get(id == null ? "FREE" : id.toUpperCase());
        if (p == null) throw new IllegalArgumentException("Unknown plan: " + id);
        return p;
    }

    public Map<String, Plan> all() {
        return plans;
    }

    public long amountFor(String planId, String currency) {
        Plan p = get(planId);
        return "inr".equalsIgnoreCase(currency) ? p.amountInr : p.amountUsd;
    }
}

package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private String plan;       // PREMIUM | PRO
    private String interval;   // month | year
    private String currency;   // usd | inr
    private String successUrl; // optional, frontend return URLs
    private String cancelUrl;
}

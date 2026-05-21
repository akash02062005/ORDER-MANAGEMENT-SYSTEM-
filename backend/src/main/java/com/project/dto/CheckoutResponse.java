package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private String gateway;          // razorpay
    private String checkoutUrl;      // reserved for hosted checkout flows
    private String orderId;          // razorpay order id (order_xxx)
    private String publicKey;        // razorpay key_id, returned so frontend can mount widget
    private long amount;             // amount in smallest currency unit
    private String currency;
    private String subscriptionId;   // our internal Subscription doc id
}

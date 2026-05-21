package com.project.controller;

import com.project.dto.CheckoutRequest;
import com.project.dto.CheckoutResponse;
import com.project.model.Subscription;
import com.project.model.User;
import com.project.repository.SubscriptionRepository;
import com.project.service.AuthService;
import com.project.service.PlanCatalog;
import com.project.service.RazorpayService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired private RazorpayService razorpayService;
    @Autowired private AuthService authService;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private PlanCatalog planCatalog;

    @GetMapping("/plans")
    public ResponseEntity<Map<String, PlanCatalog.Plan>> plans() {
        return ResponseEntity.ok(planCatalog.all());
    }

    @PostMapping("/razorpay/checkout")
    public ResponseEntity<?> razorpayCheckout(@RequestBody CheckoutRequest req, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        try {
            User user = authService.getUserByUsername(principal.getName());
            CheckoutResponse resp = razorpayService.createOrder(user, req);
            return ResponseEntity.ok(resp);
        } catch (RazorpayException e) {
            return ResponseEntity.status(502).body(Map.of("error", "Razorpay error: " + e.getMessage()));
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> razorpayVerify(@RequestBody Map<String, String> body) {
        boolean ok = razorpayService.verifyAndActivate(
                body.get("razorpay_order_id"),
                body.get("razorpay_payment_id"),
                body.get("razorpay_signature")
        );
        Map<String, Object> resp = new HashMap<>();
        resp.put("verified", ok);
        return ok ? ResponseEntity.ok(resp) : ResponseEntity.status(400).body(resp);
    }

    @PostMapping("/razorpay/webhook")
    public ResponseEntity<String> razorpayWebhook(@RequestBody String payload,
                                                  @RequestHeader(value = "X-Razorpay-Signature", required = false) String sig) {
        razorpayService.handleWebhook(payload, sig == null ? "" : sig);
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/subscription")
    public ResponseEntity<?> mySubscription(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = authService.getUserByUsername(principal.getName());
        List<Subscription> subs = subscriptionRepository.findByUserId(user.getId());
        Map<String, Object> resp = new HashMap<>();
        resp.put("plan", user.getSubscription() == null ? "FREE" : user.getSubscription());
        resp.put("history", subs);
        return ResponseEntity.ok(resp);
    }
}

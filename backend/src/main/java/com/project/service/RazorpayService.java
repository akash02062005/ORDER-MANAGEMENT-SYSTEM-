package com.project.service;

import com.project.dto.CheckoutRequest;
import com.project.dto.CheckoutResponse;
import com.project.model.Subscription;
import com.project.model.User;
import com.project.repository.SubscriptionRepository;
import com.project.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Razorpay integration for INR / India payments.
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID         - rzp_test_xxx
 *   RAZORPAY_KEY_SECRET     - secret
 *   RAZORPAY_WEBHOOK_SECRET - configured in dashboard
 *
 * Flow:
 *   1) Frontend calls /api/payments/razorpay/checkout -> we create an order
 *      and return order_id + key_id.
 *   2) Frontend mounts Razorpay Checkout JS widget with these.
 *   3) On success, frontend calls /api/payments/razorpay/verify with the
 *      payment_id, order_id, signature triple. We verify HMAC and activate.
 *   4) Webhook also fires server-side as a redundant safety net.
 */
@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Autowired private PlanCatalog planCatalog;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    private RazorpayClient client;

    @PostConstruct
    public void init() {
        if (keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank()) {
            try {
                client = new RazorpayClient(keyId, keySecret);
                log.info("Razorpay client initialized");
            } catch (RazorpayException e) {
                log.error("Failed to initialize Razorpay client", e);
            }
        } else {
            log.warn("Razorpay keys not configured - INR checkout will fail until RAZORPAY_KEY_ID/SECRET are set");
        }
    }

    public CheckoutResponse createOrder(User user, CheckoutRequest req) throws RazorpayException {
        if (client == null) throw new RazorpayException("Razorpay not configured");

        PlanCatalog.Plan plan = planCatalog.get(req.getPlan());
        long amount = planCatalog.amountFor(plan.id, "inr");

        Subscription sub = new Subscription();
        sub.setUserId(user.getId());
        sub.setUserEmail(user.getEmail());
        sub.setPlan(plan.id);
        sub.setGateway("razorpay");
        sub.setStatus("PENDING");
        sub.setAmount(BigDecimal.valueOf(amount).movePointLeft(2));
        sub.setCurrency("inr");
        sub.setInterval(req.getInterval() == null ? "month" : req.getInterval());
        sub.setCreatedAt(LocalDateTime.now());
        sub.setUpdatedAt(LocalDateTime.now());
        sub = subscriptionRepository.save(sub);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "sub_" + sub.getId());
        orderRequest.put("notes", new JSONObject()
                .put("subscriptionId", sub.getId())
                .put("userId", user.getId())
                .put("plan", plan.id));

        com.razorpay.Order order = client.orders.create(orderRequest);
        String orderId = order.get("id");

        sub.setGatewayOrderId(orderId);
        sub.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        return new CheckoutResponse("razorpay", null, orderId, keyId, amount, "inr", sub.getId());
    }

    /**
     * Called by frontend after the user completes the Razorpay Checkout widget.
     * We verify the HMAC-SHA256 signature: HMAC(orderId|paymentId, key_secret).
     */
    public boolean verifyAndActivate(String orderId, String paymentId, String signature) {
        try {
            JSONObject attrs = new JSONObject();
            attrs.put("razorpay_order_id", orderId);
            attrs.put("razorpay_payment_id", paymentId);
            attrs.put("razorpay_signature", signature);
            boolean ok = Utils.verifyPaymentSignature(attrs, keySecret);
            if (!ok) {
                log.warn("Razorpay signature verification failed for order {}", orderId);
                return false;
            }
            subscriptionRepository.findByGatewayOrderId(orderId).ifPresent(sub -> {
                sub.setStatus("ACTIVE");
                sub.setGatewayPaymentId(paymentId);
                sub.setCurrentPeriodStart(LocalDateTime.now());
                sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
                sub.setUpdatedAt(LocalDateTime.now());
                subscriptionRepository.save(sub);

                userRepository.findById(sub.getUserId()).ifPresent(u -> {
                    u.setSubscription(sub.getPlan());
                    userRepository.save(u);
                    notificationService.push(
                        u.getId(),
                        "Payment Successful",
                        "Your " + sub.getPlan() + " plan is now active! Payment of ₹" + sub.getAmount() + " confirmed.",
                        "success",
                        "/billing"
                    );
                });
            });
            return true;
        } catch (RazorpayException e) {
            log.error("Razorpay verification error", e);
            return false;
        }
    }

    /**
     * Webhook handler. Razorpay sends X-Razorpay-Signature header which is
     * HMAC-SHA256 of the raw body using the webhook secret.
     */
    public void handleWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("RAZORPAY_WEBHOOK_SECRET not set; skipping verification");
        } else {
            try {
                Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            } catch (RazorpayException e) {
                log.warn("Razorpay webhook signature invalid", e);
                return;
            }
        }

        JSONObject event = new JSONObject(payload);
        String eventName = event.optString("event");
        log.info("Razorpay webhook: {}", eventName);

        if ("payment.captured".equals(eventName) || "order.paid".equals(eventName)) {
            JSONObject payload2 = event.optJSONObject("payload");
            if (payload2 == null) return;
            JSONObject payment = payload2.optJSONObject("payment");
            if (payment == null) return;
            JSONObject entity = payment.optJSONObject("entity");
            if (entity == null) return;
            String orderId = entity.optString("order_id");
            String paymentId = entity.optString("id");
            subscriptionRepository.findByGatewayOrderId(orderId).ifPresent(sub -> {
                if (!"ACTIVE".equals(sub.getStatus())) {
                    sub.setStatus("ACTIVE");
                    sub.setGatewayPaymentId(paymentId);
                    sub.setCurrentPeriodStart(LocalDateTime.now());
                    sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
                    sub.setUpdatedAt(LocalDateTime.now());
                    subscriptionRepository.save(sub);
                    userRepository.findById(sub.getUserId()).ifPresent(u -> {
                        u.setSubscription(sub.getPlan());
                        userRepository.save(u);
                    });
                }
            });
        }
    }
}

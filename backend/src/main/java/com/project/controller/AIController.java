package com.project.controller;

import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {
    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductRepository productRepo;

    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, String> body) {
        String q = body.getOrDefault("question", "").toLowerCase();
        String answer;
        if (q.contains("revenue") || q.contains("sales")) {
            answer = "Revenue is up 18.2% MoM. Primary drivers: Electronics (+42%) and Accessories (+28%).";
        } else if (q.contains("forecast")) {
            answer = "Based on historical trends, I forecast ₹14.2L next quarter with ±8% confidence.";
        } else if (q.contains("trending") || q.contains("product")) {
            answer = "Top trending products: 1) Wireless Earbuds Pro (+64%) 2) Smart Watch V3 (+52%) 3) USB-C Hub (+41%).";
        } else if (q.contains("churn") || q.contains("risk")) {
            answer = "I detected 28 high-LTV customers at churn risk. Recommended: send 15% win-back coupon within 48h.";
        } else {
            answer = "I'm your AI analyst. Try asking about revenue, forecasts, trending products or churn risk.";
        }
        return Map.of("answer", answer, "source", "AI Insights Engine");
    }

    @GetMapping("/insights")
    public List<Map<String, Object>> insights() {
        return List.of(
            Map.of("type", "growth", "title", "Revenue up 18%", "text", "Electronics category drove 42% of growth"),
            Map.of("type", "stock", "title", "3 SKUs running low", "text", "Reorder top sellers within 5 days"),
            Map.of("type", "upsell", "title", "Upsell opportunity", "text", "142 customers ready for cross-sell"),
            Map.of("type", "retention", "title", "Retention alert", "text", "28 VIP customers need re-engagement")
        );
    }
}

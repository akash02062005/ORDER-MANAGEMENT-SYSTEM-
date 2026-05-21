package com.project.controller;

import com.project.model.Order;
import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import com.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private CustomerRepository customerRepo;

    @GetMapping("/sales/csv")
    public ResponseEntity<byte[]> salesCsv() {
        List<Order> orders = orderRepo.findAll();
        StringBuilder sb = new StringBuilder("id,customer,amount,status,createdAt\n");
        for (Order o : orders) {
            sb.append(o.getId()).append(',')
              .append(safe(o.getCustomerName())).append(',')
              .append(o.getTotalAmount()).append(',')
              .append(o.getStatus()).append(',')
              .append(o.getCreatedAt()).append('\n');
        }
        return csvResponse("sales.csv", sb.toString());
    }

    @GetMapping("/tax/summary")
    public Map<String, Object> taxSummary() {
        List<Order> orders = orderRepo.findAll();
        BigDecimal gross = orders.stream()
            .filter(o -> o.getTotalAmount() != null)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = gross.multiply(new BigDecimal("0.18"));
        return Map.of("gross", gross, "tax18", tax, "net", gross.subtract(tax), "count", orders.size());
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return Map.of(
            "totalOrders", orderRepo.count(),
            "totalProducts", productRepo.count(),
            "totalCustomers", customerRepo.count()
        );
    }

    private ResponseEntity<byte[]> csvResponse(String filename, String content) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.parseMediaType("text/csv"));
        h.setContentDispositionFormData("attachment", filename);
        return new ResponseEntity<>(content.getBytes(), h, 200);
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace(',', ' ');
    }
}

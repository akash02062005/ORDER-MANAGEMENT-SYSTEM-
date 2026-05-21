package com.project.controller;

import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import com.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {
    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private CustomerRepository customerRepo;

    @GetMapping
    public Map<String, Object> search(@RequestParam String q) {
        String lower = q == null ? "" : q.toLowerCase();
        List<Map<String, Object>> orders = new ArrayList<>();
        orderRepo.findAll().stream().limit(50).forEach(o -> {
            if (o.getCustomerName() != null && o.getCustomerName().toLowerCase().contains(lower)) {
                orders.add(Map.of("type", "order", "id", o.getId(), "label", "Order " + o.getId(), "meta", o.getCustomerName()));
            }
        });
        List<Map<String, Object>> products = new ArrayList<>();
        productRepo.findAll().stream().limit(50).forEach(p -> {
            if (p.getName() != null && p.getName().toLowerCase().contains(lower)) {
                products.add(Map.of("type", "product", "id", p.getId(), "label", p.getName(), "meta", "₹" + p.getPrice()));
            }
        });
        List<Map<String, Object>> customers = new ArrayList<>();
        customerRepo.findAll().stream().limit(50).forEach(c -> {
            if (c.getName() != null && c.getName().toLowerCase().contains(lower)) {
                customers.add(Map.of("type", "customer", "id", c.getId(), "label", c.getName(), "meta", c.getEmail() != null ? c.getEmail() : ""));
            }
        });
        return Map.of("orders", orders, "products", products, "customers", customers);
    }
}

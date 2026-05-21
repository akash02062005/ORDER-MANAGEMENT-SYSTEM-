package com.project.controller;

import com.project.dto.CustomerStats;
import com.project.model.Order;
import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import com.project.repository.CustomerRepository;
import com.project.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        List<Order> orders = orderRepository.findAll();
        long totalProducts = productRepository.count();
        long totalCustomers = customerRepository.count();

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", orders.size());
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalProducts", totalProducts);
        summary.put("totalCustomers", totalCustomers);
        summary.put("pendingOrders", orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count());

        return summary;
    }

    @GetMapping("/sales-by-status")
    public Map<String, Long> getSalesByStatus() {
        List<Order> orders = orderRepository.findAll();
        Map<String, Long> statusCounts = new HashMap<>();
        for (Order order : orders) {
            statusCounts.put(order.getStatus(), statusCounts.getOrDefault(order.getStatus(), 0L) + 1);
        }
        return statusCounts;
    }

    @GetMapping("/top-customers")
    public List<CustomerStats> getTopCustomers() {
        return orderService.getTopCustomers();
    }

    /**
     * Revenue trend for the last 7 days — used by the Dashboard area chart.
     * Returns real aggregated data from the orders collection.
     */
    @GetMapping("/revenue-trend")
    public List<Map<String, Object>> getRevenueTrend() {
        List<Order> allOrders = orderRepository.findAll();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

            List<Order> dayOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null)
                    .filter(o -> !o.getCreatedAt().isBefore(dayStart) && o.getCreatedAt().isBefore(dayEnd))
                    .filter(o -> !"CANCELLED".equals(o.getStatus()))
                    .collect(Collectors.toList());

            BigDecimal dayRevenue = dayOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("name", date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            point.put("date", date.toString());
            point.put("revenue", dayRevenue);
            point.put("orders", dayOrders.size());
            trend.add(point);
        }
        return trend;
    }

    /**
     * Monthly revenue for the last 12 months — used by SaaS Admin MRR chart.
     */
    @GetMapping("/monthly-revenue")
    public List<Map<String, Object>> getMonthlyRevenue() {
        List<Order> allOrders = orderRepository.findAll();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1);
            LocalDateTime start = monthStart.atStartOfDay();
            LocalDateTime end = monthEnd.atStartOfDay();

            BigDecimal monthRevenue = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null)
                    .filter(o -> !o.getCreatedAt().isBefore(start) && o.getCreatedAt().isBefore(end))
                    .filter(o -> !"CANCELLED".equals(o.getStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long monthOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null)
                    .filter(o -> !o.getCreatedAt().isBefore(start) && o.getCreatedAt().isBefore(end))
                    .count();

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            point.put("revenue", monthRevenue);
            point.put("orders", monthOrders);
            monthly.add(point);
        }
        return monthly;
    }
}

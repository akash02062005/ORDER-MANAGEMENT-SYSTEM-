package com.project.service;

import com.project.dto.CustomerStats;
import com.project.model.Order;
import com.project.model.Notification;
import com.project.model.Product;
import com.project.model.Shipment;
import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import com.project.websocket.OrderPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderPublisher orderPublisher;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ShipmentService shipmentService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order createOrder(Order order) {
        // Ensure ID is null so MongoDB auto-generates it
        order.setId(null);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("PENDING");
        }

        BigDecimal total = BigDecimal.ZERO;

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (Order.OrderItem item : order.getItems()) {
                // If item has a productId, look up the product and deduct stock
                if (item.getProductId() != null && !item.getProductId().isBlank()) {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

                    int qty = item.getQuantity() > 0 ? item.getQuantity() : 1;
                    if (product.getStock() < qty) {
                        throw new RuntimeException("Not enough stock for product: " + product.getName());
                    }

                    product.setStock(product.getStock() - qty);
                    productRepository.save(product);

                    item.setProductName(product.getName());
                    item.setQuantity(qty);
                    if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) == 0) {
                        item.setUnitPrice(product.getPrice());
                    }
                    item.setSubtotal(item.getUnitPrice().multiply(new BigDecimal(qty)));
                } else {
                    // Manual order item — no product lookup needed
                    int qty = item.getQuantity() > 0 ? item.getQuantity() : 1;
                    item.setQuantity(qty);
                    if (item.getUnitPrice() == null) {
                        item.setUnitPrice(BigDecimal.ZERO);
                    }
                    item.setSubtotal(item.getUnitPrice().multiply(new BigDecimal(qty)));
                }
                total = total.add(item.getSubtotal());
            }
        }

        // Use provided total if items total is zero (manual order with explicit amount)
        if (total.compareTo(BigDecimal.ZERO) > 0) {
            order.setTotalAmount(total);
        } else if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
            order.setTotalAmount(BigDecimal.ZERO);
        }

        Order savedOrder = orderRepository.save(order);
        orderPublisher.publishOrderUpdate(savedOrder);

        // Auto-create a Shipment so the Shipments page reflects real orders.
        // Failure here must not roll back the order — just log it.
        try {
            Shipment shipment = new Shipment();
            shipment.setOrderId(savedOrder.getId());
            shipment.setCarrier(pickCarrier());
            shipment.setOriginCity("Warehouse");
            shipment.setDestinationCity(
                    savedOrder.getCustomerName() != null ? savedOrder.getCustomerName() + "'s address" : "Customer address");
            shipment.setStage("PICKED");
            shipmentService.create(shipment);
        } catch (Exception shipErr) {
            // Don't block the order create on shipment failure
            System.err.println("WARN: Failed to auto-create shipment for order "
                    + savedOrder.getId() + ": " + shipErr.getMessage());
        }

        // Push notification
        notificationService.push(
            null,
            "New Order Created",
            "Order #" + savedOrder.getId().substring(Math.max(0, savedOrder.getId().length() - 6)).toUpperCase()
                + " from " + savedOrder.getCustomerName() + " — ₹" + savedOrder.getTotalAmount(),
            "order",
            "/orders"
        );

        return savedOrder;
    }

    private static final String[] CARRIERS = {"BlueDart", "Delhivery", "DTDC", "FedEx", "Ecom Express"};
    private String pickCarrier() {
        return CARRIERS[(int) (Math.random() * CARRIERS.length)];
    }

    public Order updateOrderStatus(String id, String status) {
        Order order = getOrderById(id);
        String oldStatus = order.getStatus();
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        orderPublisher.publishOrderUpdate(savedOrder);

        // Push notification for status change
        notificationService.push(
            null,
            "Order Status Updated",
            "Order #" + id.substring(Math.max(0, id.length() - 6)).toUpperCase()
                + " changed from " + oldStatus + " to " + status,
            "order",
            "/orders"
        );

        return savedOrder;
    }

    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<CustomerStats> getTopCustomers() {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.group("customerId", "customerName")
                .count().as("orderCount")
                .sum("totalAmount").as("totalSpent"),
            Aggregation.sort(Sort.Direction.DESC, "totalSpent"),
            Aggregation.limit(5)
        );

        AggregationResults<CustomerStats> results = mongoTemplate.aggregate(aggregation, "orders", CustomerStats.class);
        return results.getMappedResults();
    }
}

package com.project.service;

import com.project.model.Customer;
import com.project.model.Order;
import com.project.model.Product;
import com.project.model.User;
import com.project.repository.CustomerRepository;
import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import com.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;

@Service
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    public void seedData() {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (productRepository.count() == 0) {
            seedProducts();
        }
        if (customerRepository.count() == 0) {
            seedCustomers();
        }
        if (orderRepository.count() == 0) {
            seedOrders();
        }
    }

    private void seedUsers() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Admin@2026"));
        admin.setEmail("admin@orderstream.app");
        admin.setName("System Admin");
        admin.setRoles(new HashSet<>(Collections.singletonList("ROLE_ADMIN")));
        admin.setVerified(true);
        admin.setSubscription("PRO");
        admin.setCreatedAt(LocalDateTime.now());
        userRepository.save(admin);

        User manager = new User();
        manager.setUsername("manager");
        manager.setPassword(passwordEncoder.encode("Manager@2026"));
        manager.setEmail("manager@orderstream.app");
        manager.setName("Operations Manager");
        manager.setRoles(new HashSet<>(Collections.singletonList("ROLE_MANAGER")));
        manager.setVerified(true);
        manager.setSubscription("PREMIUM");
        manager.setCreatedAt(LocalDateTime.now());
        userRepository.save(manager);

        User customer = new User();
        customer.setUsername("demo");
        customer.setPassword(passwordEncoder.encode("Demo@2026"));
        customer.setEmail("demo@orderstream.app");
        customer.setName("Demo User");
        customer.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));
        customer.setVerified(true);
        customer.setSubscription("FREE");
        customer.setCreatedAt(LocalDateTime.now());
        userRepository.save(customer);
    }

    private void seedProducts() {
        List<Product> products = new ArrayList<>();
        
        String[][] items = {
            {"iPhone 15 Pro", "Latest flagship smartphone", "120000", "50", "Electronics"},
            {"MacBook Air M2", "Slim and powerful laptop", "110000", "30", "Electronics"},
            {"Sony WH-1000XM5", "Noise cancelling headphones", "30000", "100", "Electronics"},
            {"Air Fryer", "Healthy cooking assistant", "8000", "150", "Home & Kitchen"},
            {"Electric Kettle", "Fast boiling heater", "2500", "200", "Home & Kitchen"},
            {"Yoga Mat", "Premium non-slip mat", "1500", "300", "Fitness"},
            {"Dumbbell Set", "Adjustable weight set", "5000", "80", "Fitness"},
            {"Leather Jacket", "Classic black leather jacket", "4500", "60", "Fashion"},
            {"Running Shoes", "Lightweight athletic shoes", "3500", "120", "Fashion"}
        };

        for (String[] item : items) {
            Product product = new Product();
            product.setName(item[0]);
            product.setDescription(item[1]);
            product.setPrice(new BigDecimal(item[2]));
            product.setStock(Integer.parseInt(item[3]));
            product.setCategory(item[4]);
            product.setImageUrl("https://placehold.co/400x400?text=" + item[0].replace(" ", "+"));
            products.add(product);
        }

        productRepository.saveAll(products);
    }

    private void seedCustomers() {
        List<Customer> customers = new ArrayList<>();
        String[][] customerData = {
            {"Rajesh Menon", "rajesh.menon@techcorp.in", "+919876543001", "42, Brigade Road, Bangalore"},
            {"Ananya Krishnan", "ananya.k@innovate.co", "+919876543002", "15, Anna Salai, Chennai"},
            {"Vikram Desai", "vikram.desai@globalmart.com", "+919876543003", "88, MG Road, Pune"},
            {"Meera Gupta", "meera.gupta@nexusretail.in", "+919876543004", "27, Park Street, Kolkata"},
            {"Arjun Nair", "arjun.nair@cloudworks.io", "+919876543005", "63, Jubilee Hills, Hyderabad"}
        };

        for (String[] data : customerData) {
            Customer customer = new Customer();
            customer.setName(data[0]);
            customer.setEmail(data[1]);
            customer.setPhone(data[2]);
            customer.setAddress(data[3]);
            customer.setTotalOrders(0);
            customers.add(customer);
        }
        customerRepository.saveAll(customers);
    }

    private void seedOrders() {
        List<Customer> customers = customerRepository.findAll();
        List<Product> products = productRepository.findAll();
        
        if (customers.isEmpty() || products.isEmpty()) return;

        List<Order> orders = new ArrayList<>();
        String[] statuses = {"PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"};

        // Generate 20 random orders
        for (int i = 0; i < 20; i++) {
            Customer c = customers.get(random.nextInt(customers.size()));
            Order order = new Order();
            order.setCustomerId(c.getId());
            order.setCustomerName(c.getName());
            
            // Random items (1 to 3 items per order)
            int itemCount = random.nextInt(3) + 1;
            List<Order.OrderItem> orderItems = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;

            for (int j = 0; j < itemCount; j++) {
                Product p = products.get(random.nextInt(products.size()));
                int qty = random.nextInt(3) + 1;
                BigDecimal subtotal = p.getPrice().multiply(new BigDecimal(qty));
                
                Order.OrderItem item = new Order.OrderItem();
                item.setProductId(p.getId());
                item.setProductName(p.getName());
                item.setQuantity(qty);
                item.setUnitPrice(p.getPrice());
                item.setSubtotal(subtotal);
                
                orderItems.add(item);
                total = total.add(subtotal);
            }

            order.setItems(orderItems);
            order.setTotalAmount(total);
            order.setStatus(statuses[random.nextInt(statuses.length)]);
            order.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
            order.setUpdatedAt(LocalDateTime.now());
            
            orders.add(order);
        }

        orderRepository.saveAll(orders);
    }
}

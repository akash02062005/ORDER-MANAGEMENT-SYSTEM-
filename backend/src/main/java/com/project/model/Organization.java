package com.project.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "organizations")
public class Organization {
    @Id
    private String id;
    private String name;
    private String slug;
    private String industry;
    private String size; // 1-10, 11-50, 51-200, 201-500, 500+
    private String plan; // FREE, PREMIUM, PRO
    private String ownerId;
    private List<String> memberIds;
    private String website;
    private String logo;
    private String timezone;
    private String currency; // INR, USD, EUR
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
    private OrganizationSettings settings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationSettings {
        private boolean emailNotifications;
        private boolean slackIntegration;
        private boolean autoInvoicing;
        private String defaultTaxRate;
        private String defaultShippingMethod;
    }
}

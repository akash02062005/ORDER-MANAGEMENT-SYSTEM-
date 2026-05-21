package com.project.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;
    private String actorId;
    private String actorName;
    private String action;     // CREATE, UPDATE, DELETE, LOGIN, etc.
    private String entityType; // ORDER, PRODUCT, USER, INVOICE
    private String entityId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
}

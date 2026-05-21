package com.project.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String invoiceNumber;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private BigDecimal amount;
    private BigDecimal tax;
    private BigDecimal total;
    private String currency = "INR";
    private String status; // DRAFT, SENT, PAID, OVERDUE, VOID
    private LocalDate issuedAt;
    private LocalDate dueAt;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String notes;
    private String pdfUrl;
}

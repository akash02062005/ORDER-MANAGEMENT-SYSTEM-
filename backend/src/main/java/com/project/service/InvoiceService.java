package com.project.service;

import com.project.model.Invoice;
import com.project.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {
    @Autowired private InvoiceRepository repo;

    public List<Invoice> list() { return repo.findAll(); }

    public Invoice get(String id) { return repo.findById(id).orElse(null); }

    public List<Invoice> byStatus(String status) { return repo.findByStatus(status); }

    public Invoice create(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        }
        if (invoice.getIssuedAt() == null) invoice.setIssuedAt(LocalDate.now());
        if (invoice.getDueAt() == null) invoice.setDueAt(LocalDate.now().plusDays(14));
        if (invoice.getStatus() == null) invoice.setStatus("DRAFT");
        if (invoice.getTax() == null) invoice.setTax(invoice.getAmount().multiply(new BigDecimal("0.18")));
        if (invoice.getTotal() == null) invoice.setTotal(invoice.getAmount().add(invoice.getTax()));
        invoice.setCreatedAt(LocalDateTime.now());
        return repo.save(invoice);
    }

    public Invoice markPaid(String id) {
        Invoice inv = repo.findById(id).orElseThrow();
        inv.setStatus("PAID");
        inv.setPaidAt(LocalDateTime.now());
        return repo.save(inv);
    }

    public Invoice send(String id) {
        Invoice inv = repo.findById(id).orElseThrow();
        inv.setStatus("SENT");
        return repo.save(inv);
    }

    public void delete(String id) { repo.deleteById(id); }
}

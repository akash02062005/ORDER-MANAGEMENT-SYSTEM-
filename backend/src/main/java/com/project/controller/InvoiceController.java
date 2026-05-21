package com.project.controller;

import com.project.model.Invoice;
import com.project.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {
    @Autowired private InvoiceService service;

    @GetMapping
    public List<Invoice> list(@RequestParam(required = false) String status) {
        return status != null ? service.byStatus(status) : service.list();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> get(@PathVariable String id) {
        Invoice inv = service.get(id);
        return inv != null ? ResponseEntity.ok(inv) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) { return service.create(invoice); }

    @PostMapping("/{id}/mark-paid")
    public Invoice markPaid(@PathVariable String id) { return service.markPaid(id); }

    @PostMapping("/{id}/send")
    public Invoice send(@PathVariable String id) { return service.send(id); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

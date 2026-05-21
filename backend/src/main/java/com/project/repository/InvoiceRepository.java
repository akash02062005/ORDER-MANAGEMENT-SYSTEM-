package com.project.repository;

import com.project.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByStatus(String status);
    List<Invoice> findByCustomerId(String customerId);
}

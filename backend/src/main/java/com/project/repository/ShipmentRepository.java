package com.project.repository;

import com.project.model.Shipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends MongoRepository<Shipment, String> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    List<Shipment> findByStage(String stage);
    List<Shipment> findByOrderId(String orderId);
}

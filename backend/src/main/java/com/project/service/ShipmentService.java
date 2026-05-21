package com.project.service;

import com.project.model.Shipment;
import com.project.repository.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShipmentService {
    @Autowired private ShipmentRepository repo;

    public List<Shipment> list() { return repo.findAll(); }

    public Shipment create(Shipment s) {
        if (s.getTrackingNumber() == null) s.setTrackingNumber("TRK" + System.currentTimeMillis());
        if (s.getStage() == null) s.setStage("PICKED");
        if (s.getProgress() == null) s.setProgress(10);
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return repo.save(s);
    }

    public Shipment updateStage(String id, String stage) {
        Shipment s = repo.findById(id).orElseThrow();
        s.setStage(stage);
        s.setProgress(switch (stage) {
            case "PICKED" -> 20;
            case "IN_TRANSIT" -> 50;
            case "OUT_FOR_DELIVERY" -> 85;
            case "DELIVERED" -> 100;
            default -> s.getProgress();
        });
        s.setUpdatedAt(LocalDateTime.now());
        return repo.save(s);
    }

    public Shipment track(String trackingNumber) {
        return repo.findByTrackingNumber(trackingNumber).orElse(null);
    }
}

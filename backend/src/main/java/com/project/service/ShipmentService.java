package com.project.service;

import com.project.model.Shipment;
import com.project.repository.ShipmentRepository;
import com.project.websocket.ShipmentPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShipmentService {
    @Autowired private ShipmentRepository repo;
    @Autowired private ShipmentPublisher publisher;

    public List<Shipment> list() { return repo.findAll(); }

    public Shipment create(Shipment s) {
        if (s.getTrackingNumber() == null || s.getTrackingNumber().isBlank()) {
            s.setTrackingNumber("TRK" + System.currentTimeMillis());
        }
        if (s.getStage() == null || s.getStage().isBlank()) {
            s.setStage("PICKED");
        }
        if (s.getProgress() == null) {
            s.setProgress(progressForStage(s.getStage()));
        }
        if (s.getEta() == null || s.getEta().isBlank()) {
            s.setEta(etaForStage(s.getStage()));
        }
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        Shipment saved = repo.save(s);
        publisher.publishShipmentUpdate(saved);
        return saved;
    }

    public Shipment updateStage(String id, String stage) {
        Shipment s = repo.findById(id).orElseThrow(() -> new RuntimeException("Shipment not found: " + id));
        s.setStage(stage);
        s.setProgress(progressForStage(stage));
        s.setEta(etaForStage(stage));
        s.setUpdatedAt(LocalDateTime.now());
        Shipment saved = repo.save(s);
        publisher.publishShipmentUpdate(saved);
        return saved;
    }

    public Shipment track(String trackingNumber) {
        return repo.findByTrackingNumber(trackingNumber).orElse(null);
    }

    private int progressForStage(String stage) {
        if (stage == null) return 20;
        return switch (stage) {
            case "PICKED" -> 20;
            case "IN_TRANSIT" -> 50;
            case "OUT_FOR_DELIVERY" -> 85;
            case "DELIVERED" -> 100;
            default -> 20;
        };
    }

    private String etaForStage(String stage) {
        if (stage == null) return "TBD";
        return switch (stage) {
            case "PICKED" -> "3-5 days";
            case "IN_TRANSIT" -> "1-2 days";
            case "OUT_FOR_DELIVERY" -> "Today";
            case "DELIVERED" -> "Delivered";
            default -> "TBD";
        };
    }
}

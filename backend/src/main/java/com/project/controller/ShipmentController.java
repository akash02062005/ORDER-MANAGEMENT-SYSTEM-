package com.project.controller;

import com.project.model.Shipment;
import com.project.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "*")
public class ShipmentController {
    @Autowired private ShipmentService service;

    @GetMapping
    public List<Shipment> list() { return service.list(); }

    @PostMapping
    public Shipment create(@RequestBody Shipment s) { return service.create(s); }

    @PostMapping("/{id}/stage")
    public Shipment updateStage(@PathVariable String id, @RequestBody Map<String, String> body) {
        return service.updateStage(id, body.get("stage"));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<Shipment> track(@PathVariable String trackingNumber) {
        Shipment s = service.track(trackingNumber);
        return s != null ? ResponseEntity.ok(s) : ResponseEntity.notFound().build();
    }
}

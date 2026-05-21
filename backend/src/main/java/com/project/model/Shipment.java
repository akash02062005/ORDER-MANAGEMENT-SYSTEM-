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
@Document(collection = "shipments")
public class Shipment {
    @Id
    private String id;
    private String trackingNumber;
    private String orderId;
    private String carrier;       // FedEx, DHL, BlueDart, Delhivery
    private String originCity;
    private String destinationCity;
    private String stage;         // PICKED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    private Integer progress;     // 0-100
    private String eta;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

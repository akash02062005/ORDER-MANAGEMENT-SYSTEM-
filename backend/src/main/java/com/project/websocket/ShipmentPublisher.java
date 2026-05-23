package com.project.websocket;

import com.project.model.Shipment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Broadcasts shipment lifecycle events to STOMP subscribers on /topic/shipments.
 * Frontend subscribes to receive create + stage-change events without polling.
 */
@Component
public class ShipmentPublisher {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void publishShipmentUpdate(Shipment shipment) {
        messagingTemplate.convertAndSend("/topic/shipments", shipment);
    }
}

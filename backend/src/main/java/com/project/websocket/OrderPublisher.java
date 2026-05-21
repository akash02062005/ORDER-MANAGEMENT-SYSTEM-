package com.project.websocket;

import com.project.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderPublisher {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void publishOrderUpdate(Order order) {
        messagingTemplate.convertAndSend("/topic/orders", order);
    }
}

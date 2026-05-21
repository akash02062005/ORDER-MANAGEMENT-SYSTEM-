package com.project.controller;

import com.project.model.Notification;
import com.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    @Autowired private NotificationService service;

    @GetMapping("/user/{userId}")
    public List<Notification> listForUser(@PathVariable String userId) {
        return service.forUser(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> unread(@PathVariable String userId) {
        return Map.of("count", service.unreadCount(userId));
    }

    @PostMapping
    public Notification push(@RequestBody Notification n) {
        return service.push(n.getUserId(), n.getTitle(), n.getMessage(), n.getType(), n.getLink());
    }

    @PostMapping("/{id}/read")
    public void read(@PathVariable String id) { service.markRead(id); }

    @PostMapping("/user/{userId}/read-all")
    public void readAll(@PathVariable String userId) { service.markAllRead(userId); }
}

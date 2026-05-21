package com.project.service;

import com.project.model.Notification;
import com.project.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired private NotificationRepository repo;

    public List<Notification> forUser(String userId) { return repo.findByUserIdOrderByCreatedAtDesc(userId); }

    public long unreadCount(String userId) { return repo.countByUserIdAndReadFalse(userId); }

    public Notification push(String userId, String title, String message, String type, String link) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setLink(link);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        return repo.save(n);
    }

    public void markRead(String id) {
        repo.findById(id).ifPresent(n -> { n.setRead(true); repo.save(n); });
    }

    public void markAllRead(String userId) {
        repo.findByUserIdAndReadFalse(userId).forEach(n -> { n.setRead(true); repo.save(n); });
    }
}

package com.project.service;

import com.project.model.AuditLog;
import com.project.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {
    @Autowired private AuditLogRepository repo;

    public void log(String actorId, String actorName, String action, String entityType, String entityId, String description) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorName(actorName);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        repo.save(log);
    }

    public List<AuditLog> recent() { return repo.findTop100ByOrderByTimestampDesc(); }

    public List<AuditLog> byEntity(String type) { return repo.findByEntityType(type); }
}

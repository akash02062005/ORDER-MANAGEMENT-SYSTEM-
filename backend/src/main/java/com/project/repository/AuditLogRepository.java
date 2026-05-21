package com.project.repository;

import com.project.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findByEntityType(String entityType);
    List<AuditLog> findByActorId(String actorId);
}

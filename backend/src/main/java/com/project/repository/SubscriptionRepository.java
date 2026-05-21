package com.project.repository;

import com.project.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    List<Subscription> findByUserId(String userId);
    Optional<Subscription> findByGatewaySubscriptionId(String gatewaySubscriptionId);
    Optional<Subscription> findByGatewayOrderId(String gatewayOrderId);
    Optional<Subscription> findFirstByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
}

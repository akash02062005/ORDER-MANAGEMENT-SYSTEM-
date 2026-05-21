package com.project.repository;

import com.project.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findBySlug(String slug);
    Optional<Organization> findByOwnerId(String ownerId);
    List<Organization> findByMemberIdsContaining(String userId);
}

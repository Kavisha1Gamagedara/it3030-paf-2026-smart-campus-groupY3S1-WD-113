package com.smartcampus.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.model.ResourceUsage;
import java.util.List;

/**
 * Repository for managing ResourceUsage data in MongoDB.
 */
public interface ResourceUsageRepository extends MongoRepository<ResourceUsage, String> {
    List<ResourceUsage> findByResourceId(String resourceId);
    ResourceUsage findByResourceIdAndTimeSlot(String resourceId, String timeSlot);
}

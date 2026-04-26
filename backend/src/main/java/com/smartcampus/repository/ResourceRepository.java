package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}

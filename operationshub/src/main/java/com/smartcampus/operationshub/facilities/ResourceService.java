package com.smartcampus.operationshub.facilities;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> searchResources(String type, String location, Integer minCapacity) {
        if (type != null && location != null && minCapacity != null) {
            return resourceRepository.findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(type,
                    location, minCapacity);
        } else if (type != null) {
            return resourceRepository.findByType(type);
        } else if (location != null) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        } else if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        return resourceRepository.findAll();
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setName(resourceDetails.getName());
            resource.setType(resourceDetails.getType());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setLocation(resourceDetails.getLocation());
            resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
            resource.setStatus(resourceDetails.getStatus());
            return resourceRepository.save(resource);
        }).orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    // Member 2's BookingService should call this instead of the repository
    public boolean isResourceAvailable(String id) {
        return resourceRepository.findById(id)
                .map(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .orElse(false);
    }
}

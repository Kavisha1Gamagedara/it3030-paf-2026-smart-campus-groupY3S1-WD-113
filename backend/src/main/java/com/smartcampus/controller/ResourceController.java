package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // 1. GET all resources (Public or USER/ADMIN)
    @GetMapping
    public List<Resource> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        
        if (type != null) return resourceService.filterByType(type);
        if (location != null) return resourceService.filterByLocation(location);
        if (minCapacity != null) return resourceService.filterByCapacity(minCapacity);
        
        return resourceService.getAllResources();
    }

    // 2. GET resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. POST create resource (ADMIN only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    // 4. PUT update resource (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        try {
            Resource updatedResource = resourceService.updateResource(id, resourceDetails);
            return ResponseEntity.ok(updatedResource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. DELETE resource (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}

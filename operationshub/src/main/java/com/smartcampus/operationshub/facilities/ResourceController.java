package com.smartcampus.operationshub.facilities;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust for production
public class ResourceController {
    private final ResourceService resourceService;

    @GetMapping
    public List<Resource> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        if (type != null || location != null || minCapacity != null) {
            return resourceService.searchResources(type, location, minCapacity);
        }
        return resourceService.getAllResources();
    }

    @PostMapping
    public Resource addResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable String id, @RequestBody Resource resource) {
        return resourceService.updateResource(id, resource);
    }

    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
    }
}

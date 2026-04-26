package com.smartcampus.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private String availabilityWindows; // e.g., "08:00-17:00"
    private ResourceStatus status;
    private String description;

    public Resource() {}

    public Resource(String name, ResourceType type, int capacity, String location, String availabilityWindows, ResourceStatus status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindows = availabilityWindows;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvailabilityWindows() { return availabilityWindows; }
    public void setAvailabilityWindows(String availabilityWindows) { this.availabilityWindows = availabilityWindows; }

    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

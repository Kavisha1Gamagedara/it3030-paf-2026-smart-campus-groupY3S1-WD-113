package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Model representing the usage statistics of a campus resource.
 */
@Document(collection = "resource_usage")
public class ResourceUsage {

    @Id
    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceType; // e.g., "LAB", "LECTURE_HALL"
    private String timeSlot; // e.g., "08:00-10:00"
    private int usageCount;

    public ResourceUsage() {}

    public ResourceUsage(String resourceId, String resourceName, String resourceType, String timeSlot, int usageCount) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.timeSlot = timeSlot;
        this.usageCount = usageCount;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }
}

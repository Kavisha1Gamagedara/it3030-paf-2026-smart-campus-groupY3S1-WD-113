package com.smartcampus.operationshub.facilities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;
    private String name;
    private String type; // Lecture Hall, Lab, Meeting Room, Equipment
    private Integer capacity;
    private String location;
    private String availabilityWindows; // e.g., "08:00-17:00"
    private String status; // ACTIVE / OUT_OF_SERVICE
}

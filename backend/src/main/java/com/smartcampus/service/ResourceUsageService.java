package com.smartcampus.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartcampus.model.ResourceUsage;
import com.smartcampus.repository.ResourceUsageRepository;
import jakarta.annotation.PostConstruct;

@Service
public class ResourceUsageService {

    @Autowired
    private ResourceUsageRepository repository;

    public List<ResourceUsage> getHeatmapData() {
        return repository.findAll();
    }

    @PostConstruct
    public void initDummyData() {
        if (repository.count() == 0) {
            List<ResourceUsage> dummyData = new ArrayList<>();
            String[] timeSlots = {"08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00"};
            
            // Lab 1
            dummyData.add(new ResourceUsage("res1", "Lab 1", "LAB", timeSlots[0], 20));
            dummyData.add(new ResourceUsage("res1", "Lab 1", "LAB", timeSlots[1], 35));
            dummyData.add(new ResourceUsage("res1", "Lab 1", "LAB", timeSlots[2], 15));
            dummyData.add(new ResourceUsage("res1", "Lab 1", "LAB", timeSlots[3], 45));

            // Lecture Hall A
            dummyData.add(new ResourceUsage("res2", "Lecture Hall A", "LECTURE_HALL", timeSlots[0], 50));
            dummyData.add(new ResourceUsage("res2", "Lecture Hall A", "LECTURE_HALL", timeSlots[1], 10));
            dummyData.add(new ResourceUsage("res2", "Lecture Hall A", "LECTURE_HALL", timeSlots[2], 5));
            dummyData.add(new ResourceUsage("res2", "Lecture Hall A", "LECTURE_HALL", timeSlots[3], 30));

            // Meeting Room B
            dummyData.add(new ResourceUsage("res3", "Meeting Room B", "MEETING_ROOM", timeSlots[0], 5));
            dummyData.add(new ResourceUsage("res3", "Meeting Room B", "MEETING_ROOM", timeSlots[1], 55));
            dummyData.add(new ResourceUsage("res3", "Meeting Room B", "MEETING_ROOM", timeSlots[2], 40));
            dummyData.add(new ResourceUsage("res3", "Meeting Room B", "MEETING_ROOM", timeSlots[3], 12));
            
            // Computer Lab 2
            dummyData.add(new ResourceUsage("res4", "Computer Lab 2", "LAB", timeSlots[0], 25));
            dummyData.add(new ResourceUsage("res4", "Computer Lab 2", "LAB", timeSlots[1], 45));
            dummyData.add(new ResourceUsage("res4", "Computer Lab 2", "LAB", timeSlots[2], 60));
            dummyData.add(new ResourceUsage("res4", "Computer Lab 2", "LAB", timeSlots[3], 20));

            repository.saveAll(dummyData);
        }
    }
}

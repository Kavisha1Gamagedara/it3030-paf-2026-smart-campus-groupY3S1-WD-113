package com.smartcampus.incident.repository;

import com.smartcampus.incident.model.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    List<IncidentTicket> findByReportedByUserId(String userId);

    List<IncidentTicket> findByAssignedTechnicianId(String technicianId);
}
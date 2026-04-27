package com.smartcampus.incident.controller;

import com.smartcampus.incident.dto.AssignTechnicianRequest;
import com.smartcampus.incident.dto.CreateIncidentTicketRequest;
import com.smartcampus.incident.dto.UpdateTicketStatusRequest;
import com.smartcampus.incident.model.IncidentTicket;
import com.smartcampus.incident.service.IncidentTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentTicketController {

    private final IncidentTicketService ticketService;

    public IncidentTicketController(IncidentTicketService ticketService) {
        this.ticketService = ticketService;
    }

    // USER: Create ticket
    @PostMapping
    public ResponseEntity<IncidentTicket> createTicket(
            @RequestBody CreateIncidentTicketRequest request,
            Authentication authentication
    ) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocationText(request.getLocationText());
        ticket.setReportedByUserId(authentication.getName());

        return new ResponseEntity<>(
                ticketService.createTicket(ticket),
                HttpStatus.CREATED
        );
    }

    // USER: Get own tickets
    @GetMapping("/my")
    public ResponseEntity<List<IncidentTicket>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(
                ticketService.getTicketsByUser(authentication.getName())
        );
    }

    // ALL: Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ADMIN: Assign technician
    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentTicket> assignTechnician(
            @PathVariable String id,
            @RequestBody AssignTechnicianRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.assignTechnician(id, request.getTechnicianId())
        );
    }

    // ADMIN / TECH: Update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateTicketStatusRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.updateStatus(
                        id,
                        request.getStatus(),
                        request.getResolutionNotes()
                )
        );
    }
}
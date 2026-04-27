package com.smartcampus.incident.service;

import com.smartcampus.incident.exception.TicketNotFoundException;
import com.smartcampus.incident.model.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import com.smartcampus.incident.model.TicketStatus;
import org.springframework.stereotype.Service;

import com.smartcampus.incident.model.TicketComment;

import java.util.List;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;

    public IncidentTicketService(IncidentTicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // Create a new incident ticket
    public IncidentTicket createTicket(IncidentTicket ticket) {
        return ticketRepository.save(ticket);
    }

    // Get a ticket by ID
    public IncidentTicket getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new TicketNotFoundException("Incident ticket not found with id: " + ticketId));
    }

    // Get tickets created by a specific user
    public List<IncidentTicket> getTicketsByUser(String userId) {
        return ticketRepository.findByReportedByUserId(userId);
    }

    // Get tickets assigned to a technician
    public List<IncidentTicket> getTicketsByTechnician(String technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId);
    }

    // Assign a technician to a ticket
    public IncidentTicket assignTechnician(String ticketId, String technicianId) {
        IncidentTicket ticket = getTicketById(ticketId);
        ticket.setAssignedTechnicianId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return ticketRepository.save(ticket);
    }

    // Update ticket status (used by ADMIN / TECHNICIAN later)
    public IncidentTicket updateStatus(String ticketId, TicketStatus status, String resolutionNotes) {
        IncidentTicket ticket = getTicketById(ticketId);
        ticket.setStatus(status);

        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        return ticketRepository.save(ticket);
    }

    // Add comment
    public IncidentTicket addComment(String ticketId, String userId, String content) {
        IncidentTicket ticket = getTicketById(ticketId);
        ticket.getComments().add(new TicketComment(userId, content));
        return ticketRepository.save(ticket);
    }

    // Delete own comment
    public IncidentTicket deleteComment(String ticketId, String commentId, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);

        boolean removed = ticket.getComments().removeIf(
                comment -> comment.getId().equals(commentId)
                        && comment.getUserId().equals(userId)
        );

        if (!removed) {
            throw new RuntimeException("Comment not found or not owned by user");
        }

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String ticketId) {
    if (!ticketRepository.existsById(ticketId)) {
        throw new TicketNotFoundException("Incident ticket not found");
    }
        ticketRepository.deleteById(ticketId);
    }
}


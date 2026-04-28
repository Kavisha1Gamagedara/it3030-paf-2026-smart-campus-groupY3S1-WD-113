package com.smartcampus.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.IncidentTicketRepository;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository repository;

    public IncidentTicketService(IncidentTicketRepository repository) {
        this.repository = repository;
    }

    public IncidentTicket createTicket(IncidentTicket ticket) {
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.OPEN);
        }
        if (ticket.getAttachmentFileIds() == null) {
            ticket.setAttachmentFileIds(new ArrayList<>());
        }
        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }
        Instant now = Instant.now();
        if (ticket.getCreatedAt() == null) {
            ticket.setCreatedAt(now);
        }
        ticket.setUpdatedAt(now);
        return repository.save(ticket);
    }

    public List<IncidentTicket> getTicketsByUser(String userId) {
        return repository.findByReportedByUserId(userId);
    }

    public List<IncidentTicket> getAllTickets() {
        return repository.findAll();
    }

    public List<IncidentTicket> getTicketsByTechnician(String technicianId) {
        return repository.findByAssignedTechnicianId(technicianId);
    }

    public IncidentTicket getTicketById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public IncidentTicket assignTechnician(String id, String technicianId) {
        IncidentTicket ticket = getTicketById(id);
        ticket.setAssignedTechnicianId(technicianId);
        return createTicket(ticket);
    }

    public IncidentTicket updateStatus(String id, TicketStatus status, String resolutionNotes) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        IncidentTicket ticket = getTicketById(id);
        ticket.setStatus(status);
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        return createTicket(ticket);
    }

    public IncidentTicket addComment(String id, String userId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment content is required");
        }
        IncidentTicket ticket = getTicketById(id);
        List<IncidentTicket.Comment> comments = ticket.getComments();
        if (comments == null) {
            comments = new ArrayList<>();
            ticket.setComments(comments);
        }
        IncidentTicket.Comment comment = new IncidentTicket.Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setCreatedAt(Instant.now());
        comments.add(comment);
        return createTicket(ticket);
    }

    public IncidentTicket deleteComment(String ticketId, String commentId, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);
        List<IncidentTicket.Comment> comments = ticket.getComments();
        if (comments == null || comments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        boolean removed = false;
        for (Iterator<IncidentTicket.Comment> iterator = comments.iterator(); iterator.hasNext();) {
            IncidentTicket.Comment comment = iterator.next();
            if (commentId.equals(comment.getId())) {
                if (comment.getUserId() != null && !comment.getUserId().equals(userId)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete others' comments");
                }
                iterator.remove();
                removed = true;
                break;
            }
        }
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        return createTicket(ticket);
    }

    public void deleteTicket(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }
        repository.deleteById(id);
    }
}

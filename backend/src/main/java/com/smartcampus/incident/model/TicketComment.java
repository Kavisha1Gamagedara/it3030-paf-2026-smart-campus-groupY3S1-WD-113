package com.smartcampus.incident.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class TicketComment {

    private String id;
    private String userId;
    private String content;
    private LocalDateTime createdAt;

    public TicketComment(String userId, String content) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
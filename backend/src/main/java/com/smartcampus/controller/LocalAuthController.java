package com.smartcampus.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
public class LocalAuthController {

    @Value("${LOCAL_ADMIN_USERNAME:admin}")
    private String localAdminUsername;

    @Value("${LOCAL_ADMIN_PASSWORD:admin123}")
    private String localAdminPassword;

    @PostMapping("/api/auth/local/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        String username = payload != null ? payload.getOrDefault("username", "") : "";
        String password = payload != null ? payload.getOrDefault("password", "") : "";

        if (!localAdminUsername.equals(username) || !localAdminPassword.equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("LOCAL_ADMIN", Boolean.TRUE);
        session.setAttribute("LOCAL_ADMIN_USER", username);

        Map<String, Object> profile = Map.of(
                "id", "local-admin",
                "name", username,
                "email", username + "@local",
                "role", "ADMIN",
                "provider", "local",
                "providerId", "local-admin",
                "createdAt", Instant.now().toString(),
                "updatedAt", Instant.now().toString()
        );

        return ResponseEntity.ok(profile);
    }
}

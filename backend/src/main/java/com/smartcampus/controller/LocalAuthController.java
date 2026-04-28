package com.smartcampus.controller;

import java.time.Instant;
import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

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

        // Programmatically create an Authentication for the local admin and store it
        // in the SecurityContext and the HTTP session so subsequent requests are
        // treated as authenticated by Spring Security.
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        Map<String, Object> base = Map.of(
            "id", "local-admin",
            "name", username,
            "email", username + "@local",
            "role", "ADMIN",
            "provider", "local",
            "providerId", "local-admin",
            "createdAt", Instant.now().toString(),
            "updatedAt", Instant.now().toString()
        );

        // Return profile and include a debug flag indicating whether the
        // SecurityContext was stored in the HTTP session.
        java.util.HashMap<String, Object> profile = new java.util.HashMap<>(base);
        boolean scPresent = session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY) != null;
        profile.put("sessionHasSecurityContext", scPresent);

        return ResponseEntity.ok(profile);
    }
}

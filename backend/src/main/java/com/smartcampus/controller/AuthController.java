package com.smartcampus.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@RestController
public class AuthController {

    private static final List<String> SUPPORTED_ROLES = List.of(
            "USER",
            "ADMIN",
            "STUDENT",
            "TECHNICIAN",
            "MANAGER"
    );

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/api/user")
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return Map.of();
        return principal.getAttributes();
    }

    @GetMapping("/api/auth/status")
    public Map<String, Object> authStatus() {
        boolean oauthEnabled = clientRegistrationRepository != null;
        return Map.of(
                "oauthEnabled", oauthEnabled,
                "provider", "google",
                "authorizationUrl", "/oauth2/authorization/google",
                "roles", SUPPORTED_ROLES
        );
    }

    @GetMapping("/api/user/profile")
    public UserProfile profile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;
        String providerId = resolveProviderId(principal);
        return userProfileService.findByProviderAndProviderId("google", providerId).orElse(null);
    }

    @PutMapping("/api/user/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, Object> payload
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .updateProfile("google", providerId, payload)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    @DeleteMapping("/api/user/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String providerId = resolveProviderId(principal);
        boolean deleted = userProfileService.deleteProfile("google", providerId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found"));
    }

    @PostMapping("/api/user/role")
    public ResponseEntity<?> updateRole(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> payload
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String role = payload.get("role");
        if (role == null || role.isBlank() || !SUPPORTED_ROLES.contains(role)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .updateRole("google", providerId, role)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    private String resolveProviderId(OAuth2User principal) {
        String providerId = principal.getAttribute("sub");
        if (providerId == null) {
            providerId = principal.getAttribute("id");
        }
        return providerId;
    }
}

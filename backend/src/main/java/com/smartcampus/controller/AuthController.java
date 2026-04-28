package com.smartcampus.controller;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

import jakarta.servlet.http.HttpSession;

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
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal != null) return principal.getAttributes();
        if (isLocalAdmin(session)) {
            String username = localAdminUsername(session);
            return Map.of(
                    "name", username,
                    "email", username + "@local",
                    "sub", "local-admin",
                    "provider", "local"
            );
        }
        return Map.of();
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
    public UserProfile profile(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal == null) {
            if (!isLocalAdmin(session)) return null;
            return localAdminProfile(session);
        }
        String providerId = resolveProviderId(principal);
        return userProfileService.findByProviderAndProviderId("google", providerId).orElse(null);
    }

    @PutMapping("/api/user/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, Object> payload,
            HttpSession session
    ) {
        if (principal == null) {
            if (isLocalAdmin(session)) {
                UserProfile updated = updateLocalAdminProfile(session, payload);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .updateProfile("google", providerId, payload)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    @DeleteMapping("/api/user/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal == null) {
            if (isLocalAdmin(session)) {
                session.removeAttribute("LOCAL_ADMIN");
                session.removeAttribute("LOCAL_ADMIN_USER");
                session.removeAttribute("LOCAL_ADMIN_PROFILE");
                return ResponseEntity.noContent().build();
            }
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
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String roleRaw = payload.get("role");
        String role = roleRaw != null ? roleRaw.trim().toUpperCase() : null;
        if (role == null || role.isBlank() || !SUPPORTED_ROLES.contains(role)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .updateRole("google", providerId, role)
                .<ResponseEntity<?>>map(updated -> {
                    refreshAuthenticationRole(authentication, role);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    private void refreshAuthenticationRole(Authentication authentication, String role) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            return;
        }

        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        OAuth2AuthenticationToken newToken = new OAuth2AuthenticationToken(
                oauthToken.getPrincipal(),
                authorities,
                oauthToken.getAuthorizedClientRegistrationId()
        );
        SecurityContextHolder.getContext().setAuthentication(newToken);
    }

    private String resolveProviderId(OAuth2User principal) {
        String providerId = principal.getAttribute("sub");
        if (providerId == null) {
            providerId = principal.getAttribute("id");
        }
        return providerId;
    }

    private boolean isLocalAdmin(HttpSession session) {
        return session != null && Boolean.TRUE.equals(session.getAttribute("LOCAL_ADMIN"));
    }

    private String localAdminUsername(HttpSession session) {
        Object value = session != null ? session.getAttribute("LOCAL_ADMIN_USER") : null;
        return value != null ? value.toString() : "admin";
    }

    private UserProfile localAdminProfile(HttpSession session) {
        Object existing = session != null ? session.getAttribute("LOCAL_ADMIN_PROFILE") : null;
        if (existing instanceof UserProfile profile) {
            return profile;
        }

        UserProfile profile = new UserProfile();
        String username = localAdminUsername(session);
        profile.setId("local-admin");
        profile.setProvider("local");
        profile.setProviderId("local-admin");
        profile.setName(username);
        profile.setEmail(username + "@local");
        profile.setRole("ADMIN");
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        if (session != null) {
            session.setAttribute("LOCAL_ADMIN_PROFILE", profile);
        }
        return profile;
    }

    private UserProfile updateLocalAdminProfile(HttpSession session, Map<String, Object> payload) {
        UserProfile profile = localAdminProfile(session);
        Map<String, Object> updates = payload != null ? payload : Map.of();
        if (updates.containsKey("name")) {
            profile.setName((String) updates.get("name"));
        }
        if (updates.containsKey("email")) {
            profile.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("picture")) {
            profile.setPicture((String) updates.get("picture"));
        }
        profile.setUpdatedAt(Instant.now());
        if (session != null) {
            session.setAttribute("LOCAL_ADMIN_PROFILE", profile);
        }
        return profile;
    }
}

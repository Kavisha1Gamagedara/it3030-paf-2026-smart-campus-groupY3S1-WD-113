package com.smartcampus.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@RestController
@RequestMapping("/admin/api/users")
public class AdminUserController {

    private static final List<String> SUPPORTED_ROLES = List.of(
            "USER",
            "ADMIN",
            "STUDENT",
            "TECHNICIAN",
            "MANAGER"
    );

    private final UserProfileService userProfileService;

    public AdminUserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public List<UserProfile> listUsers() {
        return userProfileService.listAllProfiles();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        Map<String, Object> updates = new HashMap<>(payload != null ? payload : Map.of());
        if (updates.containsKey("role")) {
            String role = updates.get("role") != null ? updates.get("role").toString().trim().toUpperCase() : "";
            if (role.isBlank() || !SUPPORTED_ROLES.contains(role)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
            }
            updates.put("role", role);
        }

        return userProfileService
                .updateProfileById(id, updates)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        boolean deleted = userProfileService.deleteProfileById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found"));
    }
}

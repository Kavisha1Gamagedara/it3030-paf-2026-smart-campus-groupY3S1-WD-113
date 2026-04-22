package com.smartcampus.service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartcampus.model.UserProfile;
import com.smartcampus.repository.UserProfileRepository;

@Service
public class UserProfileService {

    private final UserProfileRepository repository;

    public UserProfileService(UserProfileRepository repository) {
        this.repository = repository;
    }

    public UserProfile upsertFromOAuth(String provider, Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String providerId = attributes.get("sub") != null ? String.valueOf(attributes.get("sub")) : email;

        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty() && email != null && !email.isBlank()) {
            existing = repository.findByEmail(email);
        }

        UserProfile profile = existing.orElseGet(UserProfile::new);
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(Instant.now());
        }

        profile.setProvider(provider);
        profile.setProviderId(providerId);
        profile.setName((String) attributes.getOrDefault("name", ""));
        profile.setEmail(email);
        profile.setPicture((String) attributes.getOrDefault("picture", ""));
        if (profile.getRole() == null || profile.getRole().isBlank()) {
            profile.setRole("USER");
        }
        profile.setUpdatedAt(Instant.now());

        return repository.save(profile);
    }

    public Optional<UserProfile> updateRole(String provider, String providerId, String role) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
        profile.setRole(role);
        profile.setUpdatedAt(Instant.now());
        return Optional.of(repository.save(profile));
    }

    public Optional<UserProfile> findByProviderAndProviderId(String provider, String providerId) {
        return repository.findByProviderAndProviderId(provider, providerId);
    }

    public Optional<UserProfile> updateProfile(String provider, String providerId, Map<String, Object> updates) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
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
        return Optional.of(repository.save(profile));
    }

    public boolean deleteProfile(String provider, String providerId) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) return false;
        repository.delete(existing.get());
        return true;
    }
}

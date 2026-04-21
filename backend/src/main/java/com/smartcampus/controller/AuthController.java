package com.smartcampus.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@RestController
public class AuthController {

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
                "authorizationUrl", "/oauth2/authorization/google"
        );
    }

    @GetMapping("/api/user/profile")
    public UserProfile profile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;
        String providerId = principal.getAttribute("sub");
        if (providerId == null) {
            providerId = principal.getAttribute("id");
        }
        return userProfileService.findByProviderAndProviderId("google", providerId).orElse(null);
    }
}

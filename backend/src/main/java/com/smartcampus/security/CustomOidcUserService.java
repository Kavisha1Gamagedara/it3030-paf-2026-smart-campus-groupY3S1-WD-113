package com.smartcampus.security;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import com.smartcampus.service.UserProfileService;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserProfileService userProfileService;

    public CustomOidcUserService(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser user = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        userProfileService.upsertFromOAuth(provider, user.getClaims());
        return user;
    }
}

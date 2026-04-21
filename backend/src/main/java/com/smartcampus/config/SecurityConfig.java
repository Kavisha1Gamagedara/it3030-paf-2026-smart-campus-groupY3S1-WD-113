package com.smartcampus.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.smartcampus.security.CustomOAuth2UserService;
import com.smartcampus.security.CustomOidcUserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private CustomOidcUserService customOidcUserService;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // If OAuth2 client registrations are present, enable oauth2Login. Otherwise allow all requests (dev-safe fallback).
        if (clientRegistrationRepository != null) {
            http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/", "/index.html", "/api/public", "/api/auth/status", "/oauth2/**", "/login/**", "/api/user").permitAll()
                    .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                        .oidcUserService(customOidcUserService)
                    )
                    .defaultSuccessUrl(dashboardUrl(), true)
                );
        } else {
            http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
                );
        }

        return http.build();
    }

    private String dashboardUrl() {
        if (frontendUrl.endsWith("/")) {
            return frontendUrl + "dashboard";
        }
        return frontendUrl + "/dashboard";
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

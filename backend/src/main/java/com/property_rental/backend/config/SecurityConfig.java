package com.property_rental.backend.config;

import com.property_rental.backend.security.JwtAuthenticationEntryPoint;
import com.property_rental.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint point;

    @Autowired
    private JwtAuthenticationFilter filter;

//    CORS error configuration
//    now react can connect with spring boot
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
//         exact origin of React server
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

//        Allow common methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));

//        Allow necessary headers (especially Authorization for JWTs)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

//        Important for sending credentials (like cookies or Authorization header)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Applying configuration to all endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

//        disable csrf
        http.csrf(AbstractHttpConfigurer::disable);

        http.cors(Customizer.withDefaults());

        // The authorization block is updated to reflect role-based access control.
        http.authorizeHttpRequests(auth -> auth
                        // Public endpoint for login. No authentication required.
                        .requestMatchers("/auth/**").permitAll()

                        // Only ADMIN can access endpoints under /admin/**.
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Both OWNER and ADMIN can access endpoints under /owner/**.
                        .requestMatchers("/owner/**").hasAnyRole("OWNER", "ADMIN")

                        // Only USER and ADMIN can access /user/**
                        .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")

                        // All authenticated users (USER, OWNER, ADMIN) can access /home/**.
                        .requestMatchers("/home/**").authenticated()

                        // No authentication required to register
                        .requestMatchers("/auth/register/**").permitAll()

                        // Any other request must also be authenticated.
                        .anyRequest().authenticated())

                .exceptionHandling(ex -> ex.authenticationEntryPoint(point))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Add the custom JWT filter before the standard Spring Security filter.
        http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

package com.propertyRental.pocproject.config;

import com.propertyRental.pocproject.security.JwtAuthenticationEntryPoint;
import com.propertyRental.pocproject.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint point;

    @Autowired
    private JwtAuthenticationFilter filter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // The authorization block is updated to reflect role-based access control.
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoint for login. No authentication required.
                        .requestMatchers("/auth/login").permitAll()

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

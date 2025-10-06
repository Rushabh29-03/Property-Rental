package com.property_rental.backend.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {


        Map<String, Object> errorDetails = new HashMap<>();

        String isTokenExpired = (String) request.getAttribute("expired");

        if(isTokenExpired != null && isTokenExpired.equals("true")){
            errorDetails.put("errMessage", "Access token is expired");
        } else {
            String message = (authException != null) ? authException.getMessage() : "Access Denied !!";
            errorDetails.put("errMessage", message);
        }
    }
}

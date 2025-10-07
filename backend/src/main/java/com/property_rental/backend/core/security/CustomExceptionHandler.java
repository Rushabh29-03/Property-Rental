package com.property_rental.backend.core.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseBody
    public ResponseEntity<?> handleExpiredJwtException(ExpiredJwtException e) {

        Map<String, String> response = new HashMap<>();
        response.put("errMessage", "Access token is expired");

        // The HTTP status must be 401 Unauthorized for the client to trigger a token refresh
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
}

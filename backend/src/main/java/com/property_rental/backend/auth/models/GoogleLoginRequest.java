package com.property_rental.backend.auth.models;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class GoogleLoginRequest {
    private String idToken;
}

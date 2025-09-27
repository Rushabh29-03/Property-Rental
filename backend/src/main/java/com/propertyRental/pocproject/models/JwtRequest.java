package com.propertyRental.pocproject.models;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class JwtRequest {

    private String userName;

    private String email;

    private String password;
}

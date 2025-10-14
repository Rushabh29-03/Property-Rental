package com.property_rental.backend.rental.models;

import lombok.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RentRequest {
    private int userId;
    private int propertyId;
    private LocalDate startDate;
    private LocalDate endDate;
}

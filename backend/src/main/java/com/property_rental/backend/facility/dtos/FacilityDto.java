package com.property_rental.backend.facility.dtos;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FacilityDto {
    private int id;
    private String facName;

}

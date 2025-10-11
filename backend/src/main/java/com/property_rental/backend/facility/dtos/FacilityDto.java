package com.property_rental.backend.facility.dtos;

import com.property_rental.backend.facility.entities.Facility;
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

    public FacilityDto(Facility facility) {
        this.id = facility.getId();
        this.facName = facility.getFacName();
    }
}

package com.property_rental.backend.dtos;

import com.property_rental.backend.entities.Facility;
import com.property_rental.backend.entities.PropertyFacility;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PropertyFacilityDto {

    private String facName;
    private String description;

    public PropertyFacilityDto(PropertyFacility propertyFacility){
        Facility facility= propertyFacility.getFacility();
        this.facName= facility.getFacName();

        this.description= propertyFacility.getDescription();
    }
}

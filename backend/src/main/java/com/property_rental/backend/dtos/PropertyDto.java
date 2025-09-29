package com.property_rental.backend.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PropertyDto {
    private int id;
    private String description;
    private String address;
    private Boolean isVerified;
    private Double area;
    private String areaUnit; //DEFAULT sq_feet
    private Double monthlyRent;
    private int noOfBedrooms;
    private Double securityDepositAmount;
}

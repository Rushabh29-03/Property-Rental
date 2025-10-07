package com.property_rental.backend.propertyFacility.entities;

import com.property_rental.backend.facility.entities.Facility;
import com.property_rental.backend.property.entities.Property;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "property_facilities")
public class PropertyFacility {

    @EmbeddedId
    private PropertyFacilityId id;

//    create fields
    @Column(name = "description")
    private String description;

//    PROPERTY-FACILITY TO PROPERTY
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("propertyId")
    @JoinColumn(name = "property_id")
    private Property property;

//    PROPERTY-FACILITY TO FACILITY
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("facilityId")
    @JoinColumn(name = "fac_id")
    private Facility facility;

//    empty constructor
    public PropertyFacility() {
    }

//    constructor
    public PropertyFacility(String description) {
        this.description = description;
    }

//    toString

    @Override
    public String toString() {
        return "PropertyFacility{" +
                "description='" + description + '\'' +
                '}';
    }
}

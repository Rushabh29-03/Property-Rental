package com.property_rental.backend.propertyFacility.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Setter
@Getter
@Embeddable
public class PropertyFacilityId implements Serializable {

    @Column(name = "property_id")
    private int propertyId;

    @Column(name = "fac_id")
    private int facilityId;

    //    empty constructor
    public PropertyFacilityId() {
    }

    @Override
    public int hashCode() {
        return Objects.hash(propertyId, facilityId);
    }

    @Override
    public boolean equals(Object obj) {
        if(this==obj) return true;
        if(obj==null || getClass() != obj.getClass()) return false;

        PropertyFacilityId that = (PropertyFacilityId) obj;
        return (Objects.equals(propertyId, that.propertyId)) &&
                (Objects.equals(facilityId, that.facilityId));
    }
}

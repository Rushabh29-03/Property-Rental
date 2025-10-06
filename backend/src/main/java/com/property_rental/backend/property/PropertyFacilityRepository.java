package com.property_rental.backend.property;

import com.property_rental.backend.property.entities.PropertyFacility;
import com.property_rental.backend.property.entities.PropertyFacilityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyFacilityRepository extends JpaRepository<PropertyFacility, PropertyFacilityId> {
}

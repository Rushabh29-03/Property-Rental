package com.property_rental.backend.propertyFacility.repository;

import com.property_rental.backend.propertyFacility.entities.PropertyFacilityId;
import com.property_rental.backend.propertyFacility.entities.PropertyFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyFacilityRepository extends JpaRepository<PropertyFacility, PropertyFacilityId> {
}

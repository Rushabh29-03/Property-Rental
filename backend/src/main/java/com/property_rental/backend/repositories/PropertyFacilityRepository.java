package com.property_rental.backend.repositories;

import com.property_rental.backend.entities.PropertyFacility;
import com.property_rental.backend.entities.PropertyFacilityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyFacilityRepository extends JpaRepository<PropertyFacility, PropertyFacilityId> {
}

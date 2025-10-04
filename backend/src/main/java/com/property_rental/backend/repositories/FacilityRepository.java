package com.property_rental.backend.repositories;

import com.property_rental.backend.entities.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Integer> {

    Facility findByFacName(String facName);
}

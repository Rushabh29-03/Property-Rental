package com.property_rental.backend.repositories;

import com.property_rental.backend.dtos.FacilityDto;
import com.property_rental.backend.entities.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Integer> {

    Optional<Facility> findByFacName(String facName);

    @Query(value = "select * from facilities", nativeQuery = true)
    List<FacilityDto> allFacilities();
}

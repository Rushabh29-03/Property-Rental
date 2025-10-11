package com.property_rental.backend.facility.service;

import com.property_rental.backend.facility.repository.FacilityRepository;
import com.property_rental.backend.facility.dtos.FacilityDto;
import com.property_rental.backend.facility.entities.Facility;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    @Transactional
    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    public List<FacilityDto> getAllFacilities() {
        return facilityRepository.allFacilities();
    }

    // Additional method to get facility by name
    public Facility getFacilityByName(String facName) {
        return facilityRepository.findByFacName(facName).orElse(null);
    }

    // Check if facility exists
    public boolean facilityExists(String facName) {
        return facilityRepository.findByFacName(facName).isPresent();
    }
}

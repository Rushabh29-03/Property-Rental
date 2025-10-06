package com.property_rental.backend.facility;

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
    public Facility createFacility(Facility facility){
        return facilityRepository.save(facility);
    }

    public List<FacilityDto> getAllFacilities() {
        return facilityRepository.allFacilities();
    }
}

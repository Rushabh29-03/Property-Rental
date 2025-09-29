package com.property_rental.backend.repositories;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {
    // Spring Data JPA automatically provides methods like save(), findAll(), etc.

    @Query(value = "select * from property", nativeQuery = true)
    List<Property> allProperties();
}

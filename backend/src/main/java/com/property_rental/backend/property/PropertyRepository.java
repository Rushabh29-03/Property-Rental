package com.property_rental.backend.property;

import com.property_rental.backend.property.entities.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {
    // Spring Data JPA automatically provides methods like save(), findAll(), etc.

    @Query(value = "select * from property", nativeQuery = true)
    List<Property> allProperties();
}

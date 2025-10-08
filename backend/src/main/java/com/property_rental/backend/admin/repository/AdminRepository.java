package com.property_rental.backend.admin.repository;



import com.property_rental.backend.admin.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // The method name must match the field name 'userName' in your Admin entity.
    Optional<Admin> findByUserName(String userName);
}

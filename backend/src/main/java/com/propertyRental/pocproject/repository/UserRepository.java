package com.propertyRental.pocproject.repository;

import com.propertyRental.pocproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Spring Data JPA automatically creates a query for this method.
    // The method name must match the field name 'userName' in your User entity.
    Optional<User> findByUserName(String userName);
}

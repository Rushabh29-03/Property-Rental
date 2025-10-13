package com.property_rental.backend.rental.service;

import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.property.service.PropertyService;
import com.property_rental.backend.rental.dtos.RentedDto;
import com.property_rental.backend.rental.entities.RentedProperty;
import com.property_rental.backend.rental.repository.RentedRepository;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.service.UserService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class RentedService {

    private final UserService userService;
    private final PropertyService propertyService;
    private final RentedRepository rentedRepository;

    public RentedService(UserService userService, PropertyService propertyService, RentedRepository rentedRepository) {
        this.userService = userService;
        this.propertyService = propertyService;
        this.rentedRepository = rentedRepository;
    }

    @Transactional
    public RentedDto rentProperty(int propertyId, String username, RentedProperty rentedProperty) throws UsernameNotFoundException, NoSuchElementException {

        User user = userService.findByUsername(username); // throws UsernameNotFoundException
        Property property = propertyService.findPropertyById(propertyId); // throws NoSuchElementException

//        rentedProperty.setUser(user);

        try {
            user.addRent(rentedProperty);
            property.markAsRented(rentedProperty);

            rentedProperty.setDuration((rentedProperty.getEndDate().getYear() - rentedProperty.getStartDate().getYear()) * 12 +
                    (rentedProperty.getEndDate().getMonthValue() - rentedProperty.getStartDate().getMonthValue()) -
                    ((rentedProperty.getEndDate().getDayOfMonth()<rentedProperty.getStartDate().getDayOfMonth()) ? 1 : 0));

            return new RentedDto(rentedRepository.save(rentedProperty));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<RentedDto> getRentedPropertiesByUserId(int userId) {
        return rentedRepository.findByUserId(userId);
    }
}

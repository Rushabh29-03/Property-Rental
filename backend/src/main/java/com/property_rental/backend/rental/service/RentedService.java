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
    public RentedDto rentProperty(RentedDto rentedDto) throws NoSuchElementException {
        User user = userService.findUserByUserId(rentedDto.getUserId());
        Property property = propertyService.findPropertyById(rentedDto.getPropertyId());

        RentedProperty rentedProperty = new RentedProperty(rentedDto);

//        adding rented-property to user and property
        user.addRent(rentedProperty);
        property.markAsRented(rentedProperty);

//        calculating duration
        rentedProperty.setDuration((rentedProperty.getEndDate().getYear() - rentedProperty.getStartDate().getYear()) * 12 +
                (rentedProperty.getEndDate().getMonthValue() - rentedProperty.getStartDate().getMonthValue()) -
                ((rentedProperty.getEndDate().getDayOfMonth()<rentedProperty.getStartDate().getDayOfMonth()) ? 1 : 0));

        return new RentedDto(rentedRepository.save(rentedProperty));
    }

    @Transactional
    public RentedDto acceptRentRequest(RentedDto rentedDto) {

        int userId = rentedDto.getUserId();
        int propertyId = rentedDto.getPropertyId();

        RentedProperty rentedProperty = rentedRepository.findByUserIdAndPropertyId(userId, propertyId).orElseThrow(
                ()-> new NoSuchElementException("No rented property with userId: "+userId+" and propertyId: "+propertyId)
        );

        System.out.println("****************************");
        System.out.println(rentedProperty);
        System.out.println("****************************");

        rentedProperty.setFinalMonthlyRent(rentedDto.getFinalMonthlyRent());
        rentedProperty.setFinalSecurityDeposit(rentedDto.getFinalSecurityDeposit());

        rentedProperty.setStatus(true);
//        rentedProperty.setDuration((rentedProperty.getEndDate().getYear() - rentedProperty.getStartDate().getYear()) * 12 +
//                (rentedProperty.getEndDate().getMonthValue() - rentedProperty.getStartDate().getMonthValue()) -
//                ((rentedProperty.getEndDate().getDayOfMonth()<rentedProperty.getStartDate().getDayOfMonth()) ? 1 : 0));

        return new RentedDto(rentedRepository.save(rentedProperty));
    }

    public List<RentedDto> getRentedPropertiesByUserId(int userId) {
        return rentedRepository.findByUserId(userId);
    }
}

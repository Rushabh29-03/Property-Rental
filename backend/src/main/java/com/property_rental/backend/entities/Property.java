package com.property_rental.backend.entities;

import com.property_rental.backend.dtos.PropertyFacilityDto;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "property")
@DynamicInsert
public class Property {

    //    create fields
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private int id;

//    @Setter
//    @Getter
//    @Column(name = "user_id")
//    private int ownerId; //FOREIGN KEY

    @Setter
    @Getter
    @Column(name = "description")
    private String description;

    @Setter
    @Getter
    @Column(name = "address", nullable = false)
    private String address;

    @Setter
    @Getter
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified=false; //DEFAULT false

    @Setter
    @Getter
    @Column(name = "area", nullable = false)
    private Double area;

    @Setter
    @Getter
    @Column(name = "area_unit", nullable = false, columnDefinition = "varchar(10) DEFAULT 'sq_feet'")
    private String areaUnit; //DEFAULT sq_feet

    @Setter
    @Getter
    @Column(name = "monthly_rent", nullable = false)
    private Double monthlyRent;

    @Setter
    @Getter
    @Column(name = "no_of_bedrooms")
    private int noOfBedrooms;

    @Setter
    @Getter
    @Column(name = "security_deposit_amount")
    private Double securityDepositAmount;

    @Setter
    @Getter
    @Column(name = "min_stay")
    private int minStay=0;

    @Setter
    @Getter
    @Column(name = "pets_policy")
    private String petsPolicy;

    @Column(name = "smoking_allowed")
    private boolean isSmokingAllowed=false;

    @Setter
    @Getter
    @Column(name = "other_rules")
    private String otherRules;

//        PROPERTY TO OWNER
    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

//        PROPERTY TO RENTED_PROPERTY
    @Setter
    @Getter
    @OneToMany(mappedBy = "property")
    private List<RentedProperty> rentedProperties;

//        PROPERTY TO WISHLIST
    @Setter
    @Getter
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<WishListedProperty> wishListedProperties;

//        PROPERTY TO FACILITIES
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<PropertyFacility> propertyFacilities;

//        PROPERTY TO PHOTOS
    @Setter
    @Getter
    @OneToMany(mappedBy = "property")
    private List<Photo> photoList;

//        empty constructor
    public Property (){}

//    constructor
    public Property(String description, String address, double area, double monthlyRent, int noOfBedrooms, double securityDepositAmount) {
        this.description = description;
        this.address = address;
        this.area = area;
        this.monthlyRent = monthlyRent;
        this.noOfBedrooms=noOfBedrooms;
        this.securityDepositAmount=securityDepositAmount;
    }

    //    getters and setters
//    most of the getters and setters are handled by lombok.Getter and lombok.Setter
//    take a note of it if getter/setter doesn't work
    public void setIsSmokingAllowed(boolean isSmokingAllowed){
        this.isSmokingAllowed=isSmokingAllowed;
    }

    public boolean getIsSmokingAllowed(){
        return this.isSmokingAllowed;
    }

    public List<PropertyFacilityDto> getPropertyFacilities(){
        List<PropertyFacilityDto> propertyFacilityDtoList = new ArrayList<>();
        for (int i = 0; i < propertyFacilities.size(); i++) {
            PropertyFacilityDto propertyFacilityDto = new PropertyFacilityDto(propertyFacilities.get(i));

            propertyFacilityDtoList.add(propertyFacilityDto);
        }
        return propertyFacilityDtoList;
    }

    @Override
    public String toString() {
        return "Property{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", address='" + address + '\'' +
                ", isVerified=" + isVerified +
                ", area=" + area +
                ", areaUnit='" + areaUnit + '\'' +
                ", monthlyRent='" + monthlyRent + '\'' +
                ", noOfBedrooms='" + noOfBedrooms + '\'' +
                ", securityDepositAmount='" + securityDepositAmount + '\'' +
                ", minStay='" + minStay + '\'' +
                ", petsPolicy='" + petsPolicy + '\'' +
                ", isSmokingAllowed='" + isSmokingAllowed + '\'' +
                ", otherRules='" + otherRules + '\'' +
                '}';
    }

//    convenience method to add photos
    public void addPhoto(Photo photo){
        if(photoList==null)
            photoList = new ArrayList<>();

        photoList.add(photo);
        photo.setProperty(this);
    }

    public void markAsWishList(WishListedProperty wishListedProperty){
        if(wishListedProperties==null)
            wishListedProperties = new ArrayList<>();

        wishListedProperties.add(wishListedProperty);
        wishListedProperty.setProperty(this);
    }
}

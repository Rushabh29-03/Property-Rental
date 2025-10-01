package com.property_rental.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.util.ArrayList;
import java.util.List;

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

//        PROPERTY TO RULES
    @Setter
    @Getter
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "property_rules",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "rule_id"))
    private List<Rules> rules;

//        PROPERTY TO FACILITIES
    @Setter
    @Getter
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinTable(name = "property_facilities",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "fac_id"))
    private List<Facility> facilities;

//        PROPERTY TO PHOTOS
    @Setter
    @Getter
    @OneToMany(mappedBy = "property")
    private List<Photo> photos;

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
                '}';
    }

//    convenience method to add photos
    public void add(Photo photo){
        if(photos==null)
            photos = new ArrayList<>();

        photos.add(photo);
        photo.setProperty(this);
    }
}

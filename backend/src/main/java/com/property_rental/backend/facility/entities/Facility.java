package com.property_rental.backend.facility.entities;

import com.property_rental.backend.propertyFacility.entities.PropertyFacility;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
@Entity
@Table(name = "facilities")
public class Facility {

//    create fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fac_id")
    private int id;

    @Setter
    @Getter
    @Column(name = "fac_name", unique = true)
    private String facName;

//    FACILITY TO PROPERTY_FACILITIES
    @Setter
    @Getter
    @OneToMany(mappedBy = "facility", cascade = CascadeType.ALL)
    private Set<PropertyFacility> propertyFacilities;

    //    empty constructor
    public Facility(){}

    //    constructor
    public Facility(String facName) {
        this.facName = facName;
    }

    //    toString()
    @Override
    public String toString() {
        return "Facility{" +
                "id=" + id +
                ", facName='" + facName + '\'' +
                '}';
    }
}

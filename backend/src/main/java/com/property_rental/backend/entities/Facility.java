package com.property_rental.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

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
    @Column(name = "fac_name")
    private String facName;

    @Setter
    @Getter
    @Column(name = "is_premium")
    private boolean isPremium;

    @Setter
    @Getter
    @Column(name = "description")
    private String description;

    //    FACILITY TO PROPERTY
    @Setter
    @Getter
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinTable(name = "property_facilities",
            joinColumns = @JoinColumn(name = "fac_id"),
            inverseJoinColumns = @JoinColumn(name = "property_id"))
    private List<Property> properties;

    //    empty constructor
    public Facility(){}

    //    constructor
    public Facility(String facName, boolean isPremium, String description) {
        this.facName = facName;
        this.isPremium = isPremium;
        this.description = description;
    }

    //    toString()
    @Override
    public String toString() {
        return "Facility{" +
                "id=" + id +
                ", facName='" + facName + '\'' +
                ", isPremium=" + isPremium +
                ", description='" + description + '\'' +
                '}';
    }
}

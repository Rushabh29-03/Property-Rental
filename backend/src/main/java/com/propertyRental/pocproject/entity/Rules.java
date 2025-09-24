package com.propertyRental.pocproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "rules")
public class Rules {

//    create fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private int id;

    @Setter
    @Getter
    @Column(name = "min_stay")
    private int minStay; //IN MONTHS

    @Setter
    @Getter
    @Column(name = "pets_policy")
    private String petsPolicy;

    @Setter
    @Getter
    @Column(name = "is_smoking_allowed")
    private boolean isSmokingAllowed;

//    RULES TO PROPERTY-RULES
    @Setter
    @Getter
    @ManyToMany(fetch = FetchType.LAZY,
                cascade = {CascadeType.DETACH, CascadeType.MERGE,
                        CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinTable(name = "property_rules",
                joinColumns = @JoinColumn(name = "rule_id"),
                inverseJoinColumns = @JoinColumn(name = "property_id"))
    private List<Property> properties;


//    empty constructor
    public Rules(){}

//    constructor
    public Rules(int minStay, String petsPolicy, boolean isSmokingAllowed) {
        this.minStay = minStay;
        this.petsPolicy = petsPolicy;
        this.isSmokingAllowed = isSmokingAllowed;
    }

//    toString()
    @Override
    public String toString() {
        return "Rules{" +
                "id=" + id +
                ", minStay=" + minStay +
                ", petsPolicy='" + petsPolicy + '\'' +
                ", isSmokingAllowed=" + isSmokingAllowed +
                '}';
    }
}
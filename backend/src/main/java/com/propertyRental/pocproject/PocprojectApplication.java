package com.propertyRental.pocproject;

import com.propertyRental.pocproject.dao.AppDAO;
import com.propertyRental.pocproject.entity.Property;
import com.propertyRental.pocproject.entity.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PocprojectApplication {

	public static void main(String[] args) {
		SpringApplication.run(PocprojectApplication.class, args);
	}
}

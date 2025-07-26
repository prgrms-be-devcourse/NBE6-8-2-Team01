package com.bookbook.domain.rent.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentRepository  extends JpaRepository<Rent, Integer> {

}

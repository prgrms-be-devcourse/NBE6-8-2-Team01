package com.bookbook.domain.rent.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentRepository extends JpaRepository<Rent, Integer> { // findById의 반환 타입이 Optional<Rent> 이므로, .orElseThrow()로 예외처리

}
package com.bookbook.domain.lendList.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LendListRepository extends JpaRepository<Rent, Long> {
    
    Page<Rent> findByLenderUserId(Long lenderUserId, Pageable pageable);
    
    List<Rent> findByLenderUserId(Long lenderUserId);
    
    Page<Rent> findByLenderUserIdAndRentStatus(Long lenderUserId, String rentStatus, Pageable pageable);
}
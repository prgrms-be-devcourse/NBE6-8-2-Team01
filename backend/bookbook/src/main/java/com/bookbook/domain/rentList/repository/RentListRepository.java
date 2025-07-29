package com.bookbook.domain.rentList.repository;

import com.bookbook.domain.rentList.entity.RentList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentListRepository extends JpaRepository<RentList, Integer> {
    
    List<RentList> findByBorrowerUserId(Long borrowerUserId);
}
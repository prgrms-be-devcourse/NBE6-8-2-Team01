package com.bookbook.domain.rentList.repository;

import com.bookbook.domain.rentList.entity.RentList;
import com.bookbook.domain.rentList.entity.RentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentListRepository extends JpaRepository<RentList, Long> {
    
    List<RentList> findByBorrowerUserId(Long borrowerUserId);
    
    List<RentList> findByBorrowerUserIdAndStatus(Long borrowerUserId, RentRequestStatus status);
    
    List<RentList> findByRentId(Integer rentId);
    
    List<RentList> findByRentIdAndStatus(Integer rentId, RentRequestStatus status);
    
    // 중복 신청 방지를 위한 메서드
    boolean existsByBorrowerUserIdAndRentIdAndStatus(Long borrowerUserId, Integer rentId, RentRequestStatus status);
}
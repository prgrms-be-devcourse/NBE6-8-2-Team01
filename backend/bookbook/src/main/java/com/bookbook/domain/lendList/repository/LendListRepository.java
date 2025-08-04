package com.bookbook.domain.lendList.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LendListRepository extends JpaRepository<Rent, Long> {
    
    @Query("SELECT r FROM Rent r WHERE r.lenderUserId = :lenderUserId AND r.rentStatus != 'DELETED'")
    Page<Rent> findByLenderUserId(@Param("lenderUserId") Long lenderUserId, Pageable pageable);
    
    @Query("SELECT r FROM Rent r WHERE r.lenderUserId = :lenderUserId AND r.rentStatus != 'DELETED' AND " +
           "(LOWER(r.bookTitle) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.author) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.publisher) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :searchKeyword, '%')))")
    Page<Rent> findByLenderUserIdAndSearchKeyword(@Param("lenderUserId") Long lenderUserId, 
                                                  @Param("searchKeyword") String searchKeyword, 
                                                  Pageable pageable);
}
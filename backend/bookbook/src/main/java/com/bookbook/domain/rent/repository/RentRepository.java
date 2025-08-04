package com.bookbook.domain.rent.repository;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentRepository extends JpaRepository<Rent, Integer> { // findById의 반환 타입이 Optional<Rent> 이므로, .orElseThrow()로 예외처리

    // 대여자가 작성한 글 갯수 조회
    int countByLenderUserId(Long lenderUserId);

    // 대여 가능한 책 목록 조회 (기본)
    Page<Rent> findByRentStatus(RentStatus rentStatus, Pageable pageable);
    
    // 지역 필터링이 포함된 대여 가능한 책 목록 조회
    Page<Rent> findByRentStatusAndAddressContaining(RentStatus rentStatus, String address, Pageable pageable);
    
    // 카테고리 필터링이 포함된 대여 가능한 책 목록 조회
    Page<Rent> findByRentStatusAndCategoryContaining(RentStatus rentStatus, String category, Pageable pageable);
    
    // 검색어 필터링이 포함된 대여 가능한 책 목록 조회 (책 제목, 저자, 출판사에서 검색)
    @Query("SELECT r FROM Rent r WHERE r.rentStatus = :rentStatus AND " +
           "(r.bookTitle LIKE %:searchKeyword% OR r.author LIKE %:searchKeyword% OR r.publisher LIKE %:searchKeyword%)")
    Page<Rent> findByRentStatusAndSearchKeyword(@Param("rentStatus") RentStatus rentStatus, 
                                               @Param("searchKeyword") String searchKeyword, 
                                               Pageable pageable);
    
    // 지역 + 카테고리 필터링
    Page<Rent> findByRentStatusAndAddressContainingAndCategoryContaining(RentStatus rentStatus, String address, String category, Pageable pageable);
    
    // 지역 + 검색어 필터링
    @Query("SELECT r FROM Rent r WHERE r.rentStatus = :rentStatus AND r.address LIKE %:address% AND " +
           "(r.bookTitle LIKE %:searchKeyword% OR r.author LIKE %:searchKeyword% OR r.publisher LIKE %:searchKeyword%)")
    Page<Rent> findByRentStatusAndAddressAndSearchKeyword(@Param("rentStatus") RentStatus rentStatus, 
                                                         @Param("address") String address, 
                                                         @Param("searchKeyword") String searchKeyword, 
                                                         Pageable pageable);
    
    // 카테고리 + 검색어 필터링
    @Query("SELECT r FROM Rent r WHERE r.rentStatus = :rentStatus AND r.category LIKE %:category% AND " +
           "(r.bookTitle LIKE %:searchKeyword% OR r.author LIKE %:searchKeyword% OR r.publisher LIKE %:searchKeyword%)")
    Page<Rent> findByRentStatusAndCategoryAndSearchKeyword(@Param("rentStatus") RentStatus rentStatus, 
                                                          @Param("category") String category, 
                                                          @Param("searchKeyword") String searchKeyword, 
                                                          Pageable pageable);
    
    // 모든 필터링 조건 (지역 + 카테고리 + 검색어)
    @Query("SELECT r FROM Rent r WHERE r.rentStatus = :rentStatus AND r.address LIKE %:address% AND r.category LIKE %:category% AND " +
           "(r.bookTitle LIKE %:searchKeyword% OR r.author LIKE %:searchKeyword% OR r.publisher LIKE %:searchKeyword%)")
    Page<Rent> findByRentStatusAndAddressAndCategoryAndSearchKeyword(@Param("rentStatus") RentStatus rentStatus, 
                                                                    @Param("address") String address, 
                                                                    @Param("category") String category, 
                                                                    @Param("searchKeyword") String searchKeyword, 
                                                                    Pageable pageable);

    @Query("""
        SELECT r FROM Rent r WHERE
        (:userId IS NULL OR :userId = r.lenderUserId) AND
        (:status IS NULL OR r.rentStatus in :status)
        ORDER BY r.createdDate DESC
    """)
    Page<Rent> findFilteredRentHistory(
            Pageable pageable,
            @Param("status") List<String> status,
            @Param("userId") Long userId
    );
}
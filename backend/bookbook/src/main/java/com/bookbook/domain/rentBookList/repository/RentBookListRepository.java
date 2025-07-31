package com.bookbook.domain.rentBookList.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentBookListRepository extends JpaRepository<Rent, Integer> {    // Long → Integer로 변경

    // 대여 가능한 책 목록 조회 (필터링 포함)
    @Query("SELECT r FROM Rent r WHERE " +
           "(:region IS NULL OR r.address LIKE %:region%) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:search IS NULL OR r.bookTitle LIKE %:search% OR r.author LIKE %:search% OR r.publisher LIKE %:search%) AND " +
           "r.rentStatus = com.bookbook.domain.rent.entity.RentStatus.AVAILABLE " +
           "ORDER BY r.createdDate DESC")
    Page<Rent> findAvailableBooks(
            @Param("region") String region,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable
    );

    // 대여 가능한 책 목록 조회 (필터링 없음)
    @Query("SELECT r FROM Rent r WHERE " +
           "r.rentStatus = com.bookbook.domain.rent.entity.RentStatus.AVAILABLE " +
           "ORDER BY r.createdDate DESC")
    Page<Rent> findAllAvailableBooks(Pageable pageable);

    // 등록된 지역 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT r.address FROM Rent r WHERE r.address IS NOT NULL ORDER BY r.address")
    List<String> findDistinctRegions();

    // 등록된 카테고리 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT r.category FROM Rent r WHERE r.category IS NOT NULL ORDER BY r.category")
    List<String> findDistinctCategories();
}

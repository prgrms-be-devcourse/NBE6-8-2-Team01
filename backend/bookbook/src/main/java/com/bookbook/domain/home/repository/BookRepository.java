package com.bookbook.domain.home.repository;

import com.bookbook.domain.home.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 메인페이지용 Book Repository
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * 메인페이지용: 이미지가 있는 최신 5개 도서 조회 (id 기준 최신순, 대여 가능한 것만)
     */
    @Query(value = "SELECT * FROM rent WHERE book_image IS NOT NULL AND book_image != '' AND rent_status = 'AVAILABLE' ORDER BY id DESC LIMIT 5", nativeQuery = true)
    List<Book> findTop5WithImageOrderByIdDesc();
    
    /**
     * 지역별: 이미지가 있는 최신 5개 도서 조회 (id 기준 최신순, 대여 가능한 것만)
     */
    @Query(value = "SELECT * FROM rent WHERE book_image IS NOT NULL AND book_image != '' AND address LIKE CONCAT('%', ?1, '%') AND rent_status = 'AVAILABLE' ORDER BY id DESC LIMIT 5", nativeQuery = true)
    List<Book> findTop5WithImageByRegionOrderByIdDesc(String region);
    
    /**
     * 이미지가 있는 전체 도서 개수 조회 (대여 가능한 것만)
     */
    @Query(value = "SELECT COUNT(*) FROM rent WHERE book_image IS NOT NULL AND book_image != '' AND rent_status = 'AVAILABLE'", nativeQuery = true)
    long countBooksWithImage();
    
    /**
     * 지역별 이미지가 있는 도서 개수 조회 (대여 가능한 것만)
     */
    @Query(value = "SELECT COUNT(*) FROM rent WHERE book_image IS NOT NULL AND book_image != '' AND address LIKE CONCAT('%', ?1, '%') AND rent_status = 'AVAILABLE'", nativeQuery = true)
    long countBooksWithImageByRegion(String region);
    
    /**
     * 전체 지역 목록 조회 (중복 제거)
     */
    @Query(value = "SELECT DISTINCT address FROM rent WHERE address IS NOT NULL AND address != '' ORDER BY address", nativeQuery = true)
    List<String> findDistinctRegions();
}

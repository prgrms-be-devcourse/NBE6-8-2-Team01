package com.bookbook.domain.book.repository;

import com.bookbook.domain.book.entity.Book;
import com.bookbook.domain.book.enums.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    
    /**
     * 메인페이지용: 특정 지역(구)에서 등록된 도서 중 이미지가 있는 최신 5개 조회
     */
    @Query("SELECT b FROM Book b WHERE b.region = :region AND b.bookImage IS NOT NULL AND b.bookImage != '' AND b.status = :status ORDER BY b.createdAt DESC")
    List<Book> findTop5ByRegionWithImage(@Param("region") String region, @Param("status") BookStatus status);
    
    /**
     * 메인페이지용: 전체 도서 중 이미지가 있는 최신 5개 조회 (비로그인 사용자용)
     */
    @Query("SELECT b FROM Book b WHERE b.bookImage IS NOT NULL AND b.bookImage != '' AND b.status = :status ORDER BY b.createdAt DESC")
    List<Book> findTop5WithImage(@Param("status") BookStatus status);
    
    /**
     * 지역별 도서 개수 조회 (통계용)
     */
    long countByRegionAndStatus(String region, BookStatus status);
    
    /**
     * 전체 도서 개수 조회 (통계용)
     */
    long countByStatus(BookStatus status);
}

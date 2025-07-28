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
     * 메인페이지용: 이미지가 있는 최신 5개 도서 조회 (id 기준 최신순)
     */
    @Query(value = "SELECT * FROM books WHERE image IS NOT NULL AND image != '' ORDER BY id DESC LIMIT 5", nativeQuery = true)
    List<Book> findTop5WithImageOrderByIdDesc();
    
    /**
     * 이미지가 있는 전체 도서 개수 조회
     */
    @Query(value = "SELECT COUNT(*) FROM books WHERE image IS NOT NULL AND image != ''", nativeQuery = true)
    long countBooksWithImage();
}

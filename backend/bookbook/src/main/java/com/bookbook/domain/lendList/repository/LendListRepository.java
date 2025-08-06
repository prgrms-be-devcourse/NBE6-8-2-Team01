package com.bookbook.domain.lendList.repository;

import com.bookbook.domain.rent.entity.Rent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LendListRepository extends JpaRepository<Rent, Integer> {
    
    @Query("SELECT r FROM Rent r WHERE r.lenderUserId = :lenderUserId AND r.rentStatus != 'DELETED'")
    //         ↑      ↑     ↑                 ↑                 ↑                    ↑
    //       SELECT  FROM  엔티티명        필드명=파라미터   필드명               삭제되지 않은 것만
    Page<Rent> findByLenderUserId(@Param("lenderUserId") Long lenderUserId, Pageable pageable);

    @Query("SELECT r FROM Rent r WHERE r.lenderUserId = :lenderUserId AND r.rentStatus != 'DELETED' AND " +
           "(LOWER(r.bookTitle) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.author) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.publisher) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :searchKeyword, '%')))")
    Page<Rent> findByLenderUserIdAndSearchKeyword(@Param("lenderUserId") Long lenderUserId, 
                                                  @Param("searchKeyword") String searchKeyword, 
                                                  Pageable pageable);
    
    // 쿼리 설명:
    // - LOWER(): 대소문자 구분 없이 검색하기 위해 모두 소문자로 변환
    // - CONCAT('%', :searchKeyword, '%'): '검색어' → '%검색어%' 패턴 생성
    // - LIKE: 패턴 매칭 연산자 (%는 0개 이상의 임의 문자를 의미)
    // - OR: 4개 필드 중 하나라도 일치하면 검색 결과에 포함
}
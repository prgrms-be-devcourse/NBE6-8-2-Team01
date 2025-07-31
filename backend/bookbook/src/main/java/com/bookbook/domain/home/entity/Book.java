package com.bookbook.domain.home.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메인페이지용 Book 엔티티 (조회 전용)
 * 실제 rent 테이블을 조회하되, 필요한 필드만 매핑
 */
@Entity
@Table(name = "rent")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Getter
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String bookImage; // Rent 엔티티와 동일한 필드명 사용
    
    private String bookTitle; // 책 제목
    
    private String address; // 사용자 주소 (지역)
    
    // Getter 메서드들 - 프론트엔드 호환성을 위해 다른 이름으로 제공
    public String getImage() {
        return bookImage;
    }
    
    public String getTitle() {
        return bookTitle;
    }
    
    public String getRegion() {
        return address;
    }
}

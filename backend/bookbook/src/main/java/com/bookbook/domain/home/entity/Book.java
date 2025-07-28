package com.bookbook.domain.home.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메인페이지용 Book 엔티티 (조회 전용)
 * 기존 books 테이블을 조회하되, 필요한 필드만 매핑
 */
@Entity
@Table(name = "books")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Getter
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "image")
    private String image;
    
    // 다른 필드들은 메인페이지에서 사용하지 않으므로 매핑하지 않음
}

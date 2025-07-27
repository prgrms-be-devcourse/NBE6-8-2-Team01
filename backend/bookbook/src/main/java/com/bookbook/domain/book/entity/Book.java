package com.bookbook.domain.book.entity;

import com.bookbook.domain.book.enums.BookStatus;
import com.bookbook.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Getter
public class Book extends BaseEntity {
    
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "author", nullable = false)
    private String author;
    
    @Column(name = "publisher")
    private String publisher;
    
    @Column(name = "isbn")
    private String isbn;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "book_image") // 메인페이지용 핵심 필드
    private String bookImage;
    
    @Column(name = "rental_price")
    private Integer rentalPrice;
    
    @Column(name = "deposit")
    private Integer deposit;
    
    @Column(name = "region", nullable = false) // 등록 지역 (구 단위)
    private String region;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookStatus status;
    
    @Column(name = "owner_id", nullable = false) // 책 소유자 User ID
    private Long ownerId;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Builder
    public Book(String title, String author, String publisher, String isbn, 
                String description, String bookImage, Integer rentalPrice, 
                Integer deposit, String region, BookStatus status, Long ownerId) {
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.isbn = isbn;
        this.description = description;
        this.bookImage = bookImage;
        this.rentalPrice = rentalPrice;
        this.deposit = deposit;
        this.region = region;
        this.status = status != null ? status : BookStatus.AVAILABLE;
        this.ownerId = ownerId;
    }
    
    // 비즈니스 메서드
    public void changeStatus(BookStatus status) {
        this.status = status;
    }
    
    public boolean hasImage() {
        return this.bookImage != null && !this.bookImage.trim().isEmpty();
    }
    
    public boolean isAvailable() {
        return this.status == BookStatus.AVAILABLE;
    }
}

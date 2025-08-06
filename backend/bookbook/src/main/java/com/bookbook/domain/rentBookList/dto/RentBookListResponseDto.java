package com.bookbook.domain.rentBookList.dto;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class RentBookListResponseDto {
    private final Integer id;           // Long → Integer로 변경
    private final String bookTitle;
    private final String author;
    private final String publisher;
    private final String bookCondition;
    private final String bookImage;
    private final String address;
    private final String category;
    private final String rentStatus;    // RentStatus → String으로 변경 (한글 표시)
    private final Long lenderUserId;
    private final String lenderNickname; // 책 소유자 닉네임 추가
    private final String title;
    private final String contents;
    private final LocalDateTime createdDate;
    private final LocalDateTime modifiedDate;

    public RentBookListResponseDto(Rent rent, String lenderNickname) {
        this.id = rent.getId();         // 이제 int → Integer로 정상 변환
        this.bookTitle = rent.getBookTitle();
        this.author = rent.getAuthor();
        this.publisher = rent.getPublisher();
        this.bookCondition = rent.getBookCondition();
        this.bookImage = processImageUrl(rent.getBookImage()); // 이미지 URL 처리
        this.address = rent.getAddress();
        this.category = rent.getCategory();
        this.rentStatus = rent.getRentStatus().getDescription(); // 한글 상태로 변환
        this.lenderUserId = rent.getLenderUserId();
        this.lenderNickname = lenderNickname; // 사용자 닉네임 설정
        this.title = rent.getTitle();
        this.contents = rent.getContents();
        this.createdDate = rent.getCreatedDate();
        this.modifiedDate = rent.getModifiedDate();
    }
    
    // 이미지 URL 처리 메서드
    private String processImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return "/book-placeholder.png"; // 기본 이미지
        }
        
        // 이미 전체 URL인 경우 그대로 반환
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        
        // 상대 경로인 경우 절대 경로로 변환
        if (imageUrl.startsWith("/uploads/")) {
            return "http://localhost:8080" + imageUrl;
        }
        
        // uploads/로 시작하는 경우
        if (imageUrl.startsWith("uploads/")) {
            return "http://localhost:8080/" + imageUrl;
        }
        
        // 기타 경우 기본 처리
        return "http://localhost:8080" + (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
    }
}

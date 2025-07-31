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
    private final RentStatus rentStatus;
    private final Long lenderUserId;
    private final String title;
    private final String contents;
    private final LocalDateTime createdDate;
    private final LocalDateTime modifiedDate;

    public RentBookListResponseDto(Rent rent) {
        this.id = rent.getId();         // 이제 int → Integer로 정상 변환
        this.bookTitle = rent.getBookTitle();
        this.author = rent.getAuthor();
        this.publisher = rent.getPublisher();
        this.bookCondition = rent.getBookCondition();
        this.bookImage = rent.getBookImage();
        this.address = rent.getAddress();
        this.category = rent.getCategory();
        this.rentStatus = rent.getRentStatus();
        this.lenderUserId = rent.getLenderUserId();
        this.title = rent.getTitle();
        this.contents = rent.getContents();
        this.createdDate = rent.getCreatedDate();
        this.modifiedDate = rent.getModifiedDate();
    }
}

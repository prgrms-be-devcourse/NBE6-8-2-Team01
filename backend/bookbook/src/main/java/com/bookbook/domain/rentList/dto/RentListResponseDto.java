package com.bookbook.domain.rentList.dto;

import com.bookbook.domain.rentList.entity.RentList;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RentListResponseDto {
    
    private Integer id;
    private LocalDateTime loanDate;
    private LocalDateTime returnDate;
    private Long borrowerUserId;
    private Integer rentId;
    private String title;
    private String bookTitle;
    private String author;
    private String publisher;
    private String bookCondition;
    private String bookImage;
    private String rentStatus;
    private String address;
    private String lenderNickname;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public static RentListResponseDto from(RentList rentList, String lenderNickname) {
        return new RentListResponseDto(
                rentList.getId(),
                rentList.getLoanDate(),
                rentList.getReturnDate(),
                rentList.getBorrowerUser().getId(),
                rentList.getRent().getId(),
                rentList.getRent().getTitle(),
                rentList.getRent().getBookTitle(),
                rentList.getRent().getAuthor(),
                rentList.getRent().getPublisher(),
                rentList.getRent().getBookCondition(),
                rentList.getRent().getBookImage(),
                rentList.getRent().getRentStatus().name(),
                rentList.getRent().getAddress(),
                lenderNickname,
                rentList.getCreatedDate(),
                rentList.getModifiedDate()
        );
    }
}
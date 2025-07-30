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
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    
    public static RentListResponseDto from(RentList rentList) {
        return new RentListResponseDto(
                rentList.getId(),
                rentList.getLoanDate(),
                rentList.getReturnDate(),
                rentList.getBorrowerUser() != null ? rentList.getBorrowerUser().getId() : null,
                rentList.getRent() != null ? rentList.getRent().getId() : null,
                rentList.getCreatedDate(),
                rentList.getModifiedDate()
        );
    }
}
package com.bookbook.domain.rentList.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RentListCreateRequestDto {
    
    private LocalDateTime loanDate;
    private Integer rentId;
}
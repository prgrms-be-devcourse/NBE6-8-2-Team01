package com.bookbook.domain.rentList.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "대여 신청 수락/거절 요청 DTO")
public class RentRequestDecisionDto {
    
    @Schema(description = "수락 여부 (true: 수락, false: 거절)", example = "true")
    private boolean approved;
    
    @Schema(description = "거절 사유 (거절 시에만 필요)", example = "죄송합니다. 다른 분께 먼저 대여해드리기로 했습니다.")
    private String rejectionReason;
}

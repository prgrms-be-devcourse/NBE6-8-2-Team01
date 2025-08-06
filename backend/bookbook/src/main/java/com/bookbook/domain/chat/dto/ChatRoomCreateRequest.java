package com.bookbook.domain.chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRoomCreateRequest {
    
    @NotNull(message = "대여 게시글 ID는 필수입니다.")
    private Integer rentId;
    
    @NotNull(message = "빌려주는 사람 ID는 필수입니다.")
    private Integer lenderId;
}

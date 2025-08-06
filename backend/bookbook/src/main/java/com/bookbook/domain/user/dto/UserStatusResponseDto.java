package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.enums.UserStatus;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusResponseDto {
    private Long id;
    private UserStatus userStatus;
}
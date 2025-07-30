package com.bookbook.domain.user.dto.response;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record UserLoginResponseDto (
        @NonNull Long id,
        @NonNull String username,
        @NonNull String nickname,
        @NonNull Role role,
        @NonNull UserStatus status
){
    public static UserLoginResponseDto from(User user){
        return UserLoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .role(user.getRole())
                .status(user.getUserStatus())
                .build();
    }
}

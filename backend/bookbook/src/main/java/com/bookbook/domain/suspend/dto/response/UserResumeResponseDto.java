package com.bookbook.domain.suspend.dto.response;

import com.bookbook.domain.user.entity.User;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record UserResumeResponseDto(
        @NonNull Long userId,
        @NonNull String username,
        @NonNull String nickname,
        @NonNull String status,
        @NonNull LocalDateTime resumedAt
) {

    public static UserResumeResponseDto from(User user) {
        return UserResumeResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .status(user.getUserStatus().toString())
                .resumedAt(LocalDateTime.now())
                .build();
    }
}

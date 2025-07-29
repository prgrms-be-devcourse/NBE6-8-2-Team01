package com.bookbook.domain.suspend.dto.response;

import com.bookbook.domain.suspend.entity.SuspendedUser;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record UserSuspendResponseDto(
        @NonNull Long id,
        @NonNull Long userId,
        @NonNull String name,
        @NonNull String reason,
        @NonNull LocalDateTime suspendedAt,
        @NonNull LocalDateTime resumedAt
) {

    public static UserSuspendResponseDto from(SuspendedUser suspendedUser) {
        return UserSuspendResponseDto.builder()
                .id(suspendedUser.getId())
                .userId(suspendedUser.getUser().getId())
                .name(suspendedUser.getUser().getUsername())
                .reason(suspendedUser.getReason())
                .suspendedAt(suspendedUser.getSuspendedAt())
                .resumedAt(suspendedUser.getResumedAt())
                .build();
    }
}

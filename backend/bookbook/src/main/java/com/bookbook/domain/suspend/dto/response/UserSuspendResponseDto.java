package com.bookbook.domain.suspend.dto.response;

import com.bookbook.domain.suspend.entity.SuspendedUser;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record UserSuspendResponseDto(
        @NonNull Long id,
        @NonNull Long userId,
        @NonNull String reason,
        @NonNull LocalDateTime startAt,
        @NonNull LocalDateTime endAt
) {

    public static UserSuspendResponseDto from(SuspendedUser suspendedUser) {
        return UserSuspendResponseDto.builder()
                .id(suspendedUser.getId())
                .userId(suspendedUser.getUser().getId())
                .reason(suspendedUser.getReason())
                .startAt(suspendedUser.getCreateDate())
                .endAt(suspendedUser.getReleaseDate())
                .build();
    }
}

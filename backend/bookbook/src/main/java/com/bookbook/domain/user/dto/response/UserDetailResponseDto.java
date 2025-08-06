package com.bookbook.domain.user.dto.response;

import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.entity.User;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record UserDetailResponseDto (
        @NonNull UserBaseDto baseResponseDto,
        @NonNull String address,
        @NonNull Integer suspendCount,
        LocalDateTime suspendedAt,
        LocalDateTime resumedAt
){

    public static UserDetailResponseDto from(User user) {
        return UserDetailResponseDto.builder()
                .baseResponseDto(UserBaseDto.from(user))
                .address(user.getAddress())
                .suspendCount(user.getSuspends().size())
                .suspendedAt(user.getSuspendedAt())
                .resumedAt(user.getResumedAt())
                .build();
    }
}
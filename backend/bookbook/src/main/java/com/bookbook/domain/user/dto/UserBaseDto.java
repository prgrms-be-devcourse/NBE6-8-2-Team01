package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record UserBaseDto(
        @NonNull Long id,
        @NonNull String username,
        @NonNull String email,
        @NonNull String nickname,
        @NonNull Float rating,
        @NonNull LocalDateTime createdAt,
        @NonNull LocalDateTime updatedAt,
        @NonNull UserStatus userStatus,
        @NonNull Role role
){

    public static UserBaseDto from(User user) {
        return UserBaseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .rating(user.getRating())
                .createdAt(user.getCreateAt())
                .updatedAt(user.getUpdateAt())
                .userStatus(user.getUserStatus())
                .role(user.getRole())
                .build();
    }
}
package com.bookbook.domain.suspend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.NonNull;

public record UserSuspendRequestDto(
        @NonNull
        @NotBlank
        Long userId,

        @NonNull
        @NotBlank
        String reason,

        @NonNull
        @NotBlank
        Integer period
) {
}

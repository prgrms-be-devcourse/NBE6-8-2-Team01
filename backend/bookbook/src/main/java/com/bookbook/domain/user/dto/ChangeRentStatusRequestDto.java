package com.bookbook.domain.user.dto;

import lombok.NonNull;

public record ChangeRentStatusRequestDto(
        @NonNull String status
) {
}

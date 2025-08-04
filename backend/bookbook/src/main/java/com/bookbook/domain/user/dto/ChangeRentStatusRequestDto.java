package com.bookbook.domain.user.dto;

import com.bookbook.domain.rent.entity.RentStatus;
import lombok.NonNull;

public record ChangeRentStatusRequestDto(
        @NonNull RentStatus status
) {
}

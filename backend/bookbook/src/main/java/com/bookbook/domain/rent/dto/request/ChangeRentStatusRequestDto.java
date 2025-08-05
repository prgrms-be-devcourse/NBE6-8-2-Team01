package com.bookbook.domain.rent.dto.request;

import com.bookbook.domain.rent.entity.RentStatus;
import lombok.NonNull;

public record ChangeRentStatusRequestDto(
        @NonNull RentStatus status
) {
}

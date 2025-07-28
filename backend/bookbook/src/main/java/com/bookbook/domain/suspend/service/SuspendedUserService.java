package com.bookbook.domain.suspend.service;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.admin.repository.SuspendedUserRepository;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SuspendedUserService {
    private final SuspendedUserRepository suspendedUserRepository;

    @Transactional
    public SuspendedUser addSuspendUser(User user, UserSuspendRequestDto requestDto) {
        // 현재 정지 중인지 확인하고 정지 중이면 중단
        checkUserIsSuspended(requestDto);

        // 정지 상태로 전환 후 이력에 추가
        user.changeUserStatus(UserStatus.SUSPENDED);

        SuspendedUser suspendedUser = new SuspendedUser(user, requestDto.reason())
                .setSuspendPeriod(requestDto.period());

        return suspendedUserRepository.save(suspendedUser);
    }

    private void checkUserIsSuspended(UserSuspendRequestDto requestDto) {
        suspendedUserRepository
                .findByUserIdAndReleaseDateAfter(requestDto.userId(), LocalDateTime.now())
                .ifPresent((_suspendedUser) -> {
                    String dtFormat = _suspendedUser.getReleaseDate()
                            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 a h시"));
                    throw new RuntimeException("현재 이 멤버는 정지 상태입니다. %s에 정지 상태가 해제됩니다".formatted(dtFormat));
                });
    }
}

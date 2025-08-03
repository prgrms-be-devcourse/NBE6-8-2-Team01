package com.bookbook.domain.suspend.service;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.repository.SuspendedUserRepository;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SuspendedUserService {
    private final SuspendedUserRepository suspendedUserRepository;
    private final AdminService adminService;

    @Transactional
    public SuspendedUser addUserAsSuspended(UserSuspendRequestDto requestDto) {
        User user = adminService.findByUserId(requestDto.userId());

        // 현재 정지 중인지 확인하고 정지 중이면 중단
        checkUserIsSuspended(user);

        // 정지 상태로 전환 후 이력에 추가
        user.suspend(requestDto.period());

        SuspendedUser suspendedUser = new SuspendedUser(user, requestDto.reason());

        return suspendedUserRepository.save(suspendedUser);
    }

    @Transactional(readOnly = true)
    public Page<UserSuspendResponseDto> getSuspendedHistoryPage(Pageable pageable) {
        return suspendedUserRepository.findAllByOrderBySuspendedAtDesc(pageable)
                .map(UserSuspendResponseDto::from);
    }

    @Transactional
    public User resumeUser(Long userId) {
        User user = adminService.findByUserId(userId);
        if (user.getUserStatus() == UserStatus.ACTIVE) {
            throw new ServiceException("409-1", "해당 유저의 정지가 이미 해제되어 있습니다");
        }
        user.resume();
        return user;
    }

    private void checkUserIsSuspended(User user) {
        if (user.isSuspended()) {
            throw new ServiceException("409-1", "이 유저는 이미 정지 중입니다.");
        }
    }
}

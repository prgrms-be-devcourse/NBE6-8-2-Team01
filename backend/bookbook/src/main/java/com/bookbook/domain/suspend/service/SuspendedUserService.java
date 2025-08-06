package com.bookbook.domain.suspend.service;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.repository.SuspendedUserRepository;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.UserService;
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
    private final UserService userService;

    /**
     * 유저를 정지시키고, 정지 히스토리에 추가합니다.
     *
     * @param requestDto 정지 요청 정보
     * @return 생성된 정지 유저에 대한 정보
     * @throws ServiceException (409) - 해당 유저가 이미 정지 중인 상태
     */
    @Transactional
    public SuspendedUser addUserAsSuspended(UserSuspendRequestDto requestDto) {
        User user = userService.getByIdOrThrow(requestDto.userId());

        // 현재 정지 중인지 확인하고 정지 중이면 중단
        checkUserIsSuspended(user);

        // 정지 상태로 전환 후 이력에 추가
        user.suspend(requestDto.period());

        SuspendedUser suspendedUser = new SuspendedUser(user, requestDto.reason());

        return suspendedUserRepository.save(suspendedUser);
    }

    /**
     * 정지된 유저 히스토리를 페이지로 가져옵니다.
     *
     * @param pageable 페이지 정보
     * @return 유저 정지 히스토리 페이지
     */
    @Transactional(readOnly = true)
    public Page<UserSuspendResponseDto> getSuspendedHistoryPage(Pageable pageable) {
        return suspendedUserRepository.findAllByOrderBySuspendedAtDesc(pageable)
                .map(UserSuspendResponseDto::from);
    }

    /**
     * 정지된 유저를 활동 재개 시킵니다.
     *
     * @param userId 정지 해제 대상 유저 ID
     * @return 갱신된 유저 정보
     * @throws ServiceException
     * <p>(404) 해당 유저가 존재하지 않을 때
     * <p>(409) 해당 유저가 이미 정지가 해제되었을 때
     */
    @Transactional
    public User resumeUser(Long userId) {
        User user = userService.getByIdOrThrow(userId);

        checkUserIsActive(user);

        user.resume();

        return user;
    }

    /**
     * 유저가 이미 정지가 해제되어 있는 지 확인합니다.
     *
     * @param user 유저 정보
     * @throws ServiceException (409) 해당 유저가 이미 활동 중일 때
     */
    private void checkUserIsActive(User user){
        if (user.getUserStatus() == UserStatus.ACTIVE) {
            throw new ServiceException("409-1", "해당 유저의 정지가 이미 해제되어 있습니다");
        }
    }

    /**
     * 유저가 이미 정지되어 있는 지 확인합니다.
     *
     * @param user 유저 정보
     * @throws ServiceException (409) 해당 유저가 이미 정지되어 있을 때
     */
    private void checkUserIsSuspended(User user) {
        if (user.isSuspended()) {
            throw new ServiceException("409-1", "이 유저는 이미 정지 중입니다.");
        }
    }
}

package com.bookbook.domain.suspend.repository;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuspendedUserRepository extends JpaRepository<UserSuspendRequestDto, Integer> {

}

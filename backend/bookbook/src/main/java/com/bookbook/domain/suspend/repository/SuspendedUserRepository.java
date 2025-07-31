package com.bookbook.domain.suspend.repository;

import com.bookbook.domain.suspend.entity.SuspendedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuspendedUserRepository extends JpaRepository<SuspendedUser, Long> {

    Page<SuspendedUser> findAllByOrderBySuspendedAtDesc(Pageable pageable);
}

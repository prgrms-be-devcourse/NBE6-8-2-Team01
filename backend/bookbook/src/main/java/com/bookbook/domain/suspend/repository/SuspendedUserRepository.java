package com.bookbook.domain.suspend.repository;

import com.bookbook.domain.suspend.entity.SuspendedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SuspendedUserRepository extends JpaRepository<SuspendedUser, Long> {

    @Query("""
        SELECT s FROM SuspendedUser s WHERE
        (:userId IS NULL OR s.user.id = :userId)
        ORDER BY s.suspendedAt DESC
    """)
    Page<SuspendedUser> findAllFilteredUser(
            Pageable pageable,
            @Param("userId") Long userId
    );
}

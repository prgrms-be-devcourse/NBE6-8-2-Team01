package com.bookbook.domain.wishList.repository;

import com.bookbook.domain.wishList.entity.WishList;
import com.bookbook.domain.wishList.enums.WishListStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    // Status를 포함한 조회 메서드들
    List<WishList> findByUserIdAndStatusOrderByCreateDateDesc(Long userId, WishListStatus status);

    Optional<WishList> findByUserIdAndRentIdAndStatus(Long userId, Integer rentId, WishListStatus status);
}

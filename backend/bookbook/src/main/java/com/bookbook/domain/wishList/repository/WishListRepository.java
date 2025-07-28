package com.bookbook.domain.wishList.repository;

import com.bookbook.domain.wishList.entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    // 수정: createDate로 필드명 변경
    List<WishList> findByUserIdOrderByCreateDateDesc(Long userId);

    Optional<WishList> findByUserIdAndRentId(Long userId, Integer rentId);
}

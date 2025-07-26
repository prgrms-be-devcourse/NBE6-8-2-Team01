package com.bookbook.domain.rent.service;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.boot.model.naming.IllegalIdentifierException;
import org.springframework.expression.ExpressionException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentService {
    private final RentRepository rentRepository;

    // Rent POST 요청
    @Transactional
    public void createRentPage(RentRequestDto dto, int userId) {
        // 유저 정보 조회
//        User user = userRepository.findById(userId)
//                .orElseThrow(()->new IllegalIdentifierException("로그인 또는 회원가입을 해 주세요"));
        // Rent 엔티티 생성
        Rent rent = new Rent();
        rent.setLender_user_id(userId);
        rent.setBookCondition(dto.bookCondition());
        rent.setBookImage(dto.bookImage());
        rent.setAddress(dto.address());
        rent.setContents(dto.contents());
        rent.setRent_status(dto.rent_status());

        rent.setTitle(dto.title());
        rent.setAuthor(dto.author());
        rent.setPublisher(dto.publisher());

        // Rent에 추가
        rentRepository.save(rent);
    }

    public RentResponseDto getRentPage(int id) {

        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ExpressionException("상품을 찾을 수 없습니다."));

        return new RentResponseDto(
                rent.getLender_user_id(),
                rent.getBookCondition(),
                rent.getBookImage(),
                rent.getAddress(),
                rent.getContents(),
                rent.getRent_status(),
                rent.getTitle(),
                rent.getAuthor(),
                rent.getPublisher(),
                rent.getCreatedDate(),
                rent.getModifiedDate()
        );
    }
}

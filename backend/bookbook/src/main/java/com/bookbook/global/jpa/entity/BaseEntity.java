package com.bookbook.global.jpa.entity;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

import static jakarta.persistence.GenerationType.IDENTITY;
import static lombok.AccessLevel.PROTECTED;

// 직접 인스턴스화할 수 없으며, 자식 클래스가 구현하는 추상 메서드를 포함한 클래스
@MappedSuperclass // JPA에서 부모 클래스의 매핑 정보를 자식 엔티티 클래스에 상속, 이 클래스 자체는 테이블과 매핑되지 않도록 지정
@EntityListeners(AuditingEntityListener.class) // JPA의 기능을 이용해 엔티티의 생성 및 수정 시간 등을 자동으로 기록
@Getter
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Setter(PROTECTED)
    private int id;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime modifiedDate;
}

package com.bookbook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing  // JPA Auditing 활성화 (createdAt, updatedAt 자동 처리)
public class BookbookApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookbookApplication.class, args);
    }

}

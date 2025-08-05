package com.bookbook.global.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> data;
    private PageInfo pageInfo;

    @Builder
    @Getter
    private static class PageInfo {
        private Integer currentPage;
        private Integer totalPages;
        private Long totalElements;
        private Integer size;
    }

    public static <T> PageResponse<T> from(Page<T> page, Integer pageNum, Integer size) {
        PageResponse.PageInfo pageInfo = PageInfo.builder()
                .currentPage(pageNum)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .size(size)
                .build();

        return new PageResponse<>(page.getContent(), pageInfo);
    }
}

package com.travelhub.dto.response;

import java.util.List;

import lombok.*;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.function.Function;

@Getter
@Setter
@AllArgsConstructor  
@NoArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> data;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean isLast;

     // Hàm chuyển đổi tổng quát từ Page<Entity> sang PageResponse<DTO>
    public static <E, DTO> PageResponse<DTO> fromPage(Page<E> page, Function<E, DTO> converter) {
        List<DTO> dtoList = page.getContent().stream()
                .map(converter)
                .toList();

        return PageResponse.<DTO>builder()
                .data(dtoList)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }
}

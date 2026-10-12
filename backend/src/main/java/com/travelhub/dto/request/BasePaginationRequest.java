package com.travelhub.dto.request;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class BasePaginationRequest {
    private int page =0;
    private int size = 10;
    private String sortBy = "id";
    private String order = "ASC";

    public Pageable toPageable() {
        Sort sort = order.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return PageRequest.of(page, size, sort);
    }
}

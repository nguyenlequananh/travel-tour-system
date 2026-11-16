package com.travelhub.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationFilterRequest extends BasePaginationRequest {

    private Long userId; // Chỉ cần biết thông báo này của ai!

    public NotificationFilterRequest() {
        setSortBy("createdAt");
        setOrder("DESC"); // Mặc định tin mới nhất lên đầu
    }
}
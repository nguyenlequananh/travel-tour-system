package com.travelhub.enums;

public enum DepartureStatus {
    OPEN,       // Đang mở bán, còn chỗ
    CLOSED,     // Đã đóng suất (hết chỗ hoặc sát ngày bay)
    CANCELLED ,
    SOLD_OUT  // Đã hủy chuyến (do bão lũ, thời tiết...)
}
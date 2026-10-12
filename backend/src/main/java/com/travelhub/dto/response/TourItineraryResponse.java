package com.travelhub.dto.response;

import com.travelhub.entity.TourItinerary;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourItineraryResponse {
    private Long id;
    private Long tourId;
    private String tourName; // Lấy từ tour.getName()
    private Integer dayNumber;
    private String title;
    private String details;
    private String meals;
    private String accommodation;

    public static TourItineraryResponse fromEntity(TourItinerary itinerary) {
        if (itinerary == null) return null;

        return TourItineraryResponse.builder()
                .id(itinerary.getId())
                .tourId(itinerary.getTour() != null ? itinerary.getTour().getId() : null)
                .tourName(itinerary.getTour() != null ? itinerary.getTour().getName() : null)
                .dayNumber(itinerary.getDayNumber())
                .title(itinerary.getTitle())
                .details(itinerary.getDetails())
                .meals(itinerary.getMeals())
                .accommodation(itinerary.getAccommodation())
                .build();
    }
}
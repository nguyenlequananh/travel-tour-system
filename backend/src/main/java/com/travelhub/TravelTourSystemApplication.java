package com.travelhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync // <- Thêm annotation này
@EnableJpaAuditing // <-- THÊM DÒNG NÀY
@EnableScheduling
public class TravelTourSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelTourSystemApplication.class, args);
    }

}
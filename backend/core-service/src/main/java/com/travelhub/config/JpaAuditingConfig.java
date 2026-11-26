package com.travelhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Tách riêng @EnableJpaAuditing ra khỏi lớp @SpringBootApplication
 * để các Slice Test như @WebMvcTest không bị lỗi "JPA metamodel must not be empty".
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}

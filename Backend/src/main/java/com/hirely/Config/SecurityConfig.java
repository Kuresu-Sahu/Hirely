package com.hirely.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.hirely.Security.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        // CORS CONFIGURATION
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
                if (allowedOrigins == null || allowedOrigins.isBlank()) {
                        allowedOrigins = "http://localhost:5173";
                }

                List<String> origins = Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .toList();

                configuration.setAllowedOrigins(origins);

                configuration.setAllowedMethods(Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                ));

                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setExposedHeaders(Arrays.asList("Authorization"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**",configuration);
                return source;
        }

        // SECURITY FILTER CHAIN
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                        // CORS
                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                        // CSRF
                        .csrf(csrf -> csrf.disable())
                        
                        // STATELESS JWT
                        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                        // AUTHORIZATION
                        .authorizeHttpRequests(auth -> auth

                                // PREFLIGHT
                                .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()

                                // PUBLIC AUTH
                                .requestMatchers("/api/auth/**", "/api/test", "/api/health/db").permitAll()

                                // PUBLIC JOB SEARCH
                                .requestMatchers(HttpMethod.GET,"/api/jobs").permitAll()

                                .requestMatchers(HttpMethod.GET,"/api/jobs/search").permitAll()

                                .requestMatchers(HttpMethod.GET,"/api/jobs/*").permitAll()

                                // RECRUITER JOBS
                                .requestMatchers(HttpMethod.GET,"/api/jobs/my").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.POST,"/api/jobs").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.PUT,"/api/jobs/*").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.DELETE,"/api/jobs/*").hasRole("RECRUITER")

                                // CANDIDATE APPLICATIONS
                                .requestMatchers(HttpMethod.POST,"/api/applications").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/applications/my").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/applications/job/**").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.PUT,"/api/applications/*/status").hasRole("RECRUITER")

                                // CANDIDATE APPLICATION DETAILS
                                //
                                // Must come after the recruiter-specific
                                // /job/** rule above.
                                .requestMatchers(HttpMethod.GET,"/api/applications/*").hasRole("CANDIDATE")

                                // RECRUITER CANDIDATE RESUME
                                .requestMatchers(HttpMethod.GET,"/api/applications/*/resume").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.GET,"/api/applications/*/resume/download").hasRole("RECRUITER")

                                // COMPANY
                                .requestMatchers(HttpMethod.POST,"/api/companies").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.GET,"/api/companies/my").hasRole("RECRUITER")

                                // CANDIDATE RESUME
                                .requestMatchers(HttpMethod.POST,"/api/resumes/upload").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/resumes/my").hasRole("CANDIDATE")

                                // RESUME ANALYSIS
                                .requestMatchers(HttpMethod.POST,"/api/resume-analysis/job/**").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/resume-analysis/my").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/resume-analysis/latest").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/resume-analysis/*").hasRole("CANDIDATE")

                                // AI RESUME ANALYSIS
                                .requestMatchers(HttpMethod.POST,"/api/ai/analyze/**").hasRole("CANDIDATE")

                                // AI INTERVIEW — CANDIDATE
                                .requestMatchers(HttpMethod.POST,"/api/interview-attempts").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/interview-attempts/my").hasRole("CANDIDATE")

                                .requestMatchers(HttpMethod.GET,"/api/interview-attempts/*").hasRole("CANDIDATE")

                                // AI INTERVIEW — RECRUITER
                                //
                                // Must be before the generic /{id} rule.
                                .requestMatchers(HttpMethod.GET,"/api/interview-attempts/application/**").hasRole("RECRUITER")

                                // RECRUITER DASHBOARD
                                .requestMatchers(HttpMethod.GET,"/api/recruiter/dashboard/**").hasRole("RECRUITER")

                                // RECRUITER EVALUATIONS
                                .requestMatchers(HttpMethod.GET,"/api/recruiter/evaluations/**").hasRole("RECRUITER")

                                // NOTIFICATIONS
                                //
                                // Both authenticated roles can access their
                                // own notifications. The service filters by
                                // authenticated user ID.
                                .requestMatchers("/api/notifications/**").authenticated()

                                // EVERYTHING ELSE
                                .anyRequest().authenticated()
                        )

                                // JWT FILTER
                                .addFilterBefore(jwtAuthenticationFilter,UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }
}
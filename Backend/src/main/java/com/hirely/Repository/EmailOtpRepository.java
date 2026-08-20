package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.EmailOtp;
import com.hirely.Entity.OtpPurpose;

import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
        Optional<EmailOtp> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, OtpPurpose purpose);

        void deleteByEmailAndPurpose(String email, OtpPurpose purpose);

        void deleteByExpiresAtBefore(java.time.LocalDateTime time);
}
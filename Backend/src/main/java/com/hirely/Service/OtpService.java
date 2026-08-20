package com.hirely.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirely.Entity.EmailOtp;
import com.hirely.Entity.OtpPurpose;
import com.hirely.Repository.EmailOtpRepository;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Transactional
public class OtpService {

        private final EmailOtpRepository otpRepository;

        private final EmailService emailService;

        private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        private final SecureRandom secureRandom = new SecureRandom();

        @Value("${app.otp.expiration-minutes:5}")
        private long expirationMinutes;

        @Value("${app.otp.resend-cooldown-seconds:60}")
        private long resendCooldownSeconds;

        @Value("${app.otp.max-attempts:5}")
        private int maxAttempts;

        public OtpService(
                        EmailOtpRepository otpRepository,
                        EmailService emailService) {

                this.otpRepository = otpRepository;

                this.emailService = emailService;
        }

        // REGISTRATION OTP
        public void createRegistrationOtp(
                String email,
                String name,
                String passwordHash,
                String role
        ) {
                createOtp(
                        email,
                        OtpPurpose.REGISTER,
                        name,
                        passwordHash,
                        role);
        }

        // LOGIN OTP
        public void createLoginOtp(String email) {
                createOtp(email, OtpPurpose.LOGIN, null, null, null);
        }

        // PASSWORD RESET OTP
        public void createPasswordResetOtp(String email) {
                createOtp(
                        email,
                        OtpPurpose.PASSWORD_RESET,
                        null,
                        null,
                        null);
        }

        // RESEND OTP
        public void resendOtp(String email, OtpPurpose purpose) {

                email = normalizeEmail(email);

                EmailOtp existing = otpRepository
                        .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                        .orElseThrow(() -> new RuntimeException("No pending OTP request found"));

                LocalDateTime now = LocalDateTime.now();

                if (existing.getLastSentAt() != null && existing
                                .getLastSentAt()
                                .plusSeconds(resendCooldownSeconds)
                                .isAfter(now)
                        ) {

                        long remaining = Duration
                                        .between(
                                                        now,
                                                        existing
                                                                        .getLastSentAt()
                                                                        .plusSeconds(
                                                                                        resendCooldownSeconds))
                                        .getSeconds();

                        throw new RuntimeException(
                                        "Please wait "
                                                        +
                                                        Math.max(
                                                                        1,
                                                                        remaining)
                                                        +
                                                        " seconds before requesting another OTP");
                }

                sendNewOtp(existing);
        }

        // VERIFY OTP
        public EmailOtp verifyOtp(
                        String email,
                        String otp,
                        OtpPurpose purpose
                ) {

                email = normalizeEmail(email);

                EmailOtp emailOtp = otpRepository
                        .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                        .orElseThrow(() -> new RuntimeException("OTP not found or already used"));

                LocalDateTime now = LocalDateTime.now();

                if (emailOtp.getExpiresAt().isBefore(now)) {
                        emailOtp.setUsed(true);
                        otpRepository.save(emailOtp);

                        throw new RuntimeException("OTP has expired. Please request a new OTP.");
                }

                int attempts = emailOtp.getAttempts() == null ? 0 : emailOtp.getAttempts();

                if (attempts >= maxAttempts) {
                        emailOtp.setUsed(true);
                        otpRepository.save(emailOtp);
                        throw new RuntimeException("Too many incorrect OTP attempts. Please request a new OTP.");
                }

                if (otp == null || !otp.matches("\\d{6}")) {

                        emailOtp.setAttempts(attempts + 1);

                        if (emailOtp.getAttempts() >= maxAttempts) {
                                emailOtp.setUsed(true);
                        }

                        otpRepository.save(emailOtp);

                        throw new RuntimeException("Enter a valid 6-digit OTP");
                }

                boolean matches = passwordEncoder.matches(otp, emailOtp.getOtpHash());

                if (!matches) {
                        int updatedAttempts = attempts + 1;
                        emailOtp.setAttempts(updatedAttempts);
                        if (updatedAttempts >= maxAttempts) {
                                emailOtp.setUsed(true);
                        }
                        otpRepository.save(emailOtp);

                        throw new RuntimeException("Invalid OTP");
                }

                emailOtp.setUsed(true);

                otpRepository.save(emailOtp);

                return emailOtp;
        }

        // CREATE OTP
        private void createOtp(
                        String email,
                        OtpPurpose purpose,
                        String pendingName,
                        String pendingPasswordHash,
                        String pendingRole) {

                email = normalizeEmail(email);

                LocalDateTime now = LocalDateTime.now();

                EmailOtp previous = otpRepository
                                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                                .orElse(null);

                if (previous != null && previous.getLastSentAt() != null && previous
                                .getLastSentAt()
                                .plusSeconds(resendCooldownSeconds)
                                .isAfter(now)
                ) {
                        long remaining = Duration.between(now, previous.getLastSentAt().plusSeconds(resendCooldownSeconds)).getSeconds();
                        throw new RuntimeException("Please wait " + Math.max(1,remaining)+" seconds before requesting another OTP");
                }

                otpRepository.deleteByEmailAndPurpose(email, purpose);

                String otp = generateOtp();

                EmailOtp emailOtp = new EmailOtp();

                emailOtp.setEmail(email);

                emailOtp.setPurpose(purpose);

                emailOtp.setPendingName(pendingName);

                emailOtp.setPendingPasswordHash(pendingPasswordHash);

                emailOtp.setPendingRole(pendingRole);

                emailOtp.setCreatedAt(now);

                emailOtp.setLastSentAt(now);

                emailOtp.setExpiresAt(now.plusMinutes(expirationMinutes));

                emailOtp.setAttempts(0);

                emailOtp.setUsed(false);

                emailOtp.setOtpHash(passwordEncoder.encode(otp));

                otpRepository.save(emailOtp);

                emailService.sendOtpEmail(email, otp, purpose);
        }

        // RESEND
        private void sendNewOtp(EmailOtp emailOtp) {

                LocalDateTime now = LocalDateTime.now();

                String otp = generateOtp();

                emailOtp.setOtpHash(passwordEncoder.encode(otp));

                emailOtp.setCreatedAt(now);

                emailOtp.setLastSentAt(now);

                emailOtp.setExpiresAt(now.plusMinutes(expirationMinutes));

                emailOtp.setAttempts(0);

                emailOtp.setUsed(false);

                otpRepository.save(emailOtp);

                emailService.sendOtpEmail(emailOtp.getEmail(), otp, emailOtp.getPurpose());
        }

        // OTP GENERATOR
        private String generateOtp() {
                int number = secureRandom.nextInt(1_000_000);

                return String.format("%06d", number);
        }

        // EMAIL NORMALIZATION
        private String normalizeEmail(String email) {
                if (email == null || email.isBlank()) {
                        throw new RuntimeException("Email is required");
                }

                return email.trim().toLowerCase();
        }
}
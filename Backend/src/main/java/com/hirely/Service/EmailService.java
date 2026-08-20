package com.hirely.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirely.Entity.OtpPurpose;

@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final String FROM_EMAIL = "Hirely <onboarding@resend.dev>";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // SEND OTP EMAIL
    public void sendOtpEmail(String email, String otp, OtpPurpose purpose) {

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is not configured");
        }

        String subject;
        String message;

        if (purpose == OtpPurpose.REGISTER) {

            subject = "Hirely - Verify Your Email";

            message = "Hello,\n\n"
                    + "Your Hirely email verification code is:\n\n"
                    + otp
                    + "\n\n"
                    + "This OTP is valid for 5 minutes.\n"
                    + "Do not share this code with anyone.\n\n"
                    + "If you did not request this code, you can safely ignore this email.\n\n"
                    + "Regards,\n"
                    + "Hirely";

        } else if (purpose == OtpPurpose.LOGIN) {

            subject = "Hirely - Login Verification Code";

            message = "Hello,\n\n"
                    + "Your Hirely login verification code is:\n\n"
                    + otp
                    + "\n\n"
                    + "This OTP is valid for 5 minutes.\n"
                    + "Do not share this code with anyone.\n\n"
                    + "If you did not request this login code, please ignore this email.\n\n"
                    + "Regards,\n"
                    + "Hirely";

        } else {

            subject = "Hirely - Password Reset Code";

            message = "Hello,\n\n"
                    + "We received a request to reset your Hirely password.\n\n"
                    + "Your password reset verification code is:\n\n"
                    + otp
                    + "\n\n"
                    + "This OTP is valid for 5 minutes.\n"
                    + "Do not share this code with anyone.\n\n"
                    + "If you did not request a password reset, you can safely ignore this email.\n\n"
                    + "Regards,\n"
                    + "Hirely";
        }

        try {
            String requestBody = objectMapper.writeValueAsString(
                    new ResendEmailRequest(
                            FROM_EMAIL,
                            email,
                            subject,
                            message));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "Resend email API failed. HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body());
            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Email sending was interrupted",
                    e);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to send email through Resend",
                    e);
        }
    }

    private record ResendEmailRequest(
            String from,
            String to,
            String subject,
            String text) {
    }
}
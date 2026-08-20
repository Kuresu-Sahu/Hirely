package com.hirely.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.hirely.Entity.OtpPurpose;

@Service
public class EmailService {
        private final JavaMailSender mailSender;

        @Value("${spring.mail.username}")
        private String fromEmail;

        public EmailService(JavaMailSender mailSender) {
                this.mailSender = mailSender;
        }

        // SEND OTP EMAIL
        public void sendOtpEmail(String email, String otp, OtpPurpose purpose) {
                String subject;
                String message;

                if (purpose == OtpPurpose.REGISTER) {
                        subject = "Hirely - Verify Your Email";
                        
                        message = "Hello,\n\n" +

                                        "Your Hirely email verification code is:\n\n" +

                                        otp +

                                        "\n\n" +

                                        "This OTP is valid for 5 minutes.\n" +

                                        "Do not share this code with anyone.\n\n" +

                                        "If you did not request this code, you can safely ignore this email.\n\n" +

                                        "Regards,\n" +

                                        "Hirely";

                } else if (purpose == OtpPurpose.LOGIN) {

                        subject = "Hirely - Login Verification Code";

                        message = "Hello,\n\n" +

                                        "Your Hirely login verification code is:\n\n" +

                                        otp +

                                        "\n\n" +

                                        "This OTP is valid for 5 minutes.\n" +

                                        "Do not share this code with anyone.\n\n" +

                                        "If you did not request this login code, please ignore this email.\n\n" +

                                        "Regards,\n" +

                                        "Hirely";

                } else {

                        subject = "Hirely - Password Reset Code";

                        message = "Hello,\n\n" +

                                        "We received a request to reset your Hirely password.\n\n" +

                                        "Your password reset verification code is:\n\n" +

                                        otp +

                                        "\n\n" +

                                        "This OTP is valid for 5 minutes.\n" +

                                        "Do not share this code with anyone.\n\n" +

                                        "If you did not request a password reset, you can safely ignore this email.\n\n"
                                        +

                                        "Regards,\n" +

                                        "Hirely";
                }

                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom(fromEmail);
                mail.setTo(email);
                mail.setSubject(subject);
                mail.setText(message);
                mailSender.send(mail);
        }
}
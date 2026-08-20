package com.hirely.Controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.ForgotPasswordRequest;
import com.hirely.Dto.LoginRequest;
import com.hirely.Dto.LoginResponse;
import com.hirely.Dto.OtpRequest;
import com.hirely.Dto.RegisterRequest;
import com.hirely.Dto.ResendOtpRequest;
import com.hirely.Dto.ResetPasswordRequest;
import com.hirely.Entity.EmailOtp;
import com.hirely.Entity.OtpPurpose;
import com.hirely.Entity.User;
import com.hirely.Service.OtpService;
import com.hirely.Service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
        private final UserService userService;
        private final OtpService otpService;

        public AuthController(UserService userService, OtpService otpService) {
                this.userService = userService;
                this.otpService = otpService;
        }

        // CANDIDATE REGISTER
        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
                try {
                        userService.startRegistration(request, "CANDIDATE");

                        return ResponseEntity.ok("OTP sent to your email. Please verify your email.");
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // RECRUITER REGISTER
        @PostMapping("/register/recruiter")
        public ResponseEntity<?> registerRecruiter(@Valid @RequestBody RegisterRequest request) {
                try {
                        userService.startRegistration(request, "RECRUITER");

                        return ResponseEntity.ok("OTP sent to your email. Please verify your email.");
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // VERIFY REGISTRATION OTP
        @PostMapping("/verify-registration")
        public ResponseEntity<?> verifyRegistration(@Valid @RequestBody OtpRequest request) {
                try {
                        if (!"REGISTER".equalsIgnoreCase(request.getPurpose())) {
                                return ResponseEntity.badRequest().body("Invalid OTP purpose");
                        }

                        EmailOtp verifiedOtp = otpService.verifyOtp(
                                        request.getEmail().trim().toLowerCase(),
                                        request.getOtp().trim(),
                                        OtpPurpose.REGISTER);

                        userService.completeRegistration(verifiedOtp);

                        return ResponseEntity.ok("Email verified and account created successfully");
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // LOGIN
        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
                try {
                        userService.startLogin(request);

                        return ResponseEntity.ok("OTP sent to your email. Please verify your email to continue.");
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // VERIFY LOGIN OTP
        @PostMapping("/verify-login")
        public ResponseEntity<?> verifyLogin(@Valid @RequestBody OtpRequest request) {
                try {
                        if (!"LOGIN".equalsIgnoreCase(request.getPurpose())) {
                                return ResponseEntity.badRequest().body("Invalid OTP purpose");
                        }

                        EmailOtp verifiedOtp = otpService.verifyOtp(
                                        request.getEmail().trim().toLowerCase(),
                                        request.getOtp().trim(),
                                        OtpPurpose.LOGIN);

                        LoginResponse response = userService.completeLogin(
                                        verifiedOtp.getEmail());

                        return ResponseEntity.ok(response);
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // FORGOT PASSWORD
        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
                try {
                        String email = request.getEmail().trim().toLowerCase();
                        userService.sendPasswordResetOtp(email);
                        /*
                         * Deliberately return the same response
                         * whether the email exists or not.
                         *
                         * This prevents account enumeration.
                         */

                        return ResponseEntity.ok(
                                "If an account exists for this email, a password reset OTP has been sent."
                        );
                } catch (RuntimeException exception) {
                        /*
                         * Do not expose whether an account exists.
                         *
                         * Cooldown/rate-limit errors are safe to return.
                         */
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // RESET PASSWORD
        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                try {
                        String email = request.getEmail().trim().toLowerCase();

                        EmailOtp verifiedOtp = otpService.verifyOtp(
                                email,
                                request.getOtp().trim(),
                                OtpPurpose.PASSWORD_RESET
                        );

                        userService.resetPassword(verifiedOtp.getEmail(),request.getNewPassword());

                        return ResponseEntity.ok(
                                "Password reset successfully. You can now login with your new password."
                        );
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }

        // RESEND OTP
        @PostMapping("/resend-otp")
        public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
                try {
                        OtpPurpose purpose;
                        try {
                                purpose = OtpPurpose.valueOf(request.getPurpose().trim().toUpperCase());
                        } catch (IllegalArgumentException exception) {
                                return ResponseEntity.badRequest().body("Invalid OTP purpose");
                        }

                        otpService.resendOtp(
                                request.getEmail().trim().toLowerCase(),
                                purpose
                        );

                        return ResponseEntity.ok("A new OTP has been sent to your email.");
                } catch (RuntimeException exception) {
                        return ResponseEntity.badRequest().body(exception.getMessage());
                }
        }
}
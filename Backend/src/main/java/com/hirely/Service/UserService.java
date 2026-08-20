package com.hirely.Service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.hirely.Dto.LoginRequest;
import com.hirely.Dto.LoginResponse;
import com.hirely.Dto.RegisterRequest;
import com.hirely.Entity.EmailOtp;
import com.hirely.Entity.User;
import com.hirely.Repository.UserRepository;
import com.hirely.Security.JwtService;

@Service
public class UserService {
        private final UserRepository userRepository;

        private final JwtService jwtService;

        private final OtpService otpService;

        private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        public UserService(
                        UserRepository userRepository,
                        JwtService jwtService,
                        OtpService otpService) {

                this.userRepository = userRepository;

                this.jwtService = jwtService;

                this.otpService = otpService;
        }

        // START REGISTRATION
        public void startRegistration(
                        RegisterRequest request,
                        String role) {

                if (request == null) {
                        throw new RuntimeException("Registration data is required");
                }

                String email = request
                                .getEmail()
                                .trim()
                                .toLowerCase();

                String name = request
                                .getName()
                                .trim();

                if (userRepository.existsByEmail(email)) {
                        throw new RuntimeException("Email already registered");
                }

                String encryptedPassword = passwordEncoder.encode(request.getPassword());

                otpService.createRegistrationOtp(
                                email,
                                name,
                                encryptedPassword,
                                role);
        }

        // COMPLETE REGISTRATION
        public User completeRegistration(EmailOtp verifiedOtp) {

                if (verifiedOtp == null) {
                        throw new RuntimeException("Invalid registration verification");
                }

                String email = verifiedOtp
                                .getEmail()
                                .trim()
                                .toLowerCase();

                if (userRepository.existsByEmail(email)) {
                        throw new RuntimeException("Email already registered");
                }

                User user = new User();

                user.setName(verifiedOtp.getPendingName());

                user.setEmail(email);

                user.setPassword(verifiedOtp.getPendingPasswordHash());

                user.setRole(verifiedOtp.getPendingRole());

                if ("RECRUITER".equals(verifiedOtp.getPendingRole())) {
                        user.setCompany(null);
                }
                return userRepository.save(user);
        }

        // START LOGIN
        public void startLogin(LoginRequest request) {

                if (request == null) {
                        throw new RuntimeException("Login data is required");
                }

                String email = request
                                .getEmail()
                                .trim()
                                .toLowerCase();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Invalid email or password"));

                boolean passwordMatches = passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword());

                if (!passwordMatches) {
                        throw new RuntimeException("Invalid email or password");
                }

                otpService.createLoginOtp(email);
        }

        // COMPLETE LOGIN
        public LoginResponse completeLogin(String email) {
                User user = userRepository.findByEmail(email.trim().toLowerCase())
                        .orElseThrow(() -> new RuntimeException("User account not found"));

                String role = user.getRole();

                if (role == null || role.isBlank()) {
                        throw new RuntimeException("User account has no valid role");
                }

                String token = jwtService.generateToken(
                                user.getEmail(),
                                role);

                return new LoginResponse(
                                token,
                                user.getName(),
                                user.getEmail(),
                                role);
        }

        // SEND PASSWORD RESET OTP
        public void sendPasswordResetOtp(String email) {
                email = email.trim().toLowerCase();

                /*
                 * Do not reveal whether an email is registered.
                 *
                 * If the account does not exist, simply return.
                 */

                if (!userRepository.existsByEmail(email)) {
                        return;
                }

                otpService.createPasswordResetOtp(email);
        }

        // RESET PASSWORD
        public void resetPassword(String email, String newPassword) {
                email = email.trim().toLowerCase();

                if (newPassword == null || newPassword.isBlank()) {
                        throw new RuntimeException("New password is required");
                }

                if (newPassword.length() < 6) {
                        throw new RuntimeException("Password must contain at least 6 characters");
                }

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Unable to reset password"));

                String encryptedPassword = passwordEncoder.encode(newPassword);

                user.setPassword(encryptedPassword);

                userRepository.save(user);
        }
}
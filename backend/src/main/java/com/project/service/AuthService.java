package com.project.service;

import com.project.dto.AuthRequest;
import com.project.dto.AuthResponse;
import com.project.dto.SocialAuthRequest;
import com.project.model.User;
import com.project.repository.UserRepository;
import com.project.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MailService mailService;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }

    public AuthResponse login(AuthRequest request) {
        // Support login with either username or email
        User user = userRepository.findByUsername(request.getUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("Invalid username or password")));

        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified! Please check your inbox.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

        // Update last login timestamp
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        final UserDetails userDetails = loadUserByUsername(user.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        return new AuthResponse(jwt, user.getUsername(), user.getRoles());
    }

    public AuthResponse socialLogin(SocialAuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(request.getEmail().split("@")[0] + "_" + request.getProvider());
            newUser.setEmail(request.getEmail());
            newUser.setName(request.getName());
            newUser.setPassword(passwordEncoder.encode("social_" + System.currentTimeMillis()));
            newUser.setVerified(true); // Social users are pre-verified
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_CUSTOMER");
            newUser.setRoles(roles);
            return userRepository.save(newUser);
        });

        final UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), new ArrayList<>());
        final String jwt = jwtUtil.generateToken(userDetails);
        return new AuthResponse(jwt, user.getUsername(), user.getRoles());
    }

    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setProvider("local");
        user.setCreatedAt(java.time.LocalDateTime.now());

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>(Collections.singletonList("ROLE_ADMIN")));
        }

        // Always set default subscription
        if (user.getSubscription() == null || user.getSubscription().isEmpty()) {
            user.setSubscription("FREE");
        }

        // Auto-verify if email service is not configured (dev mode)
        if (!mailService.isEmailConfigured()) {
            user.setVerified(true);
            return userRepository.save(user);
        }

        // Otherwise require email verification
        user.setVerified(false);
        user.setVerificationCode(mailService.generateOTP());
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));

        User savedUser = userRepository.save(user);
        try {
            mailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getVerificationCode());
        } catch (RuntimeException mailErr) {
            // Roll back the half-registered user so they can try again with a working address.
            userRepository.delete(savedUser);
            throw new RuntimeException(mailErr.getMessage());
        }
        return savedUser;
    }

    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isVerified()) {
            throw new RuntimeException("Account is already verified!");
        }

        if (user.getOtpExpiry() != null && java.time.LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired! Please request a new one.");
        }

        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
            user.setVerified(true);
            user.setVerificationCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid verification code!");
        }
    }

    public void resendCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationCode(mailService.generateOTP());
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        // Let exceptions bubble up so the user sees the real reason if Resend rejects the send.
        mailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElseThrow(() ->
                        new RuntimeException("User not found: " + username)));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void sendPasswordResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));
        String otp = mailService.generateOTP();
        user.setVerificationCode(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        // Propagate any Resend failure so the UI shows a real error.
        mailService.sendPasswordResetEmail(email, otp);
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOtpExpiry() != null && java.time.LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("Reset code has expired. Please request a new one.");
        }
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid reset code");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }
}

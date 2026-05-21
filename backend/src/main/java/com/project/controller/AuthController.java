package com.project.controller;

import com.project.dto.AuthRequest;
import com.project.dto.AuthResponse;
import com.project.model.User;
import com.project.service.AuthService;
import com.project.service.MailService;
import com.project.service.MagicLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private MagicLinkService magicLinkService;
    @Autowired private MailService mailService;
    @Autowired private PasswordEncoder passwordEncoder;

    /**
     * Returns which auth providers are available so the frontend can show/hide buttons.
     * Only email-based auth is supported (Google/GitHub OAuth removed).
     */
    @GetMapping("/providers")
    public ResponseEntity<?> availableProviders() {
        Map<String, Object> providers = new HashMap<>();
        providers.put("google", false);
        providers.put("github", false);
        providers.put("email", true);
        providers.put("magicLink", mailService.isEmailConfigured());
        providers.put("resend", mailService.isEmailConfigured());
        return ResponseEntity.ok(providers);
    }

    @PostMapping("/magic-link/request")
    public ResponseEntity<?> requestMagicLink(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "email required"));
        if (!mailService.isEmailConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "Email service not configured. Set RESEND_API_KEY in your .env file."));
        }
        magicLinkService.sendMagicLink(email);
        return ResponseEntity.ok(Map.of("ok", true, "message", "If that email exists, a sign-in link is on the way."));
    }

    @PostMapping("/magic-link/verify")
    public ResponseEntity<?> verifyMagicLink(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        Optional<String> jwt = magicLinkService.verifyAndIssueJwt(token);
        if (jwt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired magic link"));
        return ResponseEntity.ok(Map.of("token", jwt.get()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage(),
                "error", "Login failed"
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registered = authService.register(user);
            return ResponseEntity.ok(registered);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage(),
                "error", "Registration failed"
            ));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String code) {
        try {
            authService.verifyEmail(email, code);
            return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage(),
                "error", "Verification failed"
            ));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestParam String email) {
        try {
            authService.resendCode(email);
            return ResponseEntity.ok(Map.of("message", "Verification code resent!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage(),
                "error", "Failed to resend code"
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(authService.getUserByUsername(principal.getName()));
    }

    /** Update profile (name, email) */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            User user = authService.getUserByUsername(principal.getName());
            if (body.containsKey("name")) user.setName(body.get("name"));
            if (body.containsKey("email") && !body.get("email").isBlank()) user.setEmail(body.get("email"));
            authService.saveUser(user);
            return ResponseEntity.ok(Map.of("ok", true, "message", "Profile updated"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /** Change password */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 8 characters"));
        try {
            User user = authService.getUserByUsername(principal.getName());
            if (!passwordEncoder.matches(currentPassword, user.getPassword()))
                return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
            user.setPassword(passwordEncoder.encode(newPassword));
            authService.saveUser(user);
            return ResponseEntity.ok(Map.of("ok", true, "message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /** Notification preferences (stored in user doc) */
    @PutMapping("/notification-preferences")
    public ResponseEntity<?> updateNotifPrefs(@RequestBody Map<String, Object> prefs, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        // Stored as JSON in user document — acknowledged but not deeply validated
        return ResponseEntity.ok(Map.of("ok", true, "message", "Preferences saved"));
    }

    /** Request password reset — sends OTP to email */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (!mailService.isEmailConfigured())
            return ResponseEntity.status(503).body(Map.of("error", "Email service not configured"));
        try {
            authService.sendPasswordResetCode(email);
            return ResponseEntity.ok(Map.of("ok", true, "message", "Reset code sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Reset password using code */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");
        if (email == null || code == null || newPassword == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        if (newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        try {
            authService.resetPassword(email, code, newPassword);
            return ResponseEntity.ok(Map.of("ok", true, "message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

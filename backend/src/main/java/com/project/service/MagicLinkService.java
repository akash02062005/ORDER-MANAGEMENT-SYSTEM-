package com.project.service;

import com.project.model.User;
import com.project.repository.UserRepository;
import com.project.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Stateless magic-link login.
 *
 * Token format (URL-safe base64):
 *   base64( email + ":" + expiryEpochSec ) + "." + hmacSha256
 *
 * No DB writes required - we sign with a server secret. To single-use a token
 * we'd add a nonce to the User document (left as a follow-up).
 */
@Service
public class MagicLinkService {

    private static final Logger log = LoggerFactory.getLogger(MagicLinkService.class);

    @Value("${app.magic-link-secret}")
    private String secret;

    @Value("${app.magic-link-ttl-minutes:15}")
    private int ttlMinutes;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private JwtUtil jwtUtil;

    public void sendMagicLink(String email) {
        // Auto-provision: if user does not exist, create a stub so they can complete signup later.
        Optional<User> existing = userRepository.findByEmail(email);
        User user = existing.orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setUsername(email);
            u.setName(email.split("@")[0]);
            u.setPassword("magiclink_" + System.currentTimeMillis());
            u.setVerified(true);
            u.setProvider("magiclink");
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_CUSTOMER");
            u.setRoles(roles);
            return userRepository.save(u);
        });

        long expiry = Instant.now().getEpochSecond() + ttlMinutes * 60L;
        String token = sign(user.getEmail(), expiry);
        String link = frontendUrl + "/login?magic=" + token;

        log.info("Magic link generated for {} (valid {} min)", email, ttlMinutes);
        try {
            mailService.sendMagicLinkEmail(email, link, ttlMinutes);
        } catch (Exception e) {
            // Mail failures shouldn't 500 the request - the link will also be in logs for dev.
            log.warn("Could not send magic link email; printing link to logs instead: {}", link);
        }
    }

    public Optional<String> verifyAndIssueJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return Optional.empty();
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String sig = parts[1];

            String expectedSig = hmac(payload);
            if (!constantTimeEquals(expectedSig, sig)) {
                log.warn("Magic link signature mismatch");
                return Optional.empty();
            }

            String[] payloadParts = payload.split(":");
            if (payloadParts.length != 2) return Optional.empty();
            String email = payloadParts[0];
            long expiry = Long.parseLong(payloadParts[1]);
            if (Instant.now().getEpochSecond() > expiry) {
                log.warn("Magic link expired for {}", email);
                return Optional.empty();
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) return Optional.empty();

            UserDetails ud = new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPassword(), new ArrayList<>());
            return Optional.of(jwtUtil.generateToken(ud));
        } catch (Exception e) {
            log.warn("Magic link verification error", e);
            return Optional.empty();
        }
    }

    private String sign(String email, long expiry) {
        String payload = email + ":" + expiry;
        String b64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return b64 + "." + hmac(payload);
    }

    private String hmac(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC failure", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}

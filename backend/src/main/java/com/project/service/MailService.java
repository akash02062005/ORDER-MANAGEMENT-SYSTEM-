package com.project.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Random;

/**
 * Email service with two delivery strategies (tried in order):
 *   1. Resend API (recommended — free, no SMTP setup needed, just set RESEND_API_KEY)
 *   2. Console fallback (prints OTP/link to server logs for local dev)
 *
 * SMTP has been removed. All emails go through Resend HTTP API.
 * Get your free API key at https://resend.com/signup
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:OrderStream <onboarding@resend.dev>}")
    private String resendFromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    /**
     * Returns true if Resend is configured and ready to send.
     */
    public boolean isEmailConfigured() {
        return resendApiKey != null && !resendApiKey.isBlank();
    }

    public boolean sendVerificationEmail(String toEmail, String code) {
        String subject = "Your OrderStream Verification Code";
        String body = "Welcome to OrderStream!\n\n" +
                "Your 6-digit verification code is: " + code + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.";

        String htmlBody = "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px\">" +
                "<h2 style=\"color:#4f46e5\">OrderStream</h2>" +
                "<p>Welcome! Your 6-digit verification code is:</p>" +
                "<div style=\"background:#f5f3ff;border-radius:12px;padding:20px;text-align:center;margin:16px 0\">" +
                "<span style=\"font-size:32px;font-weight:800;letter-spacing:8px;color:#4f46e5\">" + code + "</span>" +
                "</div>" +
                "<p style=\"color:#6b7280;font-size:14px\">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>" +
                "</div>";

        if (sendViaResend(toEmail, subject, body, htmlBody)) return true;
        logOtpFallback(toEmail, code);
        return false;
    }

    public boolean sendMagicLinkEmail(String toEmail, String link, int ttlMinutes) {
        String subject = "Your OrderStream sign-in link";
        String body = "Hello!\n\nClick the link below to sign in to OrderStream:\n\n" +
                link + "\n\nThis link expires in " + ttlMinutes + " minutes.\n\n" +
                "If you did not request this, please ignore this email.";

        String htmlBody = "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px\">" +
                "<h2 style=\"color:#4f46e5\">OrderStream</h2>" +
                "<p>Click the button below to sign in:</p>" +
                "<div style=\"text-align:center;margin:24px 0\">" +
                "<a href=\"" + link + "\" style=\"display:inline-block;background:#4f46e5;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px\">Sign In to OrderStream</a>" +
                "</div>" +
                "<p style=\"color:#6b7280;font-size:13px\">Or copy this link: <br/><a href=\"" + link + "\">" + link + "</a></p>" +
                "<p style=\"color:#9ca3af;font-size:12px\">This link expires in " + ttlMinutes + " minutes.</p>" +
                "</div>";

        if (sendViaResend(toEmail, subject, body, htmlBody)) return true;

        log.warn("EMAIL NOT CONFIGURED — Magic link printed to logs");
        System.out.println("\n╔══════════════════════════════════════╗");
        System.out.println("║  EMAIL NOT CONFIGURED — MAGIC LINK   ║");
        System.out.println("╠══════════════════════════════════════╣");
        System.out.println("  To:   " + toEmail);
        System.out.println("  Link: " + link);
        System.out.println("╚══════════════════════════════════════╝\n");
        return false;
    }

    /**
     * Send email via Resend HTTP API (https://resend.com).
     * Free tier: 100 emails/day, no SMTP config needed.
     * Just set RESEND_API_KEY in your .env file.
     */
    private boolean sendViaResend(String to, String subject, String textBody, String htmlBody) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY not set — cannot send email to {}", to);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> payload = Map.of(
                    "from", resendFromEmail,
                    "to", new String[]{to},
                    "subject", subject,
                    "html", htmlBody != null ? htmlBody : textBody,
                    "text", textBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails", request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent via Resend to: {}", to);
                return true;
            } else {
                log.warn("Resend API returned {}: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.warn("Resend API failed for {}: {}", to, e.getMessage());
            return false;
        }
    }

    public boolean sendPasswordResetEmail(String toEmail, String code) {
        String subject = "OrderStream Password Reset Code";
        String body = "Your password reset code is: " + code + "\n\nThis code expires in 10 minutes.";

        String htmlBody = "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px\">" +
                "<h2 style=\"color:#4f46e5\">OrderStream</h2>" +
                "<p>You requested a password reset. Your code is:</p>" +
                "<div style=\"background:#f5f3ff;border-radius:12px;padding:20px;text-align:center;margin:16px 0\">" +
                "<span style=\"font-size:32px;font-weight:800;letter-spacing:8px;color:#4f46e5\">" + code + "</span>" +
                "</div>" +
                "<p style=\"color:#6b7280;font-size:14px\">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>" +
                "</div>";

        if (sendViaResend(toEmail, subject, body, htmlBody)) return true;
        logOtpFallback(toEmail, code);
        return false;
    }

    private void logOtpFallback(String toEmail, String code) {
        log.warn("EMAIL NOT CONFIGURED — OTP printed to logs. Set RESEND_API_KEY for instant email delivery.");
        System.out.println("\n╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║  EMAIL NOT CONFIGURED — OTP FALLBACK                        ║");
        System.out.println("║  Set RESEND_API_KEY in .env for instant email delivery       ║");
        System.out.println("║  Get free key at: https://resend.com/signup                  ║");
        System.out.println("╠══════════════════════════════════════════════════════════════╣");
        System.out.println("  To:   " + toEmail);
        System.out.println("  OTP:  " + code);
        System.out.println("╚══════════════════════════════════════════════════════════════╝\n");
    }
}

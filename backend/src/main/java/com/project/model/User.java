package com.project.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String email;
    private String name;
    private Set<String> roles;
    private boolean verified;

    @JsonIgnore
    private String verificationCode;

    @JsonIgnore
    private LocalDateTime otpExpiry;

    private String provider; // local, google, github
    private String subscription; // FREE, PREMIUM, PRO
    private String language; // en, hi, etc.
    private String organizationId;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean onboardingComplete;
}

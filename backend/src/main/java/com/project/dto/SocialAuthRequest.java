package com.project.dto;

import lombok.Data;

@Data
public class SocialAuthRequest {
    private String email;
    private String name;
    private String provider; // "google" or "github"
    private String imageUrl;
}

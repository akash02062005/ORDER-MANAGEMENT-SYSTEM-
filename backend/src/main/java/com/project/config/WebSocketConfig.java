package com.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Allow localhost dev + any *.onrender.com deployment + an explicit APP_FRONTEND_URL.
        // setAllowedOriginPatterns supports wildcards (setAllowedOrigins does not).
        java.util.List<String> patterns = new java.util.ArrayList<>(java.util.Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "https://*.onrender.com"
        ));
        String frontend = System.getenv("APP_FRONTEND_URL");
        if (frontend != null && !frontend.isBlank()) {
            patterns.add(frontend.replaceAll("/+$", ""));
        }
        String[] origins = patterns.toArray(new String[0]);

        registry.addEndpoint("/ws").setAllowedOriginPatterns(origins).withSockJS();
        registry.addEndpoint("/ws").setAllowedOriginPatterns(origins); // raw STOMP
    }
}

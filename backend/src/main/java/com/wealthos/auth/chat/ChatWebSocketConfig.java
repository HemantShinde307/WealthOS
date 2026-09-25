package com.wealthos.auth.chat;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class ChatWebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler handler;
    private final String[] allowedOrigins;

    public ChatWebSocketConfig(ChatWebSocketHandler handler, @Value("${app.cors.allowed-origin}") String allowedOrigin) {
        this.handler = handler;
        // Same allow-list as the REST CORS config, so a page on any other origin cannot open the socket.
        this.allowedOrigins = Arrays.stream(allowedOrigin.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/chat").setAllowedOrigins(allowedOrigins);
    }
}

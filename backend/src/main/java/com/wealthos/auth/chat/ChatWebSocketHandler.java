package com.wealthos.auth.chat;

import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.security.JwtService;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Live side of the chat. A socket is useless until its first frame is {"type":"auth","token":...}
 * carrying a valid token (sent in a frame, never in the URL, so it cannot leak into access logs).
 */
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    static final CloseStatus UNAUTHORIZED = new CloseStatus(4401, "Unauthorized");
    private static final int MAX_FRAME_CHARS = 8192;
    private static final long AUTH_DEADLINE_SECONDS = 5;

    private record Client(ConcurrentWebSocketSessionDecorator session, AuthPrincipal principal, String userKey) {
    }

    private final JwtService jwt;
    private final ChatService chat;
    private final ChatSessionRegistry registry;
    private final ObjectMapper json;

    private final Map<String, Client> authenticated = new ConcurrentHashMap<>();
    private final Map<String, ConcurrentWebSocketSessionDecorator> pending = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "chat-auth-deadline");
        t.setDaemon(true);
        return t;
    });

    public ChatWebSocketHandler(JwtService jwt, ChatService chat, ChatSessionRegistry registry, ObjectMapper json) {
        this.jwt = jwt;
        this.chat = chat;
        this.registry = registry;
        this.json = json;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession raw) {
        // Serialises concurrent sends on one socket (a WebSocketSession is not thread-safe).
        ConcurrentWebSocketSessionDecorator session = new ConcurrentWebSocketSessionDecorator(raw, 5_000, 256 * 1024);
        pending.put(raw.getId(), session);
        scheduler.schedule(() -> {
            if (pending.remove(raw.getId()) != null) {
                closeQuietly(session, UNAUTHORIZED);
            }
        }, AUTH_DEADLINE_SECONDS, TimeUnit.SECONDS);
    }

    @Override
    protected void handleTextMessage(WebSocketSession raw, TextMessage message) {
        String payload = message.getPayload();
        if (payload.length() > MAX_FRAME_CHARS) {
            closeQuietly(raw, CloseStatus.TOO_BIG_TO_PROCESS);
            return;
        }
        JsonNode node;
        try {
            node = json.readTree(payload);
        } catch (RuntimeException e) {
            closeQuietly(raw, CloseStatus.BAD_DATA);
            return;
        }
        String type = text(node, "type");

        Client client = authenticated.get(raw.getId());
        if (client == null) {
            authenticate(raw, type, node);
            return;
        }
        try {
            switch (type == null ? "" : type) {
                case "send" -> chat.send(client.principal(), text(node, "customerId"), text(node, "text"), text(node, "clientId"), client.session());
                case "read" -> chat.markRead(client.principal(), text(node, "customerId"));
                case "ping" -> registry.send(client.session(), "{\"type\":\"pong\"}");
                default -> registry.send(client.session(), chat.errorFrame("Unknown message type."));
            }
        } catch (ChatException e) {
            registry.send(client.session(), chat.errorFrame(e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Chat socket handler failed", e);
            registry.send(client.session(), chat.errorFrame("Something went wrong. Please try again."));
        }
    }

    private void authenticate(WebSocketSession raw, String type, JsonNode node) {
        ConcurrentWebSocketSessionDecorator session = pending.remove(raw.getId());
        if (session == null) {
            closeQuietly(raw, UNAUTHORIZED);
            return;
        }
        Optional<AuthPrincipal> principal = "auth".equals(type) ? jwt.verify(text(node, "token")) : Optional.empty();
        if (principal.isEmpty() || !(principal.get().isAdvisor() || principal.get().isInvestor())) {
            closeQuietly(session, UNAUTHORIZED);
            return;
        }
        AuthPrincipal p = principal.get();
        ChatSenderRole role = p.isAdvisor() ? ChatSenderRole.ADVISOR : ChatSenderRole.INVESTOR;
        String userKey = ChatSessionRegistry.key(role, p.code());
        authenticated.put(raw.getId(), new Client(session, p, userKey));

        boolean firstSocket = registry.register(userKey, session);
        registry.send(session, "{\"type\":\"ready\",\"role\":\"" + role + "\",\"code\":" + json.writeValueAsString(p.code()) + "}");
        chat.initialPresenceEvents(p).forEach(event -> registry.send(session, event));
        if (firstSocket) {
            chat.announcePresence(p, true);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession raw, CloseStatus status) {
        pending.remove(raw.getId());
        Client client = authenticated.remove(raw.getId());
        if (client != null && registry.unregister(client.userKey(), client.session())) {
            chat.announcePresence(client.principal(), false);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession raw, Throwable exception) {
        closeQuietly(raw, CloseStatus.SERVER_ERROR);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() || !value.isString() ? null : value.asString();
    }

    private static void closeQuietly(WebSocketSession session, CloseStatus status) {
        try {
            session.close(status);
        } catch (IOException | RuntimeException ignored) {
            // already closed
        }
    }
}

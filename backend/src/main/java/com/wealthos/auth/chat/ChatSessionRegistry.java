package com.wealthos.auth.chat;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

/** Tracks the live (already authenticated) sockets per user and pushes events to them. */
@Component
public class ChatSessionRegistry {

    private static final Logger log = LoggerFactory.getLogger(ChatSessionRegistry.class);

    private final Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    public static String key(ChatSenderRole role, String code) {
        return role + ":" + code;
    }

    /** @return true when this is the user's first live socket (they just came online). */
    public boolean register(String userKey, WebSocketSession session) {
        Set<WebSocketSession> set = sessions.computeIfAbsent(userKey, k -> new CopyOnWriteArraySet<>());
        boolean first = set.isEmpty();
        set.add(session);
        return first;
    }

    /** @return true when that was the user's last live socket (they just went offline). */
    public boolean unregister(String userKey, WebSocketSession session) {
        Set<WebSocketSession> set = sessions.get(userKey);
        if (set == null) {
            return false;
        }
        set.remove(session);
        if (set.isEmpty()) {
            sessions.remove(userKey, set);
            return true;
        }
        return false;
    }

    public boolean isOnline(ChatSenderRole role, String code) {
        Set<WebSocketSession> set = sessions.get(key(role, code));
        return set != null && !set.isEmpty();
    }

    public void push(String userKey, String json) {
        Set<WebSocketSession> set = sessions.get(userKey);
        if (set == null) {
            return;
        }
        for (WebSocketSession s : set) {
            send(s, json);
        }
    }

    /** Sends {@code plainJson} to every socket of both users, but {@code originJson} to the socket that sent the message. */
    public void pushMessage(String keyA, String keyB, String plainJson, WebSocketSession origin, String originJson) {
        for (String k : new String[] {keyA, keyB}) {
            Set<WebSocketSession> set = sessions.get(k);
            if (set == null) {
                continue;
            }
            for (WebSocketSession s : set) {
                send(s, s == origin ? originJson : plainJson);
            }
        }
    }

    public void send(WebSocketSession session, String json) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException | RuntimeException e) {
            // A slow or broken client must never affect anyone else; drop it.
            log.debug("Dropping chat socket after send failure: {}", e.getMessage());
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException | RuntimeException ignored) {
                // already closed
            }
        }
    }
}

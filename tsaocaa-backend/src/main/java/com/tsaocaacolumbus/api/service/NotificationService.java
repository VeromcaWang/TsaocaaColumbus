package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final SnsClient snsClient;

    @Value("${app.sns.topic-arn}")
    private String topicArn;

    @Transactional
    public void registerDeviceToken(Long userId, String pushToken) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setPushToken(pushToken);
            userRepository.save(user);
        });
    }

    /**
     * Broadcast a push notification to all users with registered push tokens.
     * In MVP this sends an SNS message. For production, migrate to Expo push API
     * or AWS Pinpoint for per-device targeting.
     */
    public int sendToAll(String title, String body) {
        String message = buildPushMessage(title, body);

        try {
            snsClient.publish(PublishRequest.builder()
                .topicArn(topicArn)
                .subject(title)
                .message(message)
                .build());
            log.info("Push notification sent via SNS: {}", title);
        } catch (Exception e) {
            log.error("Failed to send SNS notification", e);
        }

        // Return count of users who have push tokens registered
        List<User> usersWithTokens = userRepository.findAll().stream()
            .filter(u -> u.getPushToken() != null && !u.getPushToken().isBlank())
            .toList();
        return usersWithTokens.size();
    }

    private String buildPushMessage(String title, String body) {
        return """
            {
                "notification": {
                    "title": "%s",
                    "body": "%s"
                }
            }
            """.formatted(title.replace("\"", "\\\""), body.replace("\"", "\\\""));
    }
}

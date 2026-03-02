package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.GameConfigResponse;
import com.tsaocaacolumbus.api.model.dto.GamePlayResponse;
import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.service.GameService;
import com.tsaocaacolumbus.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final UserService userService;

    @GetMapping("/config")
    public ResponseEntity<GameConfigResponse> getConfig() {
        return ResponseEntity.ok(gameService.getGameConfig());
    }

    @PostMapping("/play")
    public ResponseEntity<GamePlayResponse> play(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) Map<String, String> body) {
        User user = userService.findByJwt(jwt);
        String gameType = body != null ? body.getOrDefault("gameType", "SPIN_WHEEL") : "SPIN_WHEEL";
        return ResponseEntity.ok(gameService.play(user.getId(), gameType));
    }
}

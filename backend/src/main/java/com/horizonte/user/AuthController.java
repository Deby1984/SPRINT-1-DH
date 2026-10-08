package com.horizonte.user;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService service;
    public AuthController(UserService service) { this.service = service; }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request, HttpSession session) { AppUser user = service.register(request); signIn(session, user); return UserResponse.from(user); }
    @PostMapping("/login") public UserResponse login(@Valid @RequestBody LoginRequest request, HttpSession session) { AppUser user = service.authenticate(request); signIn(session, user); return UserResponse.from(user); }
    @GetMapping("/me") public UserResponse me(HttpSession session) { return UserResponse.from(service.get(SessionUser.requireAuthenticated(session))); }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(HttpSession session) { session.invalidate(); }
    private void signIn(HttpSession session, AppUser user) { session.setAttribute(SessionUser.USER_ID, user.getId()); session.setAttribute(SessionUser.ROLE, user.getRole().name()); }
}

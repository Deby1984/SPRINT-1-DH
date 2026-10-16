package com.horizonte.user;
import com.horizonte.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService service;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    public AuthController(UserService service, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.service = service; this.jwtService = jwtService; this.authenticationManager = authenticationManager;
    }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) { return response(service.register(request)); }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
            return response(service.getByEmail(request.email()));
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("El correo o la contraseña no son correctos.");
        }
    }
    @GetMapping("/me") public UserResponse me(Authentication authentication) { return UserResponse.from(service.getByEmail(authentication.getName())); }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout() { }
    private AuthResponse response(AppUser user) { return new AuthResponse(jwtService.generate(user), UserResponse.from(user)); }
}

package com.horizonte.user;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {
    private final UserService service;
    public UserAdminController(UserService service) { this.service = service; }
    @GetMapping public List<UserResponse> list() { return service.list().stream().map(UserResponse::from).toList(); }
    @PatchMapping("/{id}/role") public UserResponse changeRole(@PathVariable Long id, @Valid @RequestBody RoleRequest request, Authentication authentication) {
        Long actingUser = service.getByEmail(authentication.getName()).getId();
        AppUser user = service.changeRole(id, request.role(), actingUser);
        return UserResponse.from(user);
    }
}

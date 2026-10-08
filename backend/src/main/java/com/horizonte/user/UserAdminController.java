package com.horizonte.user;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {
    private final UserService service;
    private final UserRepository users;
    public UserAdminController(UserService service, UserRepository users) { this.service = service; this.users = users; }
    @GetMapping public List<UserResponse> list(HttpSession session) { SessionUser.requireAdmin(session, users); return service.list().stream().map(UserResponse::from).toList(); }
    @PatchMapping("/{id}/role") public UserResponse changeRole(@PathVariable Long id, @Valid @RequestBody RoleRequest request, HttpSession session) {
        Long actingUser = SessionUser.requireAdmin(session, users); AppUser user = service.changeRole(id, request.role(), actingUser);
        if (id.equals(actingUser)) session.setAttribute(SessionUser.ROLE, user.getRole().name());
        return UserResponse.from(user);
    }
}

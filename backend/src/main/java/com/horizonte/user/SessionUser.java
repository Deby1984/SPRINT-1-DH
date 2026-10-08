package com.horizonte.user;
import jakarta.servlet.http.HttpSession;

public final class SessionUser {
    public static final String USER_ID = "userId";
    public static final String ROLE = "role";
    private SessionUser() { }
    public static Long requireAuthenticated(HttpSession session) {
        Object id = session.getAttribute(USER_ID);
        if (!(id instanceof Long userId)) throw new UnauthorizedException("Debés iniciar sesión para continuar.");
        return userId;
    }
    public static Long requireAdmin(HttpSession session, UserRepository users) {
        Long id = requireAuthenticated(session);
        AppUser user = users.findById(id).orElseThrow(() -> new UnauthorizedException("La sesión ya no es válida."));
        if (user.getRole() != Role.ADMIN) throw new ForbiddenException("No tenés permisos de administrador.");
        return id;
    }
}

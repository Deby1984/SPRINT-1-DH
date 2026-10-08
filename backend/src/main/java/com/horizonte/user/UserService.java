package com.horizonte.user;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserService {
    private final UserRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    public UserService(UserRepository repository) { this.repository = repository; }

    @Transactional public AppUser register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        AppUser user = new AppUser();
        user.setFirstName(request.firstName().trim()); user.setLastName(request.lastName().trim()); user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password())); user.setRole(Role.USER);
        return repository.save(user);
    }
    public AppUser authenticate(LoginRequest request) {
        AppUser user = repository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("El correo o la contraseña no son correctos."));
        if (!encoder.matches(request.password(), user.getPasswordHash())) throw new UnauthorizedException("El correo o la contraseña no son correctos.");
        return user;
    }
    public AppUser get(Long id) { return repository.findById(id).orElseThrow(() -> new UnauthorizedException("La sesión ya no es válida.")); }
    public List<AppUser> list() { return repository.findAll(Sort.by("lastName", "firstName")); }
    @Transactional public AppUser changeRole(Long id, Role role, Long actingUserId) {
        AppUser user = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));
        if (id.equals(actingUserId) && role != Role.ADMIN) throw new IllegalArgumentException("No podés quitarte tu propio permiso de administrador.");
        user.setRole(role); return user;
    }
    public String encode(String password) { return encoder.encode(password); }
}

package com.horizonte.user;

import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Test void registersNewUsersWithUserRoleAndEncryptedPassword() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));
        UserService service = new UserService(repository);
        AppUser user = service.register(new RegisterRequest("Ana", "Pérez", "ANA@MAIL.COM", "segura123"));
        assertEquals(Role.USER, user.getRole());
        assertEquals("ana@mail.com", user.getEmail());
        assertNotEquals("segura123", user.getPasswordHash());
    }

    @Test void rejectsDuplicatedEmail() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.existsByEmailIgnoreCase("ana@mail.com")).thenReturn(true);
        UserService service = new UserService(repository);
        assertThrows(IllegalArgumentException.class, () -> service.register(new RegisterRequest("Ana", "Pérez", "ana@mail.com", "segura123")));
    }

    @Test void rejectsInvalidCredentialsWithAUniformMessage() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.findByEmailIgnoreCase("ana@mail.com")).thenReturn(Optional.empty());
        UserService service = new UserService(repository);
        UnauthorizedException error = assertThrows(UnauthorizedException.class, () -> service.authenticate(new LoginRequest("ana@mail.com", "incorrecta")));
        assertEquals("El correo o la contraseña no son correctos.", error.getMessage());
    }
}

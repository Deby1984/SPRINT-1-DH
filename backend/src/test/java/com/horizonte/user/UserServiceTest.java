package com.horizonte.user;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Test void registersNewUsersWithUserRoleAndEncryptedPassword() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));
        UserService service = new UserService(repository, new BCryptPasswordEncoder());
        AppUser user = service.register(new RegisterRequest("Ana", "Pérez", "ANA@MAIL.COM", "segura123"));
        assertEquals(Role.USER, user.getRole());
        assertEquals("ana@mail.com", user.getEmail());
        assertNotEquals("segura123", user.getPasswordHash());
    }

    @Test void rejectsDuplicatedEmail() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.existsByEmailIgnoreCase("ana@mail.com")).thenReturn(true);
        UserService service = new UserService(repository, new BCryptPasswordEncoder());
        assertThrows(IllegalArgumentException.class, () -> service.register(new RegisterRequest("Ana", "Pérez", "ana@mail.com", "segura123")));
    }

    @Test void reportsWhenAuthenticatedUserNoLongerExists() {
        UserRepository repository = mock(UserRepository.class);
        UserService service = new UserService(repository, new BCryptPasswordEncoder());
        assertThrows(UnauthorizedException.class, () -> service.getByEmail("ana@mail.com"));
    }
}

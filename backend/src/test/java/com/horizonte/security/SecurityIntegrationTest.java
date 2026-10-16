package com.horizonte.security;

import com.horizonte.user.AppUser;
import com.horizonte.user.Role;
import com.horizonte.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:security-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=una-clave-de-prueba-segura-de-por-lo-menos-32-caracteres"
})
@AutoConfigureMockMvc
@Transactional
class SecurityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwt;
    private AppUser admin;
    private AppUser regular;

    @BeforeEach void setUp() {
        admin = save("admin-test@horizonte.com", Role.ADMIN);
        regular = save("user-test@horizonte.com", Role.USER);
    }

    @Test void publicCatalogDoesNotRequireAuthentication() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test void administrativeEndpointsRejectAnonymousAndRegularUsers() throws Exception {
        String body = "{\"title\":\"Nueva\",\"description\":\"Descripción\",\"imageUrl\":\"https://example.com/image.jpg\"}";
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/categories").header("Authorization", "Bearer " + jwt.generate(regular)).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test void administratorCanUseProtectedEndpointsWithBearerToken() throws Exception {
        mvc.perform(get("/api/users").header("Authorization", "Bearer " + jwt.generate(admin)))
                .andExpect(status().isOk());
        mvc.perform(post("/api/categories").header("Authorization", "Bearer " + jwt.generate(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Categoría segura\",\"description\":\"Creada con JWT\",\"imageUrl\":\"https://example.com/secure.jpg\"}"))
                .andExpect(status().isCreated());
    }

    @Test void loginIsHandledBySpringSecurityAndReturnsAJwt() throws Exception {
        var result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("USER")).andReturn();
        assertNull(result.getRequest().getSession(false));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());
    }

    private AppUser save(String email, Role role) {
        AppUser user = users.findByEmailIgnoreCase(email).orElseGet(AppUser::new);
        user.setFirstName("Prueba"); user.setLastName(role.name()); user.setEmail(email);
        user.setPasswordHash(encoder.encode("Password123!")); user.setRole(role);
        return users.save(user);
    }
}

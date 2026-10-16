package com.horizonte.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.horizonte.category.CategoryRepository;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:security-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=una-clave-de-prueba-segura-de-por-lo-menos-32-caracteres"
})
@AutoConfigureMockMvc
@Transactional
class SecurityIntegrationTest {
    private static final String JWT_SECRET = "una-clave-de-prueba-segura-de-por-lo-menos-32-caracteres";
    private static final String CATEGORY_BODY = "{\"title\":\"Nueva\",\"description\":\"Descripción\",\"imageUrl\":\"https://example.com/image.jpg\"}";
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper objectMapper;
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
        String regularToken = jwt.generate(regular);

        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON).content(CATEGORY_BODY))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/categories/999999").contentType(MediaType.APPLICATION_JSON).content(CATEGORY_BODY))
                .andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/categories/999999"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/categories").header("Authorization", bearer(regularToken)).contentType(MediaType.APPLICATION_JSON).content(CATEGORY_BODY))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/categories/999999").header("Authorization", bearer(regularToken)).contentType(MediaType.APPLICATION_JSON).content(CATEGORY_BODY))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/categories/999999").header("Authorization", bearer(regularToken)))
                .andExpect(status().isForbidden());
    }

    @Test void administratorCanCreateUpdateAndDeleteWithBearerToken() throws Exception {
        String adminToken = jwt.generate(admin);
        mvc.perform(get("/api/users").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());

        mvc.perform(post("/api/categories").header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Categoría segura\",\"description\":\"Creada con JWT\",\"imageUrl\":\"https://example.com/secure.jpg\"}"))
                .andExpect(status().isCreated());

        Long categoryId = categories.findByTitleIgnoreCase("Categoría segura").orElseThrow().getId();
        mvc.perform(put("/api/categories/{id}", categoryId).header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Categoría actualizada\",\"description\":\"Actualizada con JWT\",\"imageUrl\":\"https://example.com/updated.jpg\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Categoría actualizada"));
        mvc.perform(delete("/api/categories/{id}", categoryId).header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());
    }

    @Test void loginIsHandledBySpringSecurityAndReturnsAJwt() throws Exception {
        var result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("USER")).andReturn();
        assertNull(result.getRequest().getSession(false));
        assertNull(result.getResponse().getCookie("JSESSIONID"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void alteredAndExpiredTokensAreRejected() throws Exception {
        String alteredToken = jwt.generate(regular) + "alterado";
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(alteredToken)))
                .andExpect(status().isUnauthorized());

        JwtService expiredJwtService = new JwtService(JWT_SECRET, -1);
        String expiredToken = expiredJwtService.generate(regular);
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(expiredToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test void logoutImmediatelyAndPersistentlyInvalidatesPreviousTokens() throws Exception {
        var login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();
        long previousVersion = regular.getTokenVersion();

        var logout = mvc.perform(post("/api/auth/logout").header("Authorization", bearer(token)))
                .andExpect(status().isNoContent())
                .andReturn();
        assertNull(logout.getRequest().getSession(false));
        assertNull(logout.getResponse().getCookie("JSESSIONID"));
        assertEquals(previousVersion + 1, users.findById(regular.getId()).orElseThrow().getTokenVersion());

        mvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());

        var newLogin = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user-test@horizonte.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String renewedToken = objectMapper.readTree(newLogin.getResponse().getContentAsString()).get("token").asText();
        assertNotEquals(token, renewedToken);
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(renewedToken)))
                .andExpect(status().isOk());
    }

    @Test void h2ConsoleIsNotPubliclyAccessible() throws Exception {
        mvc.perform(get("/h2-console/"))
                .andExpect(status().isUnauthorized());
    }

    private AppUser save(String email, Role role) {
        AppUser user = users.findByEmailIgnoreCase(email).orElseGet(AppUser::new);
        user.setFirstName("Prueba"); user.setLastName(role.name()); user.setEmail(email);
        user.setPasswordHash(encoder.encode("Password123!")); user.setRole(role);
        return users.save(user);
    }

    private String bearer(String token) { return "Bearer " + token; }
}

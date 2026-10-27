package com.horizonte.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.horizonte.category.CategoryRepository;
import com.horizonte.category.Category;
import com.horizonte.favorite.FavoriteRepository;
import com.horizonte.product.Product;
import com.horizonte.product.ProductRepository;
import com.horizonte.reservation.Reservation;
import com.horizonte.reservation.ReservationRepository;
import com.horizonte.review.ReviewRepository;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
    @Autowired ProductRepository products;
    @Autowired ReservationRepository reservations;
    @Autowired FavoriteRepository favorites;
    @Autowired ReviewRepository reviews;
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

    @Test void invalidCategoryFieldsReturnSpecificValidationErrors() throws Exception {
        String adminToken = jwt.generate(admin);

        mvc.perform(post("/api/categories").header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"   \",\"description\":\"  \",\"imageUrl\":\"javascript:alert(1)\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Hay datos inválidos en la solicitud."))
                .andExpect(jsonPath("$.fieldErrors.title").value("El título es obligatorio."))
                .andExpect(jsonPath("$.fieldErrors.description").value("La descripción es obligatoria."))
                .andExpect(jsonPath("$.fieldErrors.imageUrl").value("La URL de la imagen debe ser una dirección HTTP o HTTPS válida."));
    }

    @Test void invalidProductFieldsReturnSpecificValidationErrors() throws Exception {
        String adminToken = jwt.generate(admin);
        MockMultipartFile image = new MockMultipartFile(
                "images", "alojamiento.jpg", MediaType.IMAGE_JPEG_VALUE, "imagen".getBytes());

        mvc.perform(multipart("/api/products").file(image)
                        .header("Authorization", bearer(adminToken))
                        .param("name", "   ")
                        .param("description", "  ")
                        .param("categoryId", "1")
                        .param("city", "\t")
                        .param("price", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("El nombre es obligatorio."))
                .andExpect(jsonPath("$.fieldErrors.description").value("La descripción es obligatoria."))
                .andExpect(jsonPath("$.fieldErrors.city").value("La ciudad es obligatoria."))
                .andExpect(jsonPath("$.fieldErrors.price").value("El precio debe ser de al menos 0,01."))
                .andExpect(jsonPath("$.fieldErrors.characteristicIds").value("Seleccioná al menos una característica."));
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

    @Test void searchExcludesReservedProductsAndAvailabilityPublishesOccupiedRanges() throws Exception {
        Product product = saveProduct("Búsqueda Sprint 3", "Neuquén");
        LocalDate checkIn = LocalDate.now().plusDays(20);
        LocalDate checkOut = checkIn.plusDays(3);
        saveReservation(product, regular, checkIn, checkOut);
        saveReservation(product, admin, checkOut.plusDays(4), checkOut.plusDays(6));

        mvc.perform(get("/api/products/{id}/availability", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(product.getId()))
                .andExpect(jsonPath("$.occupiedRanges[0].checkIn").value(checkIn.toString()))
                .andExpect(jsonPath("$.occupiedRanges[0].checkOut").value(checkOut.toString()))
                .andExpect(jsonPath("$.occupiedRanges.length()").value(2));

        var result = mvc.perform(get("/api/products/search")
                        .param("city", "Neuquén")
                        .param("checkIn", checkIn.plusDays(1).toString())
                        .param("checkOut", checkOut.plusDays(1).toString()))
                .andExpect(status().isOk())
                .andReturn();
        var found = objectMapper.readTree(result.getResponse().getContentAsString());
        assertFalse(found.findValuesAsText("id").contains(product.getId().toString()));

        mvc.perform(get("/api/products/search")
                        .param("city", "Neuquén")
                        .param("checkIn", checkOut.toString())
                        .param("checkOut", checkOut.plusDays(2).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(product.getId()));
    }

    @Test void authenticatedUserCanReserveAndOverlappingReservationIsRejected() throws Exception {
        Product product = saveProduct("Reserva Sprint 3", "Rosario");
        LocalDate checkIn = LocalDate.now().plusDays(30);
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "productId", product.getId(), "checkIn", checkIn, "checkOut", checkIn.plusDays(2)));

        mvc.perform(post("/api/reservations").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/reservations").header("Authorization", bearer(jwt.generate(regular)))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("UPCOMING"));
        mvc.perform(post("/api/reservations").header("Authorization", bearer(jwt.generate(regular)))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El alojamiento ya está reservado para alguna de las fechas seleccionadas."));
    }

    @Test void favoritesArePrivateIdempotentAndCanBeRemovedImmediately() throws Exception {
        Product product = saveProduct("Favorito Sprint 3", "Paraná");
        String token = jwt.generate(regular);

        mvc.perform(put("/api/favorites/{id}", product.getId()))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/favorites/{id}", product.getId()).header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(put("/api/favorites/{id}", product.getId()).header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        assertTrue(favorites.existsByUserIdAndProductId(regular.getId(), product.getId()));
        assertEquals(1, favorites.findAllByUserIdOrderByCreatedAtDesc(regular.getId()).stream()
                .filter(item -> item.getProduct().getId().equals(product.getId())).count());

        mvc.perform(delete("/api/favorites/{id}", product.getId()).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
        assertFalse(favorites.existsByUserIdAndProductId(regular.getId(), product.getId()));
    }

    @Test void onlyACompletedStayCanCreateOneReviewAndTheAverageIsUpdated() throws Exception {
        Product product = saveProduct("Valoración Sprint 3", "San Juan");
        String token = jwt.generate(regular);
        String reviewBody = objectMapper.writeValueAsString(java.util.Map.of(
                "productId", product.getId(), "rating", 5, "comment", "Excelente estadía"));

        mvc.perform(post("/api/reviews").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody))
                .andExpect(status().isForbidden());

        saveReservation(product, regular, LocalDate.now().minusDays(5), LocalDate.now().minusDays(2));
        mvc.perform(post("/api/reviews").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.userName").value("Prueba USER"));
        mvc.perform(post("/api/reviews").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/products/{id}/reviews", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(5.0))
                .andExpect(jsonPath("$.reviewCount").value(1));
        assertEquals(1, reviews.findAllByProductIdOrderByCreatedAtDesc(product.getId()).size());
    }

    @Test void categoryDeletionNamesConflictsAndReturnsNotFoundForUnknownIds() throws Exception {
        String token = jwt.generate(admin);
        Category free = new Category();
        free.setTitle("Categoría libre Sprint 3");
        free.setDescription("Sin productos");
        free.setImageUrl("https://example.com/free.jpg");
        free = categories.saveAndFlush(free);
        mvc.perform(delete("/api/categories/{id}", free.getId()).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        Product product = saveProduct("Categoría ocupada Sprint 3", "Santa Fe");
        mvc.perform(delete("/api/categories/{id}", product.getCategoryEntity().getId()).header("Authorization", bearer(token)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("No se puede eliminar una categoría que tiene productos asociados."));
        mvc.perform(delete("/api/categories/{id}", 999999L).header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test void citySuggestionsDateValidationAndPoliciesFollowThePublicContract() throws Exception {
        Product first = saveProduct("Sugerencia Sprint 3 A", "Puerto Madryn");
        saveProduct("Sugerencia Sprint 3 B", "Puerto Madryn");

        mvc.perform(get("/api/products/cities").param("query", "madR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0]").value("Puerto Madryn"));
        mvc.perform(get("/api/products/search").param("city", "puerto madryn"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/products/search")
                        .param("city", "Puerto Madryn")
                        .param("checkIn", LocalDate.now().plusDays(1).toString()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/search")
                        .param("city", "Puerto Madryn")
                        .param("checkIn", LocalDate.now().minusDays(2).toString())
                        .param("checkOut", LocalDate.now().plusDays(1).toString()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/search")
                        .param("city", "Puerto Madryn")
                        .param("checkIn", LocalDate.now().plusDays(3).toString())
                        .param("checkOut", LocalDate.now().plusDays(3).toString()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/search")
                        .param("city", "Puerto Madryn")
                        .param("checkIn", LocalDate.now().plusDays(4).toString())
                        .param("checkOut", LocalDate.now().plusDays(2).toString()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/{id}", first.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policies.length()").value(3))
                .andExpect(jsonPath("$.policies[0].title").value("Normas de la casa"));
    }

    @Test void availabilityAndReservationRejectMissingProductsAndInvalidRanges() throws Exception {
        String token = jwt.generate(regular);
        Product product = saveProduct("Fechas inválidas Sprint 3", "La Plata");

        mvc.perform(get("/api/products/{id}/availability", 999999L))
                .andExpect(status().isNotFound());
        String equalDates = objectMapper.writeValueAsString(java.util.Map.of(
                "productId", product.getId(), "checkIn", LocalDate.now().plusDays(2), "checkOut", LocalDate.now().plusDays(2)));
        mvc.perform(post("/api/reservations").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(equalDates))
                .andExpect(status().isBadRequest());
        String pastDates = objectMapper.writeValueAsString(java.util.Map.of(
                "productId", product.getId(), "checkIn", LocalDate.now().minusDays(2), "checkOut", LocalDate.now().minusDays(1)));
        mvc.perform(post("/api/reservations").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(pastDates))
                .andExpect(status().isBadRequest());
    }

    @Test void favoriteListsAreIsolatedAndUnknownProductsReturnNotFound() throws Exception {
        Product product = saveProduct("Favoritos aislados Sprint 3", "Posadas");
        AppUser another = save("other-user-test@horizonte.com", Role.USER);
        String regularToken = jwt.generate(regular);
        String anotherToken = jwt.generate(another);

        mvc.perform(get("/api/favorites")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/favorites/{id}", product.getId()).header("Authorization", bearer(regularToken)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/favorites").header("Authorization", bearer(regularToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(product.getId()));
        mvc.perform(get("/api/favorites").header("Authorization", bearer(anotherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(put("/api/favorites/{id}", 999999L).header("Authorization", bearer(regularToken)))
                .andExpect(status().isNotFound());
    }

    @Test void reviewsRejectAnonymousFutureAndInvalidSubmissionsAndRecalculateMultipleScores() throws Exception {
        Product product = saveProduct("Promedio Sprint 3", "Rafaela");
        AppUser another = save("reviewer-two-test@horizonte.com", Role.USER);
        String regularToken = jwt.generate(regular);
        String anotherToken = jwt.generate(another);
        String validBody = reviewBody(product, 5, "Muy buena experiencia");

        mvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(validBody))
                .andExpect(status().isUnauthorized());
        saveReservation(product, regular, LocalDate.now().plusDays(3), LocalDate.now().plusDays(5));
        mvc.perform(post("/api/reviews").header("Authorization", bearer(regularToken))
                        .contentType(MediaType.APPLICATION_JSON).content(validBody))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/reviews").header("Authorization", bearer(regularToken))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody(product, 0, "Inválida")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/reviews").header("Authorization", bearer(regularToken))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody(product, 5, "x".repeat(1001))))
                .andExpect(status().isBadRequest());

        saveReservation(product, regular, LocalDate.now().minusDays(7), LocalDate.now().minusDays(5));
        saveReservation(product, another, LocalDate.now().minusDays(4), LocalDate.now().minusDays(2));
        mvc.perform(post("/api/reviews").header("Authorization", bearer(regularToken))
                        .contentType(MediaType.APPLICATION_JSON).content(validBody))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/reviews").header("Authorization", bearer(anotherToken))
                        .contentType(MediaType.APPLICATION_JSON).content(reviewBody(product, 3, "Correcta")))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/products/{id}/reviews", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.0))
                .andExpect(jsonPath("$.reviewCount").value(2));
    }

    private Product saveProduct(String name, String city) {
        Category category = categories.findAll().stream().findFirst().orElseThrow();
        Product product = new Product();
        product.setName(name);
        product.setDescription("Alojamiento creado para comprobar el Sprint 3.");
        product.setCategoryEntity(category);
        product.setCity(city);
        product.setPrice(new BigDecimal("100000"));
        product.setImages(List.of("https://example.com/sprint3.jpg"));
        product.setHouseRules("Sin fiestas.");
        product.setHealthAndSafety("Respetar las indicaciones.");
        product.setCancellationPolicy("Cancelación hasta 48 horas antes.");
        return products.saveAndFlush(product);
    }

    private Reservation saveReservation(Product product, AppUser user, LocalDate checkIn, LocalDate checkOut) {
        Reservation reservation = new Reservation();
        reservation.setProduct(product);
        reservation.setUser(user);
        reservation.setCheckIn(checkIn);
        reservation.setCheckOut(checkOut);
        return reservations.saveAndFlush(reservation);
    }

    private String reviewBody(Product product, int rating, String comment) throws Exception {
        return objectMapper.writeValueAsString(java.util.Map.of(
                "productId", product.getId(), "rating", rating, "comment", comment));
    }

    private AppUser save(String email, Role role) {
        AppUser user = users.findByEmailIgnoreCase(email).orElseGet(AppUser::new);
        user.setFirstName("Prueba"); user.setLastName(role.name()); user.setEmail(email);
        user.setPasswordHash(encoder.encode("Password123!")); user.setRole(role);
        return users.save(user);
    }

    private String bearer(String token) { return "Bearer " + token; }
}

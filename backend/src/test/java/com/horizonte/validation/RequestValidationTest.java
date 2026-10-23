package com.horizonte.validation;

import com.horizonte.category.CategoryRequest;
import com.horizonte.product.ProductRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestValidationTest {
    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void categoryRejectsBlankTextAndNonHttpImageUrlWithClearMessages() {
        CategoryRequest request = new CategoryRequest("   ", "\t", "javascript:alert('x')");

        Map<String, Set<String>> errors = errorsFor(request);

        assertTrue(errors.get("title").contains("El título es obligatorio."));
        assertTrue(errors.get("description").contains("La descripción es obligatoria."));
        assertTrue(errors.get("imageUrl").contains("La URL de la imagen debe ser una dirección HTTP o HTTPS válida."));
    }

    @Test
    void categoryAcceptsValidHttpAndHttpsUrls() {
        assertTrue(validator.validate(new CategoryRequest(
                "Cabañas", "Alojamientos en la montaña", "http://example.com/cabana.jpg")).isEmpty());
        assertTrue(validator.validate(new CategoryRequest(
                "Hoteles", "Alojamientos urbanos", "https://images.example.com/hotel.webp?size=large")).isEmpty());
    }

    @Test
    void categoryRejectsMalformedHttpUrl() {
        Map<String, Set<String>> errors = errorsFor(new CategoryRequest(
                "Cabañas", "Alojamientos en la montaña", "https://"));

        assertTrue(errors.get("imageUrl").contains("La URL de la imagen debe ser una dirección HTTP o HTTPS válida."));
    }

    @Test
    void productRejectsBlankTextLowPriceAndMissingCharacteristics() {
        ProductRequest request = new ProductRequest(
                "  ", "\n", 1L, "   ", BigDecimal.ZERO, Set.of());

        Map<String, Set<String>> errors = errorsFor(request);

        assertTrue(errors.get("name").contains("El nombre es obligatorio."));
        assertTrue(errors.get("description").contains("La descripción es obligatoria."));
        assertTrue(errors.get("city").contains("La ciudad es obligatoria."));
        assertTrue(errors.get("price").contains("El precio debe ser de al menos 0,01."));
        assertTrue(errors.get("characteristicIds").contains("Seleccioná al menos una característica."));
    }

    @Test
    void productAcceptsMinimumPriceAndOneCharacteristic() {
        ProductRequest request = new ProductRequest(
                "Casa del Lago", "Una descripción válida", 1L, "Bariloche",
                new BigDecimal("0.01"), Set.of(1L));

        assertEquals(Set.of(), validator.validate(request));
    }

    private <T> Map<String, Set<String>> errorsFor(T value) {
        return validator.validate(value).stream().collect(Collectors.groupingBy(
                violation -> violation.getPropertyPath().toString(),
                Collectors.mapping(ConstraintViolation::getMessage, Collectors.toSet())));
    }
}

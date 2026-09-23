package com.horizonte.product;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {
    @TempDir Path tempDir;

    @Test void randomLimitsResultsToTenAndDoesNotRepeatProducts() {
        ProductRepository repository = mock(ProductRepository.class);
        when(repository.findAll()).thenReturn(java.util.stream.IntStream.range(0, 12).mapToObj(i -> { Product p = new Product(); p.setName("Producto " + i); return p; }).toList());
        ProductService service = new ProductService(repository, tempDir.toString());
        List<Product> result = service.random(99);
        assertEquals(10, result.size());
        assertEquals(10, result.stream().map(Product::getName).distinct().count());
    }

    @Test void rejectsAProductWithADuplicateName() {
        ProductRepository repository = mock(ProductRepository.class);
        when(repository.existsByNameIgnoreCase("Casa Bruma")).thenReturn(true);
        ProductService service = new ProductService(repository, tempDir.toString());
        ProductRequest request = new ProductRequest("Casa Bruma", "Descripción válida", "Casas", "Salta", BigDecimal.TEN);
        MockMultipartFile image = new MockMultipartFile("images", "casa.jpg", "image/jpeg", "image".getBytes());
        assertThrows(DuplicateProductException.class, () -> service.create(request, new MockMultipartFile[]{image}));
    }
}

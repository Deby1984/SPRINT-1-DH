package com.horizonte.product;

import com.horizonte.category.Category;
import com.horizonte.category.CategoryRepository;
import com.horizonte.characteristic.CharacteristicRepository;
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
        ProductService service = service(repository);
        List<Product> result = service.random(99);
        assertEquals(10, result.size());
        assertEquals(10, result.stream().map(Product::getName).distinct().count());
    }

    @Test void rejectsAProductWithADuplicateName() {
        ProductRepository repository = mock(ProductRepository.class);
        when(repository.existsByNameIgnoreCase("Casa Bruma")).thenReturn(true);
        ProductService service = service(repository);
        ProductRequest request = new ProductRequest("Casa Bruma", "Descripción válida", 1L, "Salta", BigDecimal.TEN, java.util.Set.of());
        MockMultipartFile image = new MockMultipartFile("images", "casa.jpg", "image/jpeg", "image".getBytes());
        assertThrows(DuplicateProductException.class, () -> service.create(request, new MockMultipartFile[]{image}));
    }

    @Test void reportsWhenAProductDoesNotExist() {
        ProductRepository repository = mock(ProductRepository.class);
        when(repository.findById(99L)).thenReturn(java.util.Optional.empty());
        ProductService service = service(repository);

        ProductNotFoundException exception = assertThrows(ProductNotFoundException.class, () -> service.get(99L));

        assertEquals("No existe el producto 99", exception.getMessage());
    }

    @Test void rejectsFilesThatAreNotImages() {
        ProductRepository repository = mock(ProductRepository.class);
        CategoryRepository categories = mock(CategoryRepository.class);
        CharacteristicRepository characteristics = mock(CharacteristicRepository.class);
        Category category = new Category(); category.setTitle("Casas");
        when(categories.findById(1L)).thenReturn(java.util.Optional.of(category));
        when(characteristics.findAllById(any())).thenReturn(List.of());
        ProductService service = new ProductService(repository, categories, characteristics, tempDir.toString());
        ProductRequest request = new ProductRequest("Casa Serena", "Descripción válida", 1L, "Mendoza", BigDecimal.TEN, java.util.Set.of());
        MockMultipartFile invalidFile = new MockMultipartFile("images", "notas.txt", "text/plain", "texto".getBytes());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.create(request, new MockMultipartFile[]{invalidFile}));

        assertEquals("Solo se permiten archivos de imagen.", exception.getMessage());
        verify(repository, never()).save(any(Product.class));
    }

    private ProductService service(ProductRepository repository) {
        return new ProductService(repository, mock(CategoryRepository.class), mock(CharacteristicRepository.class), tempDir.toString());
    }
}

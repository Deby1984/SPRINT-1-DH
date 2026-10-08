package com.horizonte.category;

import com.horizonte.product.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository repository;
    private final ProductRepository products;
    public CategoryService(CategoryRepository repository, ProductRepository products) { this.repository = repository; this.products = products; }

    public List<Category> list() { return repository.findAll(Sort.by("title")); }
    public Category get(Long id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("La categoría seleccionada no existe.")); }

    @Transactional public Category create(CategoryRequest request) {
        if (repository.existsByTitleIgnoreCase(request.title().trim())) throw new IllegalArgumentException("Ya existe una categoría con ese título.");
        Category category = new Category();
        apply(category, request);
        return repository.save(category);
    }

    @Transactional public Category update(Long id, CategoryRequest request) {
        Category category = get(id);
        repository.findByTitleIgnoreCase(request.title().trim()).filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new IllegalArgumentException("Ya existe una categoría con ese título."); });
        apply(category, request);
        return category;
    }

    @Transactional public void delete(Long id) {
        Category category = get(id);
        boolean inUse = products.findAll().stream().anyMatch(product -> product.getCategoryEntity() != null && product.getCategoryEntity().getId().equals(id));
        if (inUse) throw new IllegalArgumentException("No se puede eliminar una categoría que tiene productos asociados.");
        repository.delete(category);
    }

    private void apply(Category category, CategoryRequest request) {
        category.setTitle(request.title().trim());
        category.setDescription(request.description().trim());
        category.setImageUrl(request.imageUrl().trim());
    }
}

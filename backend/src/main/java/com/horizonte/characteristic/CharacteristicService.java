package com.horizonte.characteristic;
import com.horizonte.product.Product;
import com.horizonte.product.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CharacteristicService {
    private final CharacteristicRepository repository;
    private final ProductRepository products;
    public CharacteristicService(CharacteristicRepository repository, ProductRepository products) { this.repository = repository; this.products = products; }
    public List<Characteristic> list() { return repository.findAll(Sort.by("name")); }
    public Characteristic get(Long id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("La característica no existe.")); }
    @Transactional public Characteristic create(CharacteristicRequest request) {
        if (repository.existsByNameIgnoreCase(request.name().trim())) throw new IllegalArgumentException("Ya existe una característica con ese nombre.");
        Characteristic value = new Characteristic(); apply(value, request); return repository.save(value);
    }
    @Transactional public Characteristic update(Long id, CharacteristicRequest request) {
        Characteristic value = get(id);
        repository.findByNameIgnoreCase(request.name().trim()).filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new IllegalArgumentException("Ya existe una característica con ese nombre."); });
        apply(value, request); return value;
    }
    @Transactional public void delete(Long id) {
        Characteristic value = get(id);
        List<Product> associated = products.findAll().stream().filter(product -> product.getCharacteristics().removeIf(item -> item.getId().equals(id))).toList();
        products.saveAll(associated);
        repository.delete(value);
    }
    private void apply(Characteristic value, CharacteristicRequest request) { value.setName(request.name().trim()); value.setIcon(request.icon().trim()); }
}

package com.horizonte.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class ProductService {
    private final ProductRepository repository;
    private final Path uploadDirectory;

    public ProductService(ProductRepository repository, @org.springframework.beans.factory.annotation.Value("${app.upload-dir}") String uploadDirectory) {
        this.repository = repository;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public Page<Product> list(int page, int size) {
        return repository.findAll(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 10), Sort.by("id").descending()));
    }

    public List<Product> random(int requestedLimit) {
        List<Product> products = new ArrayList<>(repository.findAll());
        Collections.shuffle(products);
        return products.subList(0, Math.min(Math.min(Math.max(requestedLimit, 1), 10), products.size()));
    }

    public Product get(Long id) {
        return repository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Transactional
    public Product create(ProductRequest request, MultipartFile[] files) {
        if (repository.existsByNameIgnoreCase(request.name().trim())) {
            throw new DuplicateProductException(request.name());
        }
        Product product = new Product();
        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setCategory(request.category().trim());
        product.setCity(request.city().trim());
        product.setPrice(request.price());
        product.setImages(storeFiles(files));
        return repository.save(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = get(id);
        product.getImages().stream().filter(image -> image.startsWith("/uploads/")).forEach(this::deleteFileQuietly);
        repository.delete(product);
    }

    private List<String> storeFiles(MultipartFile[] files) {
        if (files == null || files.length == 0 || Arrays.stream(files).allMatch(MultipartFile::isEmpty)) {
            throw new IllegalArgumentException("Debés subir al menos una imagen.");
        }
        try {
            Files.createDirectories(uploadDirectory);
            List<String> stored = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                    throw new IllegalArgumentException("Solo se permiten archivos de imagen.");
                }
                String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("imagen");
                String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')).replaceAll("[^A-Za-z0-9.]", "") : ".img";
                String filename = UUID.randomUUID() + extension;
                Files.copy(file.getInputStream(), uploadDirectory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
                stored.add("/uploads/" + filename);
            }
            if (stored.isEmpty()) throw new IllegalArgumentException("Debés subir al menos una imagen.");
            return stored;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudieron guardar las imágenes.", exception);
        }
    }

    private void deleteFileQuietly(String image) {
        try { Files.deleteIfExists(uploadDirectory.resolve(image.substring("/uploads/".length())).normalize()); }
        catch (IOException ignored) { }
    }
}

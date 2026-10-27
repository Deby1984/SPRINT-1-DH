package com.horizonte.category;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(Long id) {
        super("No existe la categoría " + id + ".");
    }
}

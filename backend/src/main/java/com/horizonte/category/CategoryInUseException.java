package com.horizonte.category;

public class CategoryInUseException extends RuntimeException {
    public CategoryInUseException() {
        super("No se puede eliminar una categoría que tiene productos asociados.");
    }
}

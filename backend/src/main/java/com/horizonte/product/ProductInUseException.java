package com.horizonte.product;

public class ProductInUseException extends RuntimeException {
    public ProductInUseException(Long id) {
        super("No se puede eliminar el producto " + id + " porque tiene reservas asociadas.");
    }
}

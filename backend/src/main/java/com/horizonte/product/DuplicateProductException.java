package com.horizonte.product;
public class DuplicateProductException extends RuntimeException { public DuplicateProductException(String name) { super("El nombre '" + name + "' ya está en uso."); } }

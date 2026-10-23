package com.horizonte.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.CONSTRUCTOR;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.RECORD_COMPONENT;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = HttpUrlValidator.class)
@Target({FIELD, METHOD, PARAMETER, CONSTRUCTOR, TYPE_USE, RECORD_COMPONENT, ANNOTATION_TYPE})
@Retention(RUNTIME)
public @interface HttpUrl {
    String message() default "Debe ser una URL HTTP o HTTPS válida.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

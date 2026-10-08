package com.horizonte.characteristic;
public record CharacteristicResponse(Long id, String name, String icon) {
    public static CharacteristicResponse from(Characteristic value) { return new CharacteristicResponse(value.getId(), value.getName(), value.getIcon()); }
}

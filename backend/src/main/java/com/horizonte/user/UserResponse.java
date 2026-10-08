package com.horizonte.user;
public record UserResponse(Long id, String firstName, String lastName, String email, Role role) {
    public static UserResponse from(AppUser user) { return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole()); }
}

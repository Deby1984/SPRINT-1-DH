package com.horizonte.category;

import com.horizonte.user.SessionUser;
import com.horizonte.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;
    private final UserRepository users;
    public CategoryController(CategoryService service, UserRepository users) { this.service = service; this.users = users; }

    @GetMapping public List<CategoryResponse> list() { return service.list().stream().map(CategoryResponse::from).toList(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CategoryResponse create(@Valid @RequestBody CategoryRequest request, HttpSession session) {
        SessionUser.requireAdmin(session, users); return CategoryResponse.from(service.create(request));
    }
    @PutMapping("/{id}") public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request, HttpSession session) {
        SessionUser.requireAdmin(session, users); return CategoryResponse.from(service.update(id, request));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id, HttpSession session) {
        SessionUser.requireAdmin(session, users); service.delete(id);
    }
}

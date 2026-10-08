package com.horizonte.characteristic;
import com.horizonte.user.SessionUser;
import com.horizonte.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/characteristics")
public class CharacteristicController {
    private final CharacteristicService service;
    private final UserRepository users;
    public CharacteristicController(CharacteristicService service, UserRepository users) { this.service = service; this.users = users; }
    @GetMapping public List<CharacteristicResponse> list() { return service.list().stream().map(CharacteristicResponse::from).toList(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CharacteristicResponse create(@Valid @RequestBody CharacteristicRequest request, HttpSession session) { SessionUser.requireAdmin(session, users); return CharacteristicResponse.from(service.create(request)); }
    @PutMapping("/{id}") public CharacteristicResponse update(@PathVariable Long id, @Valid @RequestBody CharacteristicRequest request, HttpSession session) { SessionUser.requireAdmin(session, users); return CharacteristicResponse.from(service.update(id, request)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id, HttpSession session) { SessionUser.requireAdmin(session, users); service.delete(id); }
}

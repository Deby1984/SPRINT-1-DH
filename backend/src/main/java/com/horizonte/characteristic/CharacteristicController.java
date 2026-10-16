package com.horizonte.characteristic;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/characteristics")
public class CharacteristicController {
    private final CharacteristicService service;
    public CharacteristicController(CharacteristicService service) { this.service = service; }
    @GetMapping public List<CharacteristicResponse> list() { return service.list().stream().map(CharacteristicResponse::from).toList(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CharacteristicResponse create(@Valid @RequestBody CharacteristicRequest request) { return CharacteristicResponse.from(service.create(request)); }
    @PutMapping("/{id}") public CharacteristicResponse update(@PathVariable Long id, @Valid @RequestBody CharacteristicRequest request) { return CharacteristicResponse.from(service.update(id, request)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { service.delete(id); }
}

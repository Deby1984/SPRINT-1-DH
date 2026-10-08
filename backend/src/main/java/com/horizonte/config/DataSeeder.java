package com.horizonte.config;

import com.horizonte.category.*;
import com.horizonte.characteristic.*;
import com.horizonte.product.*;
import com.horizonte.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.math.BigDecimal;
import java.util.*;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seedData(ProductRepository products, CategoryRepository categories,
            CharacteristicRepository characteristics, UserRepository users) {
        return args -> {
            Map<String, Category> categoryMap = new LinkedHashMap<>();
            categoryMap.put("Cabañas", category(categories, "Cabañas", "Refugios entre montañas, bosques y lagos.", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80"));
            categoryMap.put("Casas", category(categories, "Casas", "Espacios completos para compartir y descansar.", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"));
            categoryMap.put("Hoteles", category(categories, "Hoteles", "Servicio, comodidad y experiencias cuidadas.", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"));
            categoryMap.put("Estancias", category(categories, "Estancias", "Paisajes abiertos y hospitalidad de campo.", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"));
            categoryMap.put("Departamentos", category(categories, "Departamentos", "Una base práctica para vivir la ciudad.", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"));
            categoryMap.put("Lofts", category(categories, "Lofts", "Diseño abierto para escapadas urbanas.", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"));

            Set<Characteristic> defaults = new LinkedHashSet<>(List.of(
                    characteristic(characteristics, "Wi-Fi", "⌁"), characteristic(characteristics, "Estacionamiento", "P"),
                    characteristic(characteristics, "Cocina", "♨"), characteristic(characteristics, "Aire acondicionado", "❄")));

            if (products.count() == 0) {
                List.of(
                    item("Casa Bruma", "Una casa de montaña cálida y silenciosa, preparada para escapadas de descanso.", categoryMap.get("Cabañas"), "Bariloche", "142000", "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Loft Puerto", "Diseño contemporáneo frente al río, con desayuno artesanal incluido.", categoryMap.get("Lofts"), "Buenos Aires", "118000", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Estancia Oliva", "Un refugio rural entre olivos, viñedos y atardeceres mendocinos.", categoryMap.get("Estancias"), "Mendoza", "164000", "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Refugio Niebla", "Arquitectura simple, bosque nativo y una vista abierta al lago.", categoryMap.get("Cabañas"), "Villa La Angostura", "151000", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Casa del Valle", "Habitaciones luminosas y jardín privado en el corazón del valle.", categoryMap.get("Casas"), "Salta", "106000", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Alto Cielo", "Suite de altura con pileta, spa y una panorámica inolvidable.", categoryMap.get("Hoteles"), "Ushuaia", "189000", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Río Quieto", "Alojamiento íntimo con muelle propio y kayaks disponibles.", categoryMap.get("Cabañas"), "San Martín de los Andes", "137000", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Patio Norte", "Un patio verde, cocina equipada y cercanía a los principales paseos.", categoryMap.get("Departamentos"), "Córdoba", "97000", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Luz de Mar", "Casa simple y fresca a pocos pasos de la costa atlántica.", categoryMap.get("Casas"), "Mar del Plata", "123000", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Bosque Sur", "Cabaña de madera con hogar a leña y senderos en la puerta.", categoryMap.get("Cabañas"), "El Calafate", "145000", "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", defaults),
                    item("Tierra Clara", "Una estancia histórica con gastronomía local y cabalgatas.", categoryMap.get("Estancias"), "Tandil", "132000", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80", defaults)
                ).forEach(products::save);
            } else {
                products.findAll().forEach(product -> {
                    if (product.getCategoryEntity() == null) {
                        String title = product.getCategory();
                        product.setCategoryEntity(categoryMap.computeIfAbsent(title, value -> category(categories, value, "Alojamientos seleccionados.", categoryMap.get("Casas").getImageUrl())));
                    }
                    if (product.getCharacteristics().isEmpty()) product.setCharacteristics(defaults);
                    products.save(product);
                });
            }

            if (!users.existsByEmailIgnoreCase("admin@horizonte.com")) {
                AppUser admin = new AppUser(); admin.setFirstName("Equipo"); admin.setLastName("Horizonte"); admin.setEmail("admin@horizonte.com");
                admin.setPasswordHash(new BCryptPasswordEncoder().encode("Horizonte123!")); admin.setRole(Role.ADMIN); users.save(admin);
            }
        };
    }

    private Category category(CategoryRepository repository, String title, String description, String image) {
        return repository.findByTitleIgnoreCase(title).orElseGet(() -> { Category value = new Category(); value.setTitle(title); value.setDescription(description); value.setImageUrl(image); return repository.save(value); });
    }
    private Characteristic characteristic(CharacteristicRepository repository, String name, String icon) {
        return repository.findByNameIgnoreCase(name).orElseGet(() -> { Characteristic value = new Characteristic(); value.setName(name); value.setIcon(icon); return repository.save(value); });
    }
    private Product item(String name, String description, Category category, String city, String price, String image, Set<Characteristic> characteristics) {
        Product p = new Product(); p.setName(name); p.setDescription(description); p.setCategoryEntity(category); p.setCity(city); p.setPrice(new BigDecimal(price));
        p.setImages(List.of(image, image + "&sat=-15", image + "&con=15", image + "&bri=8", image + "&blur=1")); p.setCharacteristics(characteristics); return p;
    }
}

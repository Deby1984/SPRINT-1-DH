package com.horizonte.config;

import com.horizonte.product.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> { if (repository.count() == 0) {
            List.of(
                item("Casa Bruma", "Una casa de montaña cálida y silenciosa, preparada para escapadas de descanso.", "Cabañas", "Bariloche", "142000", "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80"),
                item("Loft Puerto", "Diseño contemporáneo frente al río, con desayuno artesanal incluido.", "Lofts", "Buenos Aires", "118000", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"),
                item("Estancia Oliva", "Un refugio rural entre olivos, viñedos y atardeceres mendocinos.", "Estancias", "Mendoza", "164000", "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=80"),
                item("Refugio Niebla", "Arquitectura simple, bosque nativo y una vista abierta al lago.", "Cabañas", "Villa La Angostura", "151000", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80"),
                item("Casa del Valle", "Habitaciones luminosas y jardín privado en el corazón del valle.", "Casas", "Salta", "106000", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"),
                item("Alto Cielo", "Suite de altura con pileta, spa y una panorámica inolvidable.", "Hoteles", "Ushuaia", "189000", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"),
                item("Río Quieto", "Alojamiento íntimo con muelle propio y kayaks disponibles.", "Cabañas", "San Martín de los Andes", "137000", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80"),
                item("Patio Norte", "Un patio verde, cocina equipada y cercanía a los principales paseos.", "Departamentos", "Córdoba", "97000", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"),
                item("Luz de Mar", "Casa simple y fresca a pocos pasos de la costa atlántica.", "Casas", "Mar del Plata", "123000", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"),
                item("Bosque Sur", "Cabaña de madera con hogar a leña y senderos en la puerta.", "Cabañas", "El Calafate", "145000", "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"),
                item("Tierra Clara", "Una estancia histórica con gastronomía local y cabalgatas.", "Estancias", "Tandil", "132000", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80")
            ).forEach(repository::save); } };
    }
    private Product item(String name, String description, String category, String city, String price, String image) { Product p = new Product(); p.setName(name); p.setDescription(description); p.setCategory(category); p.setCity(city); p.setPrice(new BigDecimal(price)); p.setImages(List.of(image, image + "&sat=-15", image + "&con=15", image + "&bri=8", image + "&blur=1")); return p; }
}

package com.horizonte.product;

import com.horizonte.category.Category;
import com.horizonte.characteristic.Characteristic;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "products", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 1200) private String description;
    @Column(nullable = false, length = 60) private String category;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "category_id") private Category categoryEntity;
    @Column(nullable = false, length = 100) private String city;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 2048)
    @OrderColumn(name = "display_order")
    private List<String> images = new ArrayList<>();
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "product_characteristics", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "characteristic_id"))
    private Set<Characteristic> characteristics = new LinkedHashSet<>();

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return categoryEntity == null ? category : categoryEntity.getTitle(); }
    public void setCategory(String category) { this.category = category; }
    public Category getCategoryEntity() { return categoryEntity; }
    public void setCategoryEntity(Category categoryEntity) { this.categoryEntity = categoryEntity; this.category = categoryEntity.getTitle(); }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = new ArrayList<>(images); }
    public Set<Characteristic> getCharacteristics() { return characteristics; }
    public void setCharacteristics(Set<Characteristic> characteristics) { this.characteristics = new LinkedHashSet<>(characteristics); }
}

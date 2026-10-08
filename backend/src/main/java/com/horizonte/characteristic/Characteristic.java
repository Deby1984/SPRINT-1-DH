package com.horizonte.characteristic;

import jakarta.persistence.*;

@Entity
@Table(name = "characteristics", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Characteristic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 60) private String name;
    @Column(nullable = false, length = 24) private String icon;
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}

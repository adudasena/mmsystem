package com.adudasena.mmsystem.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity @Table(name = "tb_categoria") @Data
public class Categoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String nome;
}
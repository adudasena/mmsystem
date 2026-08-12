package com.adudasena.mmsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String telefone;

    @Column(unique = true)
    private String email;

    private String senha;

    @Column(nullable = false)
    private String perfil; // "CLIENTE", "PROPRIETARIA", "FUNCIONARIO"

    // Soft delete
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
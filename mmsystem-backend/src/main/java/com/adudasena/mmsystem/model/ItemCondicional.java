package com.adudasena.mmsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "itens_condicional")
@Data
public class ItemCondicional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_condicional_id", nullable = false)
    private Condicional condicional;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade = 1;
}
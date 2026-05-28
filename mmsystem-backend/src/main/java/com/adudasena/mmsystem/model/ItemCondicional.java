package com.adudasena.mmsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private Condicional condicional;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private int quantidade = 1;

    @Column(name = "cor_escolhida")
    private String corEscolhida;

    @Column(name = "tamanho_escolhido")
    private String tamanhoEscolhido;

    @Column(name = "status_item", nullable = false)
    private String statusItem = "EM_CONDICIONAL";
}
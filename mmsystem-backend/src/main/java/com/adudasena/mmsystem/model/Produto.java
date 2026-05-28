package com.adudasena.mmsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Data
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private BigDecimal preco;

    private String categoria;

    // TEXT para salvar as listas do React como String/JSON
    @Column(name = "cores_selecionadas", columnDefinition = "TEXT")
    private String coresSelecionadas;

    @Column(name = "tamanhos_selecionados", columnDefinition = "TEXT")
    private String tamanhosSelecionados;

    @Column(name = "estoque_detalhado", columnDefinition = "TEXT")
    private String estoqueDetalhado;

    // Para as fotos em Base64
    @Column(name = "fotos", columnDefinition = "TEXT")
    private String fotos;

    @Column(nullable = false)
    private String status = "DISPONIVEL";
}
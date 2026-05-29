package com.adudasena.mmsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "cores_selecionadas", columnDefinition = "TEXT")
    private String coresText;

    @Column(name = "tamanhos_selecionados", columnDefinition = "TEXT")
    private String tamanhosText;

    @Column(name = "estoque_detalhado", columnDefinition = "TEXT")
    private String estoqueDetalhado;

    @Column(name = "fotos", columnDefinition = "TEXT")
    private String fotos;

    @Column(nullable = false)
    private String status = "DISPONIVEL";

    // Campos transientes — só existem em memória, não vão pro banco
    @Transient
    private List<String> coresSelecionadas = new ArrayList<>();

    @Transient
    private List<String> tamanhosSelecionados = new ArrayList<>();

    @PostLoad
    public void desserializarListas() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            if (this.coresText != null && !this.coresText.isEmpty())
                this.coresSelecionadas = mapper.readValue(this.coresText, new TypeReference<>(){});
            if (this.tamanhosText != null && !this.tamanhosText.isEmpty())
                this.tamanhosSelecionados = mapper.readValue(this.tamanhosText, new TypeReference<>(){});
        } catch (Exception e) {
            this.coresSelecionadas = new ArrayList<>();
            this.tamanhosSelecionados = new ArrayList<>();
        }
    }
}
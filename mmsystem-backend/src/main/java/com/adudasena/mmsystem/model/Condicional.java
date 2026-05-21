package com.adudasena.mmsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "condicionais")
@Data
public class Condicional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_saida", nullable = false)
    private LocalDate dataSaida;

    @Column(name = "data_retorno")
    private LocalDate dataRetorno;

    @Column(nullable = false)
    private String status = "Aberta";

    @Column(name = "valor_total", precision = 38, scale = 2)
    private BigDecimal valorTotal;

    @OneToMany(mappedBy = "condicional", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCondicional> itens = new ArrayList<>();
}


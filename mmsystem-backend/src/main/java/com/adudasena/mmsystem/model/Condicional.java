package com.adudasena.mmsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "condicionais")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Where(clause = "deleted_at IS NULL") // Filtra automaticamente condicionais excluídas em qualquer busca
public class Condicional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "data_saida", nullable = false)
    private LocalDate dataSaida;

    @Column(name = "data_retorno")
    private LocalDate dataRetorno;

    @Column(nullable = false)
    private String status = "ABERTA";

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // Campo para Soft Delete

    // Mapeia a tabela auxiliar itens_condicional sem precisar de uma classe Entidade Java separada
    @ElementCollection
    @CollectionTable(name = "itens_condicional", joinColumns = @JoinColumn(name = "fk_condicional_id"))
    private List<ItemItem> itens = new ArrayList<>();

    @Data
    @Embeddable
    public static class ItemItem {
        @ManyToOne(optional = false)
        @JoinColumn(name = "fk_produto_id", nullable = false)
        private Produto produto;

        private Integer quantidade;

        @Column(name = "cor_escolhida")
        private String corEscolhida;

        @Column(name = "tamanho_escolhido")
        private String tamanhoEscolhido;

        @Column(name = "status_item")
        private String statusItem;
    }
}
package com.adudasena.mmsystem.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CondicionalDTO {
    private Long clienteId;
    private LocalDate dataSaida;
    private LocalDate dataRetorno;
    private String status;
    private List<ItemSacolaDTO> itens; // Lista usando a classe interna definida abaixo

    @Data
    public static class ItemSacolaDTO {
        private Long produtoId;
        private Integer quantidade;
        private String corEscolhida;
        private String tamanhoEscolhido;
        private String statusItem;
    }
}
package com.adudasena.mmsystem.dto;

import lombok.Data;

@Data
public class ItemCondicionalDTO {
    private Long produtoId;
    private Integer quantidade;
    private String corEscolhida;
    private String tamanhoEscolhido;
    private String statusItem; // Receberá "EM_CONDICIONAL", "VENDIDO" ou "ATIVO"
}
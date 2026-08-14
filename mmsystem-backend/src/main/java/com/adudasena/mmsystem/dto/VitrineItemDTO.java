package com.adudasena.mmsystem.dto;

import lombok.Data;

@Data
public class VitrineItemDTO {
    private Long produtoId;
    private Integer quantidade;
    private String corEscolhida;
    private String tamanhoEscolhido;
}
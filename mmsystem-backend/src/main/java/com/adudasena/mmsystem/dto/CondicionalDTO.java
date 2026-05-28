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
    private List<ItemCondicionalDTO> itens;
}
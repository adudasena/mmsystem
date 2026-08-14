package com.adudasena.mmsystem.dto;

import java.util.List;

public class VitrinePedidoDTO {
    private Long usuarioId;
    private List<VitrineItemDTO> itens;

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public List<VitrineItemDTO> getItens() { return itens; }
    public void setItens(List<VitrineItemDTO> itens) { this.itens = itens; }
}
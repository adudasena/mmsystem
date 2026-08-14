package com.adudasena.mmsystem.dto;

public class ItemPedidoDTO {
    private Long fkProdutoId;
    private Integer quantidade;

    public ItemPedidoDTO() {}

    public Long getFkProdutoId() { return fkProdutoId; }
    public void setFkProdutoId(Long fkProdutoId) { this.fkProdutoId = fkProdutoId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
}
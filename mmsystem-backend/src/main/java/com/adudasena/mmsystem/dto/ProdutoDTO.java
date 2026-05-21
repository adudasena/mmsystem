package com.adudasena.mmsystem.dto;

import com.adudasena.mmsystem.model.Produto;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProdutoDTO {
    private String nome;
    private String categoria;
    private String descricao;
    private BigDecimal preco;
    private List<String> coresSelecionadas;
    private List<String> tamanhosSelecionados;
    private Map<String, Integer> estoqueDetalhado;
    private List<String> fotos;
    private Produto.Status status;
}
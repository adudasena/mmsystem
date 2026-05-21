package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.ProdutoDTO;
import com.adudasena.mmsystem.model.Produto;
import com.adudasena.mmsystem.repository.ProdutoRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com o ID: " + id));
    }

    public Produto salvar(ProdutoDTO dto) throws JsonProcessingException {
        return salvar(new Produto(), dto);
    }

    public Produto atualizar(Long id, ProdutoDTO dto) throws JsonProcessingException {
        Produto existente = buscarPorId(id);
        return salvar(existente, dto);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: Produto não encontrado");
        }
        repository.deleteById(id);
    }

    private Produto salvar(Produto produto, ProdutoDTO dto) throws JsonProcessingException {
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setCategoria(dto.getCategoria());
        produto.setStatus(dto.getStatus() == null ? Produto.Status.ATIVO : dto.getStatus());
        produto.setCoresSelecionadas(objectMapper.writeValueAsString(dto.getCoresSelecionadas()));
        produto.setTamanhosSelecionados(objectMapper.writeValueAsString(dto.getTamanhosSelecionados()));
        produto.setEstoqueDetalhado(objectMapper.writeValueAsString(dto.getEstoqueDetalhado()));
        produto.setFotos(objectMapper.writeValueAsString(dto.getFotos()));
        return repository.save(produto);
    }
}
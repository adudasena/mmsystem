package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.CondicionalDTO;
import com.adudasena.mmsystem.dto.ItemCondicionalDTO;
import com.adudasena.mmsystem.model.*;
import com.adudasena.mmsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CondicionalService {

    @Autowired
    private CondicionalRepository repository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Condicional> listarTodos() {
        return repository.findAll();
    }

    public Condicional buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condicional não encontrada: " + id));
    }

    @Transactional
    public Condicional criar(CondicionalDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        Condicional condicional = new Condicional();
        condicional.setCliente(cliente);
        condicional.setDataSaida(dto.getDataSaida());
        condicional.setDataRetorno(dto.getDataRetorno());
        condicional.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ABERTA");

        preencherItens(condicional, dto.getItens());
        calcularTotal(condicional);

        return repository.save(condicional);
    }

    @Transactional
    public Condicional atualizar(Long id, CondicionalDTO dto) {
        Condicional condicional = buscarPorId(id);

        if (dto.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));
            condicional.setCliente(cliente);
        }

        if (dto.getDataSaida() != null) condicional.setDataSaida(dto.getDataSaida());
        if (dto.getDataRetorno() != null) condicional.setDataRetorno(dto.getDataRetorno());
        if (dto.getStatus() != null) condicional.setStatus(dto.getStatus().toUpperCase());

        if (dto.getItens() != null) {
            condicional.getItens().clear();
            preencherItens(condicional, dto.getItens());
            calcularTotal(condicional);
        }

        return repository.save(condicional);
    }

    @Transactional
    public Condicional finalizar(Long id, CondicionalDTO dto) {
        Condicional condicional = buscarPorId(id);

        List<ItemCondicionalDTO> itensEnviadosPeloFront = dto.getItens();
        if (itensEnviadosPeloFront == null || itensEnviadosPeloFront.isEmpty()) {
            throw new RuntimeException("Não é possível finalizar sem os itens da sacola.");
        }

        boolean possuiVenda = false;
        boolean possuiDevolucao = false;

        for (ItemCondicional itemBanco : condicional.getItens()) {
            ItemCondicionalDTO itemDto = itensEnviadosPeloFront.stream()
                    .filter(i -> i.getProdutoId().equals(itemBanco.getProduto().getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado na requisição."));

            if (itemDto.getStatusItem() != null) {
                String acaoVendedora = itemDto.getStatusItem().toUpperCase();

                if (acaoVendedora.equals("VENDIDO")) {
                    itemBanco.setStatusItem("VENDIDO");
                    possuiVenda = true;
                } else if (acaoVendedora.equals("DISPONIVEL") || acaoVendedora.equals("DEVOLVIDO")) {
                    itemBanco.setStatusItem("DISPONIVEL");
                    possuiDevolucao = true;
                }
            }
        }

        if (possuiVenda) {
            condicional.setStatus("FINALIZADA");
        } else if (possuiDevolucao) {
            condicional.setStatus("DEVOLVIDA");
        }

        return repository.save(condicional);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Condicional não encontrada: " + id);
        }
        repository.deleteById(id);
    }

    private void preencherItens(Condicional condicional, List<ItemCondicionalDTO> itensDTO) {
        if (itensDTO == null) return;
        for (ItemCondicionalDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            ItemCondicional item = new ItemCondicional();
            item.setCondicional(condicional);
            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade() != null ? itemDTO.getQuantidade() : 1);
            item.setCorEscolhida(itemDTO.getCorEscolhida());
            item.setTamanhoEscolhido(itemDTO.getTamanhoEscolhido());
            item.setStatusItem(itemDTO.getStatusItem() != null ? itemDTO.getStatusItem().toUpperCase() : "EM_CONDICIONAL");

            condicional.getItens().add(item);
        }
    }

    private void calcularTotal(Condicional condicional) {
        BigDecimal total = condicional.getItens().stream()
                .map(i -> i.getProduto().getPreco()
                        .multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        condicional.setValorTotal(total);
    }
}

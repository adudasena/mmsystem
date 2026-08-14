package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.CondicionalDTO;
import com.adudasena.mmsystem.dto.VitrinePedidoDTO;
import com.adudasena.mmsystem.model.*;
import com.adudasena.mmsystem.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CondicionalService {

    @Autowired
    private CondicionalRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Condicional> listarTodos() {
        return repository.findAll();
    }

    public Condicional buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condicional não encontrada: " + id));
    }

    @Transactional
    public Condicional criar(CondicionalDTO dto) {
        validarPrazoMaximo(dto.getDataSaida(), dto.getDataRetorno());

        Usuario usuario = usuarioRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        Condicional condicional = new Condicional();
        condicional.setUsuario(usuario);
        condicional.setDataSaida(dto.getDataSaida());
        condicional.setDataRetorno(dto.getDataRetorno());
        condicional.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ABERTA");

        preencherItens(condicional, dto.getItens());
        calcularTotal(condicional);

        return repository.save(condicional);
    }

    @Transactional
    public Condicional atualizar(Long id, CondicionalDTO dto) {
        validarPrazoMaximo(dto.getDataSaida(), dto.getDataRetorno());

        Condicional condicional = buscarPorId(id);

        Usuario usuario = usuarioRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        condicional.setUsuario(usuario);
        condicional.setDataSaida(dto.getDataSaida());
        condicional.setDataRetorno(dto.getDataRetorno());
        if (dto.getStatus() != null) {
            condicional.setStatus(dto.getStatus().toUpperCase());
        }

        if (dto.getItens() != null) {
            condicional.getItens().clear();
            repository.saveAndFlush(condicional);

            preencherItens(condicional, dto.getItens());
        }

        calcularTotal(condicional);
        return repository.save(condicional);
    }

    @Transactional
    public Condicional finalizar(Long id, CondicionalDTO dto) {
        Condicional condicional = buscarPorId(id);

        List<CondicionalDTO.ItemSacolaDTO> itensEnviadosPeloFront = dto.getItens();
        if (itensEnviadosPeloFront == null || itensEnviadosPeloFront.isEmpty()) {
            throw new RuntimeException("Não é possível finalizar sem os itens da sacola.");
        }

        boolean possuiVenda = false;
        boolean possuiDevolucao = false;

        for (Condicional.ItemCondicional itemBanco : condicional.getItens()) {
            CondicionalDTO.ItemSacolaDTO itemDto = itensEnviadosPeloFront.stream()
                    .filter(i -> i.getProdutoId().equals(itemBanco.getProduto().getId())
                            && i.getCorEscolhida().equals(itemBanco.getCorEscolhida())
                            && i.getTamanhoEscolhido().equals(itemBanco.getTamanhoEscolhido()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Item da grade não localizado na requisição."));

            if (itemDto.getStatusItem() != null) {
                String acaoVendedora = itemDto.getStatusItem().toUpperCase();

                if (acaoVendedora.equals("VENDIDO")) {
                    itemBanco.setStatusItem("VENDIDO");
                    possuiVenda = true;

                    atualizarEstoqueProduto(itemBanco.getProduto(), itemBanco.getCorEscolhida(), itemBanco.getTamanhoEscolhido(), itemBanco.getQuantidade());
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

    @Transactional
    public void excluir(Long id) {
        Condicional condicional = buscarPorId(id);
        condicional.setDeletedAt(LocalDateTime.now());
        repository.save(condicional);
    }

    @Transactional
    public Condicional processarPedidoVitrine(VitrinePedidoDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Cliente/Usuário não encontrado: " + dto.getUsuarioId()));

        Condicional condicional = new Condicional();
        condicional.setUsuario(usuario);
        condicional.setDataSaida(LocalDate.now());
        condicional.setDataRetorno(LocalDate.now().plusDays(3));
        condicional.setStatus("ABERTA");

        List<Condicional.ItemCondicional> itens = dto.getItens().stream().map(itemDto -> {
            Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado ID: " + itemDto.getProdutoId()));

            Condicional.ItemCondicional item = new Condicional.ItemCondicional();
            item.setProduto(produto);
            item.setQuantidade(itemDto.getQuantidade() != null ? itemDto.getQuantidade() : 1);
            item.setCorEscolhida(itemDto.getCorEscolhida());
            item.setTamanhoEscolhido(itemDto.getTamanhoEscolhido());
            item.setStatusItem("EM_CONDICIONAL");

            return item;
        }).collect(Collectors.toList());

        condicional.setItens(itens);
        calcularTotal(condicional);

        return repository.save(condicional);
    }

    private void preencherItens(Condicional condicional, List<CondicionalDTO.ItemSacolaDTO> itensDTO) {
        if (itensDTO == null) return;
        for (CondicionalDTO.ItemSacolaDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            Condicional.ItemCondicional item = new Condicional.ItemCondicional();
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

    private void validarPrazoMaximo(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null) {
            long dias = ChronoUnit.DAYS.between(inicio, fim);
            if (dias > 30) {
                throw new RuntimeException("Prazo inválido! O período da sacola condicional não pode exceder 30 dias.");
            }
        }
    }

    private void atualizarEstoqueProduto(Produto produtoOriginal, String cor, String tamanho, int qtdVendida) {
        try {
            Produto produto = produtoRepository.findById(produtoOriginal.getId())
                    .orElseThrow(() -> new RuntimeException("Produto não localizado para atualização de estoque."));

            String jsonEstoque = produto.getEstoqueDetalhado();
            if (jsonEstoque == null || jsonEstoque.isEmpty()) return;

            Map<String, Integer> estoque = objectMapper.readValue(
                    jsonEstoque, new TypeReference<Map<String, Integer>>() {}
            );

            String chaveComposta = cor + "-" + tamanho;

            if (estoque.containsKey(chaveComposta)) {
                int qtdAtual = estoque.get(chaveComposta);
                int novaQtd = Math.max(0, qtdAtual - qtdVendida);

                estoque.put(chaveComposta, novaQtd);

                produto.setEstoqueDetalhado(objectMapper.writeValueAsString(estoque));
                produtoRepository.saveAndFlush(produto);
            }
        } catch (Exception e) {
            System.err.println("Falha ao atualizar estoque: " + e.getMessage());
        }
    }
}
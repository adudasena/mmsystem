package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.CondicionalDTO;
import com.adudasena.mmsystem.model.*;
import com.adudasena.mmsystem.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class CondicionalService {

    @Autowired
    private CondicionalRepository repository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Condicional> listarTodos() {
        // O @Where(clause = "deleted_at IS NULL") na model garante o filtro automático aqui
        return repository.findAll();
    }

    public Condicional buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condicional não encontrada: " + id));
    }

    @Transactional
    public Condicional criar(CondicionalDTO dto) {
        // Validação de Limite de Data (Máximo 30 dias)
        validarPrazoMaximo(dto.getDataSaida(), dto.getDataRetorno());

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
        validarPrazoMaximo(dto.getDataSaida(), dto.getDataRetorno());

        Condicional condicional = buscarPorId(id);

        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        condicional.setCliente(cliente);
        condicional.setDataSaida(dto.getDataSaida());
        condicional.setDataRetorno(dto.getDataRetorno());
        if (dto.getStatus() != null) {
            condicional.setStatus(dto.getStatus().toUpperCase());
        }

        if (dto.getItens() != null) {
            // Maneira correta para o Hibernate não perder a referência do Cascade - INTACTA
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

        // Fluxo original de iteração de baixa e comparação
        for (Condicional.ItemItem itemBanco : condicional.getItens()) {
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

                    // Chama seu método original de estoque com tratamento de Map duplo do JSON
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
        // Ajustado para aplicar o Soft Delete usando LocalDateTime conforme exigido
        Condicional condicional = buscarPorId(id);
        condicional.setDeletedAt(LocalDateTime.now());
        repository.save(condicional);
    }

    private void preencherItens(Condicional condicional, List<CondicionalDTO.ItemSacolaDTO> itensDTO) {
        if (itensDTO == null) return;
        for (CondicionalDTO.ItemSacolaDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            Condicional.ItemItem item = new Condicional.ItemItem();
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

    private void validarPrazoMaximo(java.time.LocalDate inicio, java.time.LocalDate fim) {
        if (inicio != null && fim != null) {
            long dias = ChronoUnit.DAYS.between(inicio, fim);
            if (dias > 30) {
                throw new RuntimeException("Prazo inválido! O período da sacola condicional não pode exceder 30 dias.");
            }
        }
    }

    //  ESTOQUE COM MAP DUPLO E VALIDAÇÃO CONTRA NEGATIVOS
    private void atualizarEstoqueProduto(Produto produto, String cor, String tamanho, int qtdVendida) {
        try {
            String jsonEstoque = produto.getEstoqueDetalhado();
            if (jsonEstoque == null || jsonEstoque.isEmpty()) return;

            Map<String, Map<String, Integer>> estoque = objectMapper.readValue(
                    jsonEstoque, new TypeReference<Map<String, Map<String, Integer>>>() {}
            );

            if (estoque.containsKey(cor) && estoque.get(cor).containsKey(tamanho)) {
                int qtdAtual = estoque.get(cor).get(tamanho);
                int novaQtd = Math.max(0, qtdAtual - qtdVendida); // Evita estoque negativo

                estoque.get(cor).put(tamanho, novaQtd);

                produto.setEstoqueDetalhado(objectMapper.writeValueAsString(estoque));
                produtoRepository.save(produto);
            }
        } catch (Exception e) {
            System.err.println("Falha ao atualizar estoque do produto: " + e.getMessage());
        }
    }
}
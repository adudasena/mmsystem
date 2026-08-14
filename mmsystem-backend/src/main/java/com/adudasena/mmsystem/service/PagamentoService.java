package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.PagamentoDTO;
import com.adudasena.mmsystem.enums.MetodoPagamento;
import com.adudasena.mmsystem.model.Pagamento;
import com.adudasena.mmsystem.model.Pedido;
import com.adudasena.mmsystem.repository.PagamentoRepository;
import com.adudasena.mmsystem.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagamentoService {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public List<Pagamento> listar() {
        return pagamentoRepository.findAll();
    }

    public Pagamento salvar(PagamentoDTO dto) {
        Pagamento pagamento = new Pagamento();
        pagamento.setValor(dto.getValor());

        // Conversão de String para Enum MetodoPagamento
        if (dto.getMetodoPagamento() != null) {
            pagamento.setMetodoPagamento(MetodoPagamento.valueOf(dto.getMetodoPagamento()));
        }

        pagamento.setDataVencimento(dto.getDataVencimento());
        pagamento.setStatus(dto.getStatus());

        if (dto.getFkPedidoId() != null) {
            Pedido pedido = pedidoRepository.findById(dto.getFkPedidoId()).orElse(null);
            pagamento.setPedido(pedido);
        }

        return pagamentoRepository.save(pagamento);
    }
}
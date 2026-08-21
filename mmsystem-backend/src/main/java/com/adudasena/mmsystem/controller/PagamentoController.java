package com.adudasena.mmsystem.controller;

import com.adudasena.mmsystem.dto.PagamentoDTO;
import com.adudasena.mmsystem.enums.MetodoPagamento;
import com.adudasena.mmsystem.model.Pagamento;
import com.adudasena.mmsystem.model.Pedido;
import com.adudasena.mmsystem.repository.PagamentoRepository;
import com.adudasena.mmsystem.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos")
@CrossOrigin(origins = "*")
public class PagamentoController {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping
    public List<Pagamento> listar() {
        return pagamentoRepository.findAll();
    }

    @PostMapping
    public Pagamento salvar(@RequestBody PagamentoDTO dto) {
        Pagamento pagamento = new Pagamento();
        pagamento.setValor(dto.getValor());

        if (dto.getMetodoPagamento() != null) {
            pagamento.setMetodoPagamento(MetodoPagamento.valueOf(dto.getMetodoPagamento()));
        }

        pagamento.setDataVencimento(dto.getDataVencimento());
        pagamento.setStatus(dto.getStatus());

        // CORREÇÃO 2: Usa a variável injetada com 'p' minúsculo (pedidoRepository)
        if (dto.getFkPedidoId() != null) {
            Pedido pedido = pedidoRepository.findById(dto.getFkPedidoId()).orElse(null);
            pagamento.setPedido(pedido);
        }

        return pagamentoRepository.save(pagamento);
    }
}
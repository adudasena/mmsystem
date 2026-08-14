package com.adudasena.mmsystem.controller;

import com.adudasena.mmsystem.dto.ItemPedidoDTO;
import com.adudasena.mmsystem.dto.PedidoDTO;
import com.adudasena.mmsystem.enums.StatusPedido; // Import adicionado
import com.adudasena.mmsystem.model.ItemPedido;
import com.adudasena.mmsystem.model.Pedido;
import com.adudasena.mmsystem.model.Produto;
import com.adudasena.mmsystem.model.Usuario;
import com.adudasena.mmsystem.repository.PedidoRepository;
import com.adudasena.mmsystem.repository.ProdutoRepository;
import com.adudasena.mmsystem.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @GetMapping
    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    @PostMapping
    public Pedido salvar(@RequestBody PedidoDTO dto) {
        Pedido pedido = new Pedido();
        pedido.setDataPedido(dto.getDataPedido());

        // Conversão de String para Enum StatusPedido
        if (dto.getStatus() != null) {
            pedido.setStatus(StatusPedido.valueOf(dto.getStatus()));
        }

        pedido.setValorTotal(dto.getValorTotal());

        if (dto.getFkClienteId() != null) {
            Usuario cliente = usuarioRepository.findById(dto.getFkClienteId()).orElse(null);
            pedido.setCliente(cliente);
        }

        List<ItemPedido> itens = new ArrayList<>();
        if (dto.getItens() != null) {
            for (ItemPedidoDTO itemDto : dto.getItens()) {
                Produto produto = produtoRepository.findById(itemDto.getFkProdutoId()).orElse(null);

                ItemPedido item = new ItemPedido();
                item.setPedido(pedido);
                item.setProduto(produto);
                item.setQuantidade(itemDto.getQuantidade());

                itens.add(item);
            }
        }
        pedido.setItens(itens);

        return pedidoRepository.save(pedido);
    }

    @GetMapping("/{id}")
    public Pedido buscarPorId(@PathVariable Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }
}
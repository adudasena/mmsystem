package com.adudasena.mmsystem.service;

import com.adudasena.mmsystem.dto.ClienteDTO;
import com.adudasena.mmsystem.model.Cliente;
import com.adudasena.mmsystem.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository repository;

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
    }

    public Cliente salvar(ClienteDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());
        return repository.save(cliente);
    }

    public Cliente atualizar(Long id, ClienteDTO dto) {
        Cliente cliente = buscarPorId(id);
        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());
        return repository.save(cliente);
    }

    public void excluir(Long id) {
        Cliente cliente = buscarPorId(id);
        cliente.setDeletedAt(LocalDateTime.now()); // Soft Delete aplicado
        repository.save(cliente);
    }
}
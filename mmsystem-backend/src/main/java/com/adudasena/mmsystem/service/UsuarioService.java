package com.adudasena.mmsystem.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.adudasena.mmsystem.dto.UsuarioDTO;
import com.adudasena.mmsystem.model.Usuario;
import com.adudasena.mmsystem.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    public Page<Usuario> listarTodos(Pageable pageable) {
        return repository.findByDeletedAtIsNull(pageable);
    }

    public List<Usuario> listarTodos() {
        return repository.findByDeletedAtIsNull();
    }

    public Usuario buscarPorId(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Cliente/Usuário não encontrado com o ID: " + id));
    }

    public Usuario salvar(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        copiarDtoParaEntidade(dto, usuario);
        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = buscarPorId(id);
        copiarDtoParaEntidade(dto, usuario);
        return repository.save(usuario);
    }

    public void excluir(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setDeletedAt(LocalDateTime.now()); // Soft Delete
        repository.save(usuario);
    }

    private void copiarDtoParaEntidade(UsuarioDTO dto, Usuario usuario) {
        usuario.setNome(dto.getNome());
        usuario.setTelefone(dto.getTelefone());
        usuario.setEmail(dto.getEmail());

        // Define o perfil padrão como CLIENTE caso não venha informado
        if (dto.getPerfil() != null && !dto.getPerfil().isBlank()) {
            usuario.setPerfil(dto.getPerfil());
        } else {
            usuario.setPerfil("CLIENTE");
        }

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(dto.getSenha());
        }
    }
}